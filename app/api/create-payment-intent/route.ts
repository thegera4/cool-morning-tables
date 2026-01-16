import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateCustomer } from "@/lib/actions/customer";
import { calculateOrderTotal } from "@/lib/pricing";

const stripe = process.env.STRIPE_SECRET_KEY as string
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-12-18.acacia" as any })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json({ error: "Server Configuration Error: Missing Stripe Key" }, { status: 500 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { locationId, extras, payDeposit, metadata } = body;
    const currency = "mxn";

    // Server-side price calculation
    let amount = 0;
    try {
      amount = await calculateOrderTotal(locationId, extras || {}, payDeposit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Pricing Error";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Validating amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid calculated amount" }, { status: 400 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Get or Create Customer
    const { stripeCustomerId } = await getOrCreateCustomer(email, `${user.firstName} ${user.lastName}`, user.id);

    if (!stripeCustomerId) {
      console.error("Failed to get stripeCustomerId for user:", email);
      return NextResponse.json({ error: "Could not create Stripe customer" }, { status: 500 });
    }

    // Sanitize metadata to ensure it fits Stripe limits (50 keys, 500 chars per value)
    // We'll stringify complex objects if needed, but for now we expect flat or simple structures.
    // Important: Stripe metadata values must be strings.
    const cleanMetadata: Record<string, string> = {
      clerkUserId: user.id,
    };

    if (metadata) {
      if (metadata.reservationDate) cleanMetadata.reservationDate = String(metadata.reservationDate);
      if (metadata.locationName) cleanMetadata.locationName = String(metadata.locationName);
      if (metadata.locationAddress) cleanMetadata.locationAddress = JSON.stringify(metadata.locationAddress); // Store array as string
      if (metadata.extras) cleanMetadata.extras = JSON.stringify(metadata.extras); // Store complex object as string
      if (metadata.customerName) cleanMetadata.customerName = String(metadata.customerName);
      if (metadata.time) cleanMetadata.time = String(metadata.time);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: cleanMetadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Internal Error";
    console.error("Internal Error in create-payment-intent:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${message}` },
      { status: 500 }
    );
  }
}
