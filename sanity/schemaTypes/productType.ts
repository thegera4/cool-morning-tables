import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "media", title: "Media" },
    { name: "inventory", title: "Inventory" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("Product name is required")],
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for URL generation"),
      ],
    }),
    defineField({
      name: "description",
      type: "text",
      group: "details",
      rows: 4,
      description: "Descripcion del producto",
    }),
    defineField({
      name: "price",
      type: "number",
      group: "details",
      description: "Precio en MXN (ej. $1990)",
      validation: (rule) => [
        rule.required().error("El precio es necesario."),
        rule.positive().error("El precio debe ser un número positivo"),
      ],
    }),
    defineField({
      name: "dimensions",
      type: "string",
      group: "details",
      description: 'ej. "120cms x 80cms x 75cms"',
    }),
    defineField({
      name: "images",
      type: "array",
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
      name: "stock",
      type: "number",
      group: "inventory",
      initialValue: 0,
      description: "Número de productos en stock",
      validation: (rule) => [
        rule.min(0).error("El stock no puede ser negativo"),
        rule.integer().error("El stock debe ser un número entero"),
      ],
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
        subtitle: `${subtitle ? subtitle + " • " : ""}£${price ?? 0}`,
        media,
      };
    },
  },
});