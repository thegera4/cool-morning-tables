import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateCustomer } from "@/lib/actions/customer";

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
    const { amount, currency = "mxn" } = body;

    // Validating amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        clerkUserId: user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error("Internal Error in create-payment-intent:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
