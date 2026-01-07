import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentIntentId, amount, metadata } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "PaymentIntent ID required" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Sanitize metadata similar to create
    const cleanMetadata: Record<string, string> = {};

    if (metadata) {
      if (metadata.reservationDate) cleanMetadata.reservationDate = String(metadata.reservationDate);
      if (metadata.locationName) cleanMetadata.locationName = String(metadata.locationName);
      if (metadata.locationAddress) cleanMetadata.locationAddress = JSON.stringify(metadata.locationAddress);
      if (metadata.extras) cleanMetadata.extras = JSON.stringify(metadata.extras);
      if (metadata.customerName) cleanMetadata.customerName = String(metadata.customerName);
      if (metadata.time) cleanMetadata.time = String(metadata.time);
      if (metadata.totalAmount) cleanMetadata.totalAmount = String(metadata.totalAmount); // Ensure total amount is updated if needed
      if (metadata.customerEmail) cleanMetadata.customerEmail = String(metadata.customerEmail);
    }

    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(amount * 100),
      metadata: cleanMetadata
    });

    return NextResponse.json({ success: true, amount: paymentIntent.amount });
  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
