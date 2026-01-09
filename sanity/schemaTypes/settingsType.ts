import { defineField, defineType } from "sanity";
import { Cog } from "lucide-react";

export const settingsType = defineType({
  name: "settings",
  title: "Configuración Global",
  type: "document",
  icon: Cog,
  fields: [
    defineField({
      name: "isChatEnabled",
      title: "Activar Chatbot de IA",
      description: "Habilita o deshabilita el icono del chat IA.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Configuración Global",
      };
    },
  },
});
