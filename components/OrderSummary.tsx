"use client";

import { Location } from "@/lib/data";
import { ContactInfo } from "@/components/ContactForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Minus, Plus } from "lucide-react";
import { createOrder } from "@/lib/actions/order"; // Fixed import path
import { useTransition, useState } from "react";
import { ExtraItem } from "@/components/ExtrasSelector";
// import { PaymentInfo } from "@/components/PaymentForm"; // Removed
import { useStripe, useElements } from "@stripe/react-stripe-js";

interface OrderSummaryProps {
    locationId: string | null;
    location: Location;
    date: Date | undefined;
    time: string | undefined;
    extras: Record<string, number>;
    extrasData: ExtraItem[];
    contactInfo: ContactInfo;
    // paymentInfo: PaymentInfo; // Removed
    onUpdateExtra: (id: string, count: number) => void;
    paymentIntentId: string | undefined;
    payDeposit: boolean;
    setPayDeposit: (val: boolean) => void;
}

export function OrderSummary({ locationId, location, date, time, extras, extrasData, contactInfo, onUpdateExtra, paymentIntentId, payDeposit, setPayDeposit }: OrderSummaryProps) {
    const stripe = useStripe();
    const elements = useElements();

    const selectedLocation = location;
    const [isPending, startTransition] = useTransition();
    // const [payDeposit, setPayDeposit] = useState(false); // Using props now

    const locationPrice = selectedLocation?.price || 0;

    // Calculate extras total
    const extrasTotal = Object.entries(extras).reduce((total, [id, count]) => {
        const extra = extrasData.find((e) => e._id === id);
        if (!extra || !extra.price) return total;
        return total + (extra.price * count);
    }, 0);

    const total = locationPrice + extrasTotal;
    const amountToPay = payDeposit ? total / 2 : total;

    const handleIncrement = (id: string, current: number) => {
        if (current < 10) { onUpdateExtra(id, current + 1); }
    };

    const handleDecrement = (id: string, current: number) => current > 1 ? onUpdateExtra(id, current - 1) : onUpdateExtra(id, 0);

    // Validations for Checkout button
    const isContactInfoComplete = contactInfo.firstName && contactInfo.lastName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) && contactInfo.phone.replace(/\D/g, "").length === 10;
    // Payment validation is now handled by Stripe Elements
    const isValid = locationId && date && isContactInfoComplete;

    // Show empty state if no location, date, or extras
    if (!selectedLocation && !date && Object.keys(extras).length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-400 text-sm italic">
                Selecciona un lugar y fecha para ver el resumen
            </div>
        );
    }

    const handlePayment = async () => {
        if (!stripe || !elements || !isValid || !locationId || !date || !paymentIntentId) { return; }

        startTransition(async () => {
            try {
                // 1. Submit elements details
                const { error: submitError } = await elements.submit();
                if (submitError) {
                    alert(submitError.message);
                    return;
                }

                // 2. Confirm Payment
                const { error, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/success`, // Fallback, though we try to handle inline
                        payment_method_data: {
                            billing_details: {
                                name: `${contactInfo.firstName} ${contactInfo.lastName}`,
                                email: contactInfo.email,
                                phone: contactInfo.phone,
                            }
                        }
                    },
                    redirect: 'if_required',
                });

                if (error) {
                    console.error("Stripe confirm error:", error);
                    alert(error.message);
                } else if (paymentIntent) {
                    console.log("Payment confirmed. Status:", paymentIntent.status);

                    if (paymentIntent.status === 'succeeded') {
                        console.log("Triggering createOrder action...");
                        // 3. Create Order
                        const formattedDate = format(date, "yyyy-MM-dd");
                        const items = Object.entries(extras).map(([id, count]) => {
                            const extra = extrasData.find(e => e._id === id);
                            return { _id: id, quantity: count, price: extra?.price || 0, name: extra?.name };
                        });
                        // Add main location product
                        items.push({ _id: locationId, quantity: 1, price: locationPrice, name: location.name });

                        const result = await createOrder({
                            paymentIntentId: paymentIntent.id,
                            items: items,
                            totalAmount: total,
                            customerName: `${contactInfo.firstName} ${contactInfo.lastName}`,
                            reservationDate: formattedDate,
                            customerPhone: contactInfo.phone
                        });

                        if (result.success) {
                            alert(`¡Orden creada! ID: ${result.orderId}. Gracias por tu compra.`);
                            window.location.reload();
                        } else {
                            alert(`Error creando la orden: ${result.error}`);
                        }
                    }
                }
            } catch (e: any) {
                console.error(e);
                alert("Ocurrio un error inesperado.");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
            {/* Header Title*/}
            <div className="flex items-center gap-3 mb-6">
                <ListChecks className="h-6 w-6 text-amber-700 stroke-[1.5]" />
                <h3 className="text-teal-500 font-bold text-lg">Resumen y Confirmacion</h3>
            </div>
            <div className="space-y-6 flex-1 text-sm text-gray-800">
                {/* Date & Time */}
                {(date || time) && (
                    <div className="space-y-1">
                        <h4 className="font-bold text-teal-500 text-xs uppercase tracking-wider">Fecha y hora:</h4>
                        <p className="font-bold">
                            {date ? format(date, "d / MMMM / yyyy", { locale: es }) : "--"}
                            {time ? ` - ${time} hrs` : ""}
                        </p>
                    </div>
                )}
                {/* Contact Info */}
                {(contactInfo.firstName || contactInfo.lastName || contactInfo.email || contactInfo.phone) && (
                    <div className="space-y-1">
                        <h4 className="font-bold text-teal-500 text-xs uppercase tracking-wider">Datos de contacto:</h4>
                        <p className="font-bold">{contactInfo.firstName} {contactInfo.lastName}</p>
                        {contactInfo.email && <p className="font-medium text-gray-600">{contactInfo.email}</p>}
                        {contactInfo.phone && <p className="font-medium text-gray-600">{contactInfo.phone}</p>}
                    </div>
                )}
                {/* Location */}
                {selectedLocation && (
                    <div className="space-y-1">
                        <h4 className="font-bold text-teal-500 text-xs uppercase tracking-wider">Lugar:</h4>
                        <div className="flex justify-between">
                            <p className="font-bold">{selectedLocation.name}</p>
                            <p className="font-bold">${selectedLocation.price}</p>
                        </div>
                        <p className="font-medium text-gray-600">La Trattoria TRC</p>
                        <p className="font-medium text-gray-600">Allende #138 Pte.</p>
                        <p className="font-medium text-gray-600">Torreon, Coahuila</p>
                    </div>
                )}
                {/* Selected Extras */}
                {Object.keys(extras).length > 0 && (
                    <div className="space-y-1">
                        <h4 className="font-bold text-teal-500 text-xs uppercase tracking-wider">Selecciones:</h4>
                        <div className="space-y-1">
                            {Object.entries(extras).map(([id, count]) => {
                                const extra = extrasData.find(e => e._id === id);
                                if (!extra || count === 0) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span>{extra.name}</span>
                                            {extra.allowQuantity && (
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0 hover:cursor-pointer" onClick={() => handleDecrement(id, count)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-xs w-4 text-center">{count}</span>
                                                    <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0 hover:cursor-pointer" onClick={() => handleIncrement(id, count)} disabled={count >= 10}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <span>{extra.price ? `$${extra.price * count}` : '-'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {/* Total, Checkout Button and Warning Messages Section */}
            <div className="mt-8 pt-4 border-t border-gray-100">
                {/* Deposit Option */}
                <div className="flex items-start space-x-2 mb-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
                    <Checkbox id="deposit" checked={payDeposit} onCheckedChange={(checked) => setPayDeposit(checked as boolean)} />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="deposit"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-teal-700"
                        >
                            Pagar solo el 50% de anticipo
                        </label>
                        <p className="text-xs text-teal-600">
                            El 50% restante deberá liquidarse 2 días antes de la reserva.
                        </p>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <h4 className="font-bold text-teal-500 text-lg">Total a pagar:</h4>
                        {payDeposit && <span className="text-xs text-gray-500">Total de la orden: ${total} mxn</span>}
                    </div>
                    <span className="font-bold text-xl text-gray-900">${amountToPay} mxn</span>
                </div>
                {/* Checkout Button */}
                <Button
                    onClick={handlePayment}
                    disabled={isPending || !isValid || !stripe} // Elements must be loaded
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 text-base shadow-lg shadow-teal-500/20 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Procesando..." : "Pagar"}
                </Button>
                {/* Warning messages for missing required fields */}
                <div className="mt-3 space-y-1">
                    {!date && <p className="text-xs text-amber-600 font-medium flex items-center gap-1">⚠️ Por favor selecciona una fecha</p>}
                    {!isContactInfoComplete && <p className="text-xs text-amber-600 font-medium flex items-center gap-1">⚠️ Información de contacto incompleta</p>}
                </div>
            </div>
        </div>
    );
}