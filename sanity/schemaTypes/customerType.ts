import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const customerType = defineType({
  name: "customer",
  title: "Customer",
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
      group: "details",
      description: "Nombre completo del cliente",
    }),
    defineField({
      name: "phone",
      type: "string",
      group: "details",
      description: "Número de teléfono del cliente",
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      group: "details",
      description: "ID de Clerk para autenticación",
    }),
    defineField({
      name: "stripeCustomerId",
      type: "string",
      group: "stripe",
      readOnly: true,
      description: "ID de cliente de Stripe para pagos",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
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
        subtitle: [email, phone, stripeCustomerId].filter(Boolean).join(" • "),
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