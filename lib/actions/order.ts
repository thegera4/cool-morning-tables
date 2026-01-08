"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customer";
import { randomUUID } from "crypto";
import { client } from "@/sanity/lib/client";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover" as any,
});

interface CreateOrderParams {
  paymentIntentId: string;
  items: any[]; // refine type as needed
  totalAmount: number;
  customerName?: string;
  reservationDate: string;
  customerPhone?: string;
  time?: string;
  locationName: string;
  locationAddress: string[];
}

export async function createOrder({ paymentIntentId, items, totalAmount, customerName, reservationDate, customerPhone, time, locationName, locationAddress }: CreateOrderParams) {
  console.log("createOrder action called with:", { paymentIntentId, totalAmount, itemsCount: items.length });
  try {
    const user = await currentUser();
    if (!user) { throw new Error("Unauthorized"); }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Email required");

    // 1. Verify Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    // 2. Ensure Customer Exists in Sanity
    const { sanityCustomerId, stripeCustomerId } = await getOrCreateCustomer(email, customerName || `${user.firstName} ${user.lastName}`, user.id, customerPhone);

    // 2.5 Resolve Product IDs (Handle slugs vs IDs)
    const resolvedItems = await Promise.all(items.map(async (item: any) => {
      // Try to find product by ID or Slug (check both 'product' and 'extra' types)
      const query = `*[(_type == "product" || _type == "extra") && (_id == $id || slug.current == $id)][0]{_id, _type}`;
      const resolved = await client.fetch(query, { id: item._id });

      if (!resolved?._id) {
        console.warn(`Item not found for ID/Slug: ${item._id}. Skipping or handling gracefullly.`);
        throw new Error(`Item not found: ${item._id}`);
      }

      return {
        ...item,
        _resolved: resolved
      };
    }));


    // 3. Create Order in Sanity
    const amountPaidInCents = paymentIntent.amount;
    const amountPaid = amountPaidInCents / 100;
    const amountPending = totalAmount - amountPaid;

    const status = amountPending > 0 ? "deposito" : "pagada";

    const orderNumberVal = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

    const order = await writeClient.create({
      _type: "order",
      orderNumber: orderNumberVal,
      reservationDate: reservationDate, // Use passed date
      items: resolvedItems.map((item: any) => ({
        _type: "object",
        _key: item._resolved._id, // Use resolved ID for key
        product: { _type: "reference", _ref: item._resolved._id },
        quantity: item.quantity || 1,
        priceAtPurchase: item.price,
      })),
      total: totalAmount,
      amountPaid: amountPaid,
      amountPending: amountPending,
      status: status,
      customer: { _type: "reference", _ref: sanityCustomerId },
      clerkUserId: user.id,
      email: email,
      stripePaymentId: paymentIntentId,
      source: "web",
      createdAt: new Date().toISOString(),
    });

    // Update Stripe Metadata with Order Number
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        orderNumber: orderNumberVal
      }
    });

    // 4. Update Product Blocked Dates
    await Promise.all(resolvedItems.map(async (item: any) => {
      if (item._resolved._type === 'product') {
        await writeClient
          .patch(item._resolved._id)
          .setIfMissing({ blockedDates: [] })
          .append('blockedDates', [reservationDate])
          .commit({ autoGenerateArrayKeys: true });
      }
    }));

    // 5. Send order confirmation email
    console.log("Sending order confirmation email for order:", orderNumberVal);
    await sendOrderConfirmationEmail(email, {
      customerName: customerName || `${user.firstName} ${user.lastName}`,
      orderNumber: orderNumberVal,
      date: reservationDate,
      time: time,
      locationName: locationName,
      locationAddress: locationAddress,
      extras: items.filter((item: any) => item._id !== locationName && item.name !== locationName).map((item: any) => ({
        name: item.name || "Extra",
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      total: totalAmount,
      amountPaid: amountPaid,
      amountPending: amountPending
    });

    return { success: true, orderId: order._id };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}
