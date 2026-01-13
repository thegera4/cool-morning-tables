import { defineField, defineType } from "sanity";
import { Cog } from "lucide-react";

export const settingsType = defineType({
  name: "settings",
  title: "Configuración Global",
  type: "document",
  icon: Cog,
  fields: [
    /* AI Chat */
    defineField({
      name: "isChatEnabled",
      title: "Activar Chatbot de IA",
      description: "Habilita o deshabilita el icono del chat IA.",
      type: "boolean",
      initialValue: true,
    }),
    /* Hero Section */
    defineField({
      name: "heroTitle",
      title: "Título de la sección principal",
      type: "string",
      initialValue: "Experiencias Únicas",
    }),
    defineField({
      name: "heroDescription",
      title: "Descripción de la sección principal",
      type: "text",
      rows: 3,
      initialValue: "Cool Morning es tu aliado perfecto para esas ocasiones especiales con tus seres queridos.",
    }),
    defineField({
      name: "heroImage",
      title: "Imagen de la sección principal",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Texto alternativo",
        },
      ],
    }),
    /* Product Selection Section */
    defineField({
      name: "productSelectionTitle",
      title: "Título de Selección de Producto",
      type: "string",
      initialValue: "Selecciona tu lugar:",
    }),
    defineField({
      name: "productSelectionDescription",
      title: "Descripción de Selección de Producto",
      type: "text",
      rows: 2,
      initialValue: "Da click sobre tu locacion preferida para continuar con tu compra.",
    }),
    /* Features Section */
    defineField({
      name: "features",
      title: "Características y Servicios",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Título",
              type: "string",
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "icon",
              title: "Icono",
              type: "string",
              options: {
                list: [
                  { title: "HandHeart (Mano con corazón)", value: "HandHeart" },
                  { title: "Clock8 (Reloj)", value: "Clock8" },
                  { title: "Hourglass (Reloj de arena)", value: "Hourglass" },
                  { title: "Sparkles (Brillos)", value: "Sparkles" },
                  { title: "UsersRound (Usuarios)", value: "UsersRound" },
                  { title: "Mail (Correo)", value: "Mail" },
                  { title: "Heart (Corazón)", value: "Heart" },
                  { title: "Gift (Regalo)", value: "Gift" },
                  { title: "Music (Música)", value: "Music" },
                  { title: "Utensils (Cubiertos)", value: "Utensils" },
                  { title: "Wine (Vino/Copa)", value: "Wine" },
                  { title: "Cake (Pastel/Cumpleaños)", value: "Cake" },
                  { title: "Camera (Cámara/Fotos)", value: "Camera" },
                  { title: "Calendar (Calendario)", value: "Calendar" },
                  { title: "MapPin (Ubicación)", value: "MapPin" },
                  { title: "CreditCard (Tarjeta/Pago)", value: "CreditCard" },
                  { title: "Info (Información)", value: "Info" },
                  { title: "ShieldCheck (Seguridad)", value: "ShieldCheck" },
                  { title: "Star (Estrella/Calidad)", value: "Star" },
                  { title: "Phone (Teléfono)", value: "Phone" },
                  { title: "Car (Auto/Estacionamiento)", value: "Car" },
                  { title: "Moon (Luna/Noche)", value: "Moon" },
                  { title: "Sun (Sol/Día)", value: "Sun" },
                  { title: "Flower (Flor/Decoración)", value: "Flower" },
                  { title: "Gem (Diamante/Premium)", value: "Gem" },
                  { title: "PartyPopper (Fiesta)", value: "PartyPopper" },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "description",
            },
          },
        },
      ],
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
