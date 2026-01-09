import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDERS_QUERY } from "@/sanity/queries/orders";

// Create DeepSeek provider using OpenAI compatibility
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
  fetch: async (url, options) => {
    if (options && options.body) {
      try {
        const body = JSON.parse(options.body as string);
        if (body.tools) {
          body.tools = body.tools.map((t: any) => {
            if (t.function?.parameters && !t.function.parameters.type) {
              t.function.parameters.type = "object";
            }
            return t;
          });
          options.body = JSON.stringify(body);
        }
      } catch (e) {
        // failed to parse body, ignore
      }
    }
    return fetch(url, options);
  },
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!Array.isArray(messages)) {
    return new Response("Messages must be an array", { status: 400 });
  }

  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const email = user.emailAddresses[0]?.emailAddress;

  const result = streamText({
    model: deepseek.chat("deepseek-chat"),
    messages: convertToCoreMessages(messages),
    system: `Eres un asistente útil y amable para "Cool Morning Cenas", un restaurante de experiencias románticas.
    Tu objetivo es ayudar a los usuarios a consultar sus pedidos y reservas.
    SOLO responde preguntas relacionadas con las reservasdel usuario.
    Si te preguntan sobre otros temas, explica amablemente que solo puedes ayudar con información de sus reservas.
    Habla siempre en español.
    Usa la herramienta getOrders para buscar información sobre las reservas del usuario (pasa "fetch" como argumento).`,
    tools: {
      getOrders: tool({
        description: "Obtener la lista de pedidos y reservas del usuario actual",
        parameters: z.object({
          reason: z.string().describe("El motivo de la consulta"),
        }),
        // @ts-ignore
        execute: async ({ reason }: { reason: string }) => {
          const { data: orders } = await sanityFetch({
            query: ORDERS_QUERY,
            params: {
              userId: user.id,
              userEmail: email,
            },
          });
          return orders;
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toTextStreamResponse();
}

function convertToCoreMessages(messages: any[]) {
  return messages.map((m) => ({
    role: m.role,
    content:
      m.content ||
      m.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("") ||
      "",
  }));
}
