"use server";

import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { CUSTOMER_BY_EMAIL_QUERY } from "@/sanity/queries/customers";
import { currentUser } from "@clerk/nextjs/server";

// Note: We are using a simplified version that focuses on Sanity sync first.
// If you want Stripe, uncomment the Stripe related lines and ensure STRIPE_SECRET_KEY is set.
// import Stripe from "stripe";

// const stripe = process.env.STRIPE_SECRET_KEY 
//   ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as any }) // Use compatible version
//   : null;

/** 
 * Gets or creates a Customer in Sanity. 
 * Can be extended to also handle Stripe customers.
 */
export async function getOrCreateCustomer(email: string, name: string | undefined, clerkUserId: string) {
    // 1. Check if customer already exists in Sanity
    const existingCustomer = await client.fetch(CUSTOMER_BY_EMAIL_QUERY, { email });

    if (existingCustomer) {
        // Update existing customer if missing clerkUserId
        if (!existingCustomer.clerkUserId) {
            await writeClient
                .patch(existingCustomer._id)
                .set({ clerkUserId, name }) // Update name too if needed
                .commit();
        }
        return { sanityCustomerId: existingCustomer._id };
    }

    // 2. (Optional) Stripe logic here if needed
    // let stripeCustomerId = "";
    // if (stripe) { ... }

    // 3. Create new customer in Sanity
    const newSanityCustomer = await writeClient.create({
        _type: "customer",
        email,
        name: name || "Unknown Name",
        clerkUserId,
        // stripeCustomerId, 
        createdAt: new Date().toISOString(),
    });

    return { sanityCustomerId: newSanityCustomer._id };
}

export async function createSanityUserAction() {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email;

    if (!email) return null;

    return await getOrCreateCustomer(email, name, user.id);
}
