"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Search, ListCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function Chat() {
  const { user } = useUser();
  const pathname = usePathname();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Has alcanzado el límite de 10 mensajes con el asistente por día.");
          return;
        }
        throw new Error("Network response was not ok");
      }
      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant", content: "", id: (Date.now() + 1).toString() };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...assistantMessage };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={cn(
          "transition-colors hover:cursor-pointer hover:text-brand-teal",
          pathname === "/reservas" ? "text-brand-teal" : "text-white"
        )}>
          <span className="sr-only">Chat AI</span>
          <Bot className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-full md:w-[50vw] sm:max-w-none flex flex-col p-0">
        <div className="absolute inset-0 z-0 bg-[url('/chat_bg.png')] bg-cover bg-center opacity-30 pointer-events-none" />
        <SheetHeader className="p-4 border-b relative z-10">
          <SheetTitle className="flex items-center gap-2 text-brand-teal">
            <Bot className="h-5 w-5" />
            Asistente Cool
          </SheetTitle>
          <SheetDescription className="sr-only">
            Asistente virtual de Cool Morning para ayudarte con reservas y dudas.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 bg-gray-50/50 relative z-10">
          <div className="flex flex-col gap-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col gap-8 py-8 px-4">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-brand-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-6 w-6 text-brand-brown" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Hola!,  ¿Cómo puedo ayudarte hoy?
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                    Puedo ayudarte a encontrar un lugar, verificar tus
                    reservas, cotizarte y más.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                      <Search className="h-3 w-3" />
                      Disponibilidad y precios
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => {
                          const msg = "¿Qué lugares tienen disponibles el dia de hoy?";
                          setInput(msg);
                          handleSend(msg);
                        }}
                        className="text-sm bg-white border border-gray-200 hover:border-brand-teal hover:text-brand-teal text-gray-700 px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        Disponibilidad hoy
                      </button>
                      <button
                        onClick={() => handleSend("¿Donde son las cenas?")}
                        className="text-sm bg-white border border-gray-200 hover:border-brand-teal hover:text-brand-teal text-gray-700 px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        ¿Donde son las cenas?
                      </button>
                      <button
                        onClick={() => handleSend("¿Cuanto cuesta la alberca privada?")}
                        className="text-sm bg-white border border-gray-200 hover:border-brand-teal hover:text-brand-teal text-gray-700 px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        Precio de alberca privada
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                      <ListCheck className="h-3 w-3" />
                      Tus reservas
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleSend("¿Me puedes listar todas mis reservas próximas?")}
                        className="text-sm bg-brand-brown/5 border border-brand-brown/20 hover:border-brand-brown text-brand-brown px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        Listar reservas próximas
                      </button>
                      <button
                        onClick={() => handleSend("¿Me puedes dar información sobre mi próxima reserva?")}
                        className="text-sm bg-brand-brown/5 border border-brand-brown/20 hover:border-brand-brown text-brand-brown px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        Próxima reserva
                      </button>
                      <button
                        onClick={() => handleSend("¿Me puedes decir cual fue el total de mi reserva del dia de ayer?")}
                        className="text-sm bg-brand-brown/5 border border-brand-brown/20 hover:border-brand-brown text-brand-brown px-4 py-2 rounded-full transition-colors duration-200 cursor-pointer"
                      >
                        Total de mi reserva de ayer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 text-sm max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                    m.role === "user"
                      ? "bg-brand-teal text-white border-brand-teal"
                      : "bg-white text-brand-brown border-gray-200"
                  )}
                >
                  {m.role === "user" ? (
                    user?.imageUrl ? (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={user.imageUrl}
                          alt="User"
                          fill
                          className="object-cover"
                          aria-describedby="user-image"
                        />
                      </div>
                    ) : (
                      <User className="h-4 w-4" />
                    )
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-lg shadow-sm whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-brand-teal text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-white text-brand-brown border-gray-200">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            {/* Invisible div to scroll to */}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white relative z-10">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <textarea
              ref={(ref) => {
                if (ref) {
                  // Auto-resize logic
                  ref.style.height = "auto";
                  ref.style.height = `${Math.min(ref.scrollHeight, 72)}px`; // Approx 3 lines (24px line height)
                }
              }}
              rows={1}
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                // Reset height to auto to get correct scrollHeight, then set new height
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 72)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Trigger form submit manually or call handleSubmit
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1 min-h-[40px] max-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-brand-teal hover:bg-brand-teal/90 text-white shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
