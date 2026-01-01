import { defineField, defineType } from "sanity";
import { LayersPlus, PackageIcon } from "lucide-react";

export const extraType = defineType({
    name: "extra",
    title: "Extras",
    type: "document",
    icon: LayersPlus,
    fields: [
        defineField({
            name: "name",
            title: "Nombre del Extra",
            type: "string",
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "price",
            title: "Precio",
            type: "number",
            validation: (rule) => rule.required().min(0),
        }),
        defineField({
            name: "description",
            title: "Descripción",
            type: "string",
        }),
        defineField({
            name: "allowQuantity",
            title: "Permitir Cantidad",
            description: "Habilitar si se pueden seleccionar múltiples de este extra (ej. Personas extra)",
            type: "boolean",
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: "name",
            price: "price",
            allowQuantity: "allowQuantity",
        },
        prepare({ title, price, allowQuantity }) {
            return {
                title: title,
                subtitle: `$${price} ${allowQuantity ? "(Cantidad variable)" : ""}`,
            };
        },
    },
});
