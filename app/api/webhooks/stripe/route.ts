import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!endpointSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET env variable");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("Missing stripe-signature");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

      try {
        const metadata = paymentIntent.metadata;
        // Check if we have necessary metadata to send email
        if (metadata && metadata.reservationDate) {
          // Parse stored JSON strings
          const extras = metadata.extras ? JSON.parse(metadata.extras) : [];
          const locationAddress = metadata.locationAddress ? JSON.parse(metadata.locationAddress) : [];

          // Calculate amounts. Note: amount is in cents
          const amountPaid = paymentIntent.amount / 100;
          // We might need to pass 'total' in metadata too if it differs from amountPaid (e.g. deposit).
          // If not passed, we can assume amountPaid is total for now or calculate.
          // Ideally, we pass 'totalAmount' in metadata from client.

          // Let's assume for now we use what we have, but to be precise the client should pass it.
          // I'll update create-payment-intent to pass 'totalAmount' in metadata as well.
          const totalAmount = metadata.totalAmount ? Number(metadata.totalAmount) : amountPaid;
          const amountPending = totalAmount - amountPaid;

          const customerEmail = paymentIntent.receipt_email || metadata.customerEmail; // We need email target

          if (customerEmail) {
            await sendOrderConfirmationEmail(customerEmail, {
              customerName: metadata.customerName || "Cliente",
              orderNumber: metadata.orderNumber, // This might be set by the 'order.ts' action AFTER webhook if creating order there?
              // Actually, the order creation happens in client -> action.
              // The webhook happens in parallel.
              // If we want the Order Number in the email, we might have a race condition if relying on metadata update.
              // BUT, the email is "Order Confirmation".
              // If we trigger it here, we rely on metadata passed at CREATION time.
              // Let's rely on metadata passed during intent creation/update.
              date: metadata.reservationDate,
              time: metadata.time,
              locationName: metadata.locationName || "Ubicación",
              locationAddress: locationAddress,
              extras: extras,
              total: totalAmount,
              amountPaid: amountPaid,
              amountPending: amountPending
            });
            console.log("Order confirmation email sent to:", customerEmail);
          } else {
            console.log("No email found to send confirmation.");
          }
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
      break;
    case "payment_intent.created":
      console.log("PaymentIntent created");
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
