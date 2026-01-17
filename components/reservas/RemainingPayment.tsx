"use client";

import { useState, useTransition } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { updateOrderPaid } from "@/lib/actions/order";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface RemainingPaymentProps {
  orderId: string;
  amount: number;
}

function CheckoutForm({ orderId, amount }: { orderId: string, amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message);
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/reservas`, // Usually not redirected if redirect: 'if_required'
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || "Error al procesar el pago");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {

        // Update order status server-side
        const result = await updateOrderPaid(orderId, paymentIntent.id, amount);

        if (result.success) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999,
          });
          toast.success("Gracias por completar tu pago!🎉. Se enviará un email de confirmación ✉️.", {
            className: "!bg-green-50 !text-green-600 !border-green-200",
            style: { color: 'green' },
            duration: 5000,
          });
          router.refresh();
          // Force reload to ensure all states clear if needed, or just router.refresh is enough
          // setTimeout(() => window.location.reload(), 2000);
        } else {
          toast.error("El pago fue exitoso pero hubo un error actualizando la orden. Contacta soporte.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-bold hover:cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          `Pagar ${formatCurrency(amount)}`
        )}
      </Button>
    </form>
  );
}

export function RemainingPayment({ orderId, amount }: RemainingPaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <Button
        onClick={initializePayment}
        className="w-full lg:w-auto lg:px-8 mt-4 bg-brand-brown text-white hover:bg-brand-brown/90 hover:cursor-pointer"
      >
        Pagar Restante ({formatCurrency(amount)})
      </Button>
    );
  }

  return (
    <div className="mt-4 p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm orderId={orderId} amount={amount} />
      </Elements>
    </div>
  );
}
