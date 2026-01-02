import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const customerType = defineType({
  name: "customer",
  title: "Clientes",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "details", title: "Información del Cliente", default: true },
    { name: "stripe", title: "Información de Stripe" },
  ],
  fields: [
    defineField({
      name: "email",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("El email es requerido")],
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Nombre completo",
      group: "details",
      validation: (rule) => [rule.required().error("El nombre es requerido")],
    }),
    defineField({
      name: "phone",
      type: "string",
      title: "Teléfono",
      group: "details"
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      title: "ID en Clerk",
      group: "details",
      readOnly: true,
    }),
    defineField({
      name: "stripeCustomerId",
      type: "string",
      title: "ID en Stripe",
      group: "stripe",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Fecha de creación",
      group: "details",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      email: "email",
      name: "name",
      stripeCustomerId: "stripeCustomerId",
      phone: "phone",
    },
    prepare({ email, name, stripeCustomerId, phone }) {
      return {
        title: name ?? email ?? "Unknown Customer",
        subtitle: [email,].filter(Boolean).join(" • "),
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Email A-Z",
      name: "emailAsc",
      by: [{ field: "email", direction: "asc" }],
    },
  ],
});