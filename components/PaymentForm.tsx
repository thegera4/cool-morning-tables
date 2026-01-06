"use client";

import { PaymentElement } from "@stripe/react-stripe-js";
import { CreditCard } from "lucide-react";

export interface PaymentInfo {
    // Keeping interface for compatibility if needed elsewhere, 
    // but fields are now handled by Stripe
    cardName: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
}

interface PaymentFormProps {
    onComplete: (completed: boolean) => void;
}

export function PaymentForm({ onComplete }: PaymentFormProps) {
    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-6 w-6 text-brand-brown stroke-[1.5]" />
                <h3 className="text-brand-teal font-bold text-lg">Pago</h3>
            </div>

            <div className="flex flex-col gap-4">
                <PaymentElement
                    onChange={(event) => onComplete(event.complete)}
                    options={{
                        layout: 'tabs',
                        business: { name: 'Cool Morning' }
                    }}
                />
            </div>
        </div>
    );
}
