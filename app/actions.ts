"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

export async function bookProduct(slug: string, date: string) {
    try {
        // 1. Find the document ID for the product with the given slug
        const product = await writeClient.fetch(
            `*[_type == "product" && slug.current == $slug][0]._id`,
            { slug }
        );

        if (!product) {
            throw new Error("Product not found");
        }

        // 2. Patch the document to append the date to blockedDates
        await writeClient
            .patch(product)
            .setIfMissing({ blockedDates: [] })
            .append("blockedDates", [date])
            .commit();

        revalidatePath("/"); // Revalidate cache to show updated availability
        return { success: true };
    } catch (error) {
        console.error("Error booking product:", error);
        return { success: false, error: "Failed to book date" };
    }
}
