import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Productos",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "details", title: "Detalles", default: true },
    { name: "media", title: "Fotos" }
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Nombre del producto",
      group: "details",
      validation: (rule) => [rule.required().error("El nombre es necesario.")],
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Identificador",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("El identificador es necesario para generar la URL."),
      ],
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Descripción del producto",
      group: "details",
      rows: 4,
      validation: (rule) => [rule.required().error("La descripción es necesaria.")],
    }),
    defineField({
      name: "price",
      type: "number",
      title: "Precio en MXN",
      group: "details",
      validation: (rule) => [
        rule.required().error("El precio es necesario."),
        rule.positive().error("El precio debe ser un número positivo"),
      ],
    }),
    defineField({
      name: "images",
      type: "array",
      title: "Fotos del producto",
      group: "media",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (rule) => [
        rule.min(1).error("Al menos una imagen es requerida"),
      ],
    }),
    defineField({
      name: "blockedDates",
      title: "Fechas bloqueadas",
      type: "array",
      of: [{ type: "date" }],
      group: "details",
      options: {
        sortable: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category.title",
      media: "images.0",
      price: "price",
    },
    prepare({ title, subtitle, media, price }) {
      return {
        title,
        subtitle: `${subtitle ? subtitle + " • " : ""}$${price ?? 0}`,
        media,
      };
    },
  },
});