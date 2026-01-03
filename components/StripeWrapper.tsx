"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeWrapperProps {
  children: ReactNode;
  clientSecret?: string;
  amount?: number; // Optional passed down amount for reference
}

export function StripeWrapper({ children, clientSecret }: StripeWrapperProps) {
  if (!clientSecret) {
    return <>{children}</>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (<Elements stripe={stripePromise} options={options}>{children}</Elements>);
}