"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customer";
import { randomUUID } from "crypto";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { sendOrderConfirmationEmail, sendRemainingPaymentEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover" as any,
});

interface CreateOrderParams {
  paymentIntentId: string;
  items: { _id: string; quantity: number; price: number; name?: string }[];
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

  // Server-side validation
  if (customerName) {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(customerName)) {
      return { success: false, error: "Invalid name format. Only letters and spaces are allowed." };
    }
  }

  if (customerPhone) {
    const phoneDigits = customerPhone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return { success: false, error: "Invalid phone number. Must be 10 digits." };
    }
  }

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
    const resolvedItems = await Promise.all(items.map(async (item) => {
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
      items: resolvedItems.map((item) => ({
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
    await Promise.all(resolvedItems.map(async (item) => {
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
      extras: items.filter((item) => item._id !== locationName && item.name !== locationName).map((item) => ({
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

export async function updateOrderPaid(orderId: string, paymentIntentId: string, amount: number) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Stripe Payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error("Payment not succeeded");
    }

    // Fetch Full Order Details (with expanded references)
    const order = await sanityFetch({
      query: `*[_type == "order" && _id == $id][0]{
        ...,
        customer->,
        items[]{
          ...,
          product->
        }
      }`,
      params: { id: orderId }
    }).then(res => res.data);

    if (!order) throw new Error("Order not found");

    // Calculate new amounts
    const amountPaid = (order.amountPaid || 0) + amount;
    const amountPending = 0; // Fully paid

    // Update Order
    await writeClient.patch(orderId)
      .set({
        status: 'pagada',
        amountPending: amountPending,
        amountPaid: amountPaid,
      })
      .commit();

    // Prepare Email Details
    // Find main location product
    const locationItem = order.items?.find((item: any) => item.product?._type === 'product');
    const locationName = locationItem?.product?.name || "Ubicación desconocida";

    // Address Logic (mirrored from frontend)
    const isAlberca = locationName.toLowerCase().trim() === "alberca privada";
    const locationAddress = isAlberca ? [
      "Andrés Villarreal 191",
      "Col. División del Norte",
      "Torreón, Coahuila"
    ] : [
      "La Trattoria TRC",
      "Allende 138 Pte.",
      "Torreon, Coahuila"
    ];

    const extras = order.items
      ?.filter((item: any) => item._key !== locationItem?._key && item.product?._type === 'extra') // Exclude main location
      .map((item: any) => ({
        name: item.product?.name || "Extra",
        quantity: item.quantity || 1,
        price: item.priceAtPurchase || 0
      })) || [];

    // Send Email
    if (order.customer?.email) {
      await sendRemainingPaymentEmail(order.customer.email, {
        customerName: order.customer.name || "Cliente",
        orderNumber: order.orderNumber,
        date: order.reservationDate,
        amountPaidNow: amount,
        totalPaid: amountPaid,
        locationName,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }
}
