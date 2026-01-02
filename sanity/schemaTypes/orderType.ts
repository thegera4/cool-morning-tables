import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { ORDER_STATUS_SANITY_LIST, getOrderStatus } from "@/lib/constants/orderStatus";

export const orderType = defineType({
  name: "order",
  title: "Ordenes",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "details", title: "Detalles", default: true },
    { name: "customer", title: "Cliente" },
    { name: "payment", title: "Pago" },
  ],
  fields: [
    defineField({
      name: "orderNumber",
      type: "string",
      title: "Número de Orden",
      group: "details",
      readOnly: true,
      validation: (rule) => [rule.required().error("El número de orden es requerido")],
    }),
    defineField({
      name: "reservationDate",
      type: "date",
      title: "Fecha de reservación",
      group: "details"
    }),
    defineField({
      name: "items",
      type: "array",
      title: "Detalle de las selecciones incluidas en la orden",
      group: "details",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              type: "reference",
              title: "Producto",
              to: [{ type: "product" }, { type: "extra" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "quantity",
              type: "number",
              title: "Cantidad",
              initialValue: 1,
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "priceAtPurchase",
              type: "number",
              title: "Precio",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "product.name",
              quantity: "quantity",
              price: "priceAtPurchase",
              media: "product.images.0",
            },
            prepare({ title, quantity, price, media }) {
              return {
                title: title ?? "Product",
                subtitle: `Cantidad: ${quantity} • $${price}`,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "total",
      type: "number",
      title: "Total de la orden en MXN",
      group: "details",
      readOnly: true
    }),
    defineField({
      name: "amountPaid",
      type: "number",
      title: "Cantidad pagada por el cliente en la web",
      group: "payment"
    }),
    defineField({
      name: "amountPending",
      type: "number",
      title: "Cantidad pendiente a pagar (2 días antes de la reserva)",
      group: "payment",
      readOnly: true,
      initialValue: (value) => value.total - value.amountPaid
    }),
    defineField({
      name: "status",
      type: "string",
      group: "details",
      initialValue: "Pagada",
      options: {
        list: ORDER_STATUS_SANITY_LIST,
        layout: "radio",
      },
    }),
    defineField({
      name: "customer",
      type: "reference",
      title: "Información del cliente",
      to: [{ type: "customer" }],
      group: "customer"
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      title: "ID de usuario en Clerk",
      group: "customer",
      readOnly: true
    }),
    defineField({
      name: "email",
      type: "string",
      group: "customer",
      readOnly: true
    }),
    defineField({
      name: "stripePaymentId",
      type: "string",
      title: "ID de pago en Stripe",
      group: "payment",
      readOnly: true
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Fecha de creación de la orden",
      group: "details",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      orderNumber: "orderNumber",
      email: "email",
      total: "total",
      status: "status",
    },
    prepare({ orderNumber, email, total, status }) {
      const statusLabel = getOrderStatus(status).label;
      return {
        title: `Order ${orderNumber ?? "N/A"}`,
        subtitle: `$${total ?? 0} • ${statusLabel}`,
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});