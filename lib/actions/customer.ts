"use server";

import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { CUSTOMER_BY_EMAIL_QUERY } from "@/sanity/queries/customers";
import { currentUser } from "@clerk/nextjs/server";

// Note: We are using a simplified version that focuses on Sanity sync first.
// If you want Stripe, uncomment the Stripe related lines and ensure STRIPE_SECRET_KEY is set.
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-12-15.clover" as any }) // Use compatible version
    : null;

/** Gets or creates a Customer in Sanity. Can be extended to also handle Stripe customers. */
export async function getOrCreateCustomer(email: string, name: string | undefined, clerkUserId: string, phone?: string) {
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

        // Update phone if provided and different
        if (phone && (!existingCustomer.phone || existingCustomer.phone !== phone)) {
            await writeClient
                .patch(existingCustomer._id)
                .set({ phone })
                .commit();
        }

        // Backfill Stripe Customer ID if missing
        if (!existingCustomer.stripeCustomerId && stripe) {
            try {
                let stripeCustomerId = "";
                const customers = await stripe.customers.list({ email: email });

                if (customers.data.length > 0) {
                    stripeCustomerId = customers.data[0].id;
                } else {
                    const newCustomer = await stripe.customers.create({
                        email: email,
                        name: name,
                        phone: phone, // Pass phone to Stripe too
                        metadata: { clerkUserId: clerkUserId },
                    });
                    stripeCustomerId = newCustomer.id;
                }

                // Patch Sanity with new Stripe ID
                await writeClient
                    .patch(existingCustomer._id)
                    .set({ stripeCustomerId })
                    .commit();

                return { sanityCustomerId: existingCustomer._id, stripeCustomerId };
            } catch (error) {
                console.error("Error backfilling Stripe ID:", error);
                // Return without stripe ID if failed, but logged
            }
        }

        return { sanityCustomerId: existingCustomer._id, stripeCustomerId: existingCustomer.stripeCustomerId };
    }

    // 2. (Optional) Stripe logic here if needed
    let stripeCustomerId = "";
    if (stripe) {
        try {
            const customers = await stripe.customers.list({ email: email });
            if (customers.data.length > 0) {
                stripeCustomerId = customers.data[0].id;
            } else {
                const newCustomer = await stripe.customers.create({
                    email: email,
                    name: name,
                    phone: phone,
                    metadata: { clerkUserId: clerkUserId },
                });
                stripeCustomerId = newCustomer.id;
            }
        } catch (error) {
            console.error("Error creating/fetching Stripe customer:", error);
            // Optionally throw or continue without Stripe ID, but logging is key
        }
    } else {
        console.warn("Stripe client not initialized in getOrCreateCustomer");
    }

    // 3. Create new customer in Sanity
    const newSanityCustomer = await writeClient.create({
        _type: "customer",
        email,
        name: name || "Unknown Name",
        phone,
        clerkUserId,
        stripeCustomerId: stripeCustomerId || undefined,
        createdAt: new Date().toISOString(),
    });

    return { sanityCustomerId: newSanityCustomer._id, stripeCustomerId: stripeCustomerId };
}

export async function createSanityUserAction() {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email;

    if (!email) return null;

    return await getOrCreateCustomer(email, name, user.id);
}
