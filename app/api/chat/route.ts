import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDERS_QUERY } from "@/sanity/queries/orders";
import { PRODUCTS_QUERY } from "@/sanity/queries/products";
import { ALL_EXTRAS_QUERY } from "@/sanity/queries/extras";

// Helper interfaces
interface ToolFunction {
  parameters?: { type?: string;[key: string]: any };
}
interface ToolItem {
  function?: ToolFunction;
  [key: string]: any;
}


// Create DeepSeek provider using OpenAI compatibility
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
  fetch: async (url, options) => {
    if (options && options.body) {
      try {
        const body = JSON.parse(options.body as string);
        if (body.tools) {
          body.tools = body.tools.map((t: ToolItem) => {
            if (t.function?.parameters && !t.function.parameters.type) {
              t.function.parameters.type = "object";
            }
            return t;
          });
          options.body = JSON.stringify(body);
        }
      } catch (e) {
        console.error("Failed to parse body: ", e);
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

  const cookieStore = await cookies();
  const usageCount = parseInt(cookieStore.get("chat_usage_count")?.value || "0", 10);

  if (usageCount >= 10) {
    return new Response("Limit of 10 requests per session reached", { status: 429 });
  }

  const result = streamText({
    model: deepseek.chat("deepseek-chat"),
    messages: convertToCoreMessages(messages),
    system: `Eres un asistente útil y amable para "Cool Morning", un restaurante de experiencias románticas.
    Tu objetivo es ayudar a los usuarios a consultar sus pedidos y reservas, asi como proveer información sobre el servicio que se ofrece,
    incluyendo la lista de lugares disponibles, el calendario con la disponibilidad de cada lugar, los extras disponibles y los precios.
    
    Cool Morning esta localizado en Torreón, Coahuila, México, por lo que la fecha y hora actual del sistema: ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
    
    Reglas importantes y críticas:
    - SOLO responde preguntas relacionadas con las reservas del usuario, los precios de todos los productos y extras que ofrece cool morning,y la disponibilidad de los lugares.
    - Si te preguntan sobre otros temas, explica amablemente que solo puedes ayudar con información de sus reservas,de los precios y la disponibilidad de los lugares.
    - Habla siempre en español.
    - Usa la herramienta getCurrentDate para buscar la fecha actual en el sistema, ya que muchas veces va a preguntar sobre sus reservas mas cercanas y necesitas saber la fecha actual para tener la referencia correcta.
    - Usa la herramienta getOrders para buscar información sobre las reservas del usuario (pasa "fetch" como argumento).
    - Usa la herramienta getPlaces para buscar información sobre los lugares disponibles.
    - Usa la herramienta getPrices para buscar información sobre los precios de todos los productos y extras que ofrece cool morning.
    - Nunca termines tu respuesta con una pregunta de seguimiento, solo da la información que el usuario pide deja que el usuario decida lo que quiere hacer despues o si quiere seguir haciendo mas preguntas.

    Formato de respuestas:
    Cada vez que des una respuesta, trata de usuar emojis, en lugar de otros caracteres para hacer la respuesta agradable y amigable.
    
    **IMPORTANTE - Mostrar información de reservas/órdenes:**
    Cuando el usuario pregunte sobre sus reservas u órdenes, debes usar un formato especial para que la interfaz muestre tarjetas visuales bonitas en lugar de solo texto.
    
    Para CADA orden/reserva que quieras mostrar, usa este formato exacto:
    [ORDER_CARD]
    {JSON completo del objeto order aquí}
    [/ORDER_CARD]
    
    **MUY IMPORTANTE:** Cuando muestres tarjetas ORDER_CARD, NO repitas la información que ya está visible en la tarjeta.
    La tarjeta ya muestra: orden #, fecha, hora, lugar, items, estado de pago, y total.
    Solo da un mensaje breve de contexto antes de la tarjeta, por ejemplo:
    - "Aquí está tu próxima reserva:" o "Estas son tus reservas:" 
    - NO escribas detalles adicionales después de la tarjeta como fecha, lugar, extras, total, etc.
    - La tarjeta es suficiente, el usuario puede ver toda la información ahí.
    
    Por ejemplo, BUENA respuesta:
    "¡Claro! 😊 Aquí está la información de tu próxima reserva:
    
    [ORDER_CARD]
    {JSON completo aquí}
    [/ORDER_CARD]
    
    ¡Tu experiencia romántica está casi lista! 💕"
    
    MALA respuesta (NO hacer esto):
    "¡Claro! Aquí está tu reserva:
    [ORDER_CARD]...
    [/ORDER_CARD]
    **Detalles de tu próxima reserva:**
    - Fecha: 11 de enero...
    - Lugar: Terraza Privada...
    - Total: $2,890..."
    
    - Siempre incluye el objeto JSON completo entre [ORDER_CARD] y [/ORDER_CARD]
    - El JSON debe tener los campos: orderNumber, reservationDate, status, total, items, amountPaid, amountPending
    - Si hay múltiples órdenes, usa múltiples bloques [ORDER_CARD]...[/ORDER_CARD]
    
    -Si el usuario pregunta sobre el precio de un producto o extra, o pide una cotización de varias cosas,responde con este formato siempre:
      📄 Producto(s): {producto o extra a cotizar}
      💲 Precio: {precio}
      💰 Total: {total}
    `,
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
      getCurrentDate: tool({
        description: "Obtener la fecha y hora actual del sistema para referencias temporales",
        parameters: z.object({}),
        // @ts-ignore
        execute: async () => { return new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }); },
      }),
      getPlaces: tool({
        description: "Obtener información sobre los lugares (productos) disponibles, incluyendo precios y fechas bloqueadas",
        parameters: z.object({}),
        // @ts-ignore
        execute: async () => {
          const { data: places } = await sanityFetch({ query: PRODUCTS_QUERY });
          return places;
        },
      }),
      getPrices: tool({
        description: "Obtener todos los precios de los productos (lugares) y extras disponibles",
        parameters: z.object({}),
        // @ts-ignore
        execute: async () => {
          const [products, extras] = await Promise.all([
            sanityFetch({ query: PRODUCTS_QUERY }),
            sanityFetch({ query: ALL_EXTRAS_QUERY }),
          ]);
          return {
            products: products.data,
            extras: extras.data,
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  const response = result.toTextStreamResponse();
  response.headers.set("Set-Cookie", `chat_usage_count=${usageCount + 1}; Path=/; Max-Age=72000; HttpOnly; SameSite=Strict`);
  return response;
}

function convertToCoreMessages(messages: any[]): any[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content
  }));
}
