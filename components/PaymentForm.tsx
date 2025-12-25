
"use client";

import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

export interface PaymentInfo {
    cardName: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvv: string;
}

interface PaymentFormProps {
    paymentInfo: PaymentInfo;
    setPaymentInfo: (info: PaymentInfo) => void;
}

export function PaymentForm({ paymentInfo, setPaymentInfo }: PaymentFormProps) {
    const handleChange = (field: keyof PaymentInfo, value: string) => {
        setPaymentInfo({ ...paymentInfo, [field]: value });
    };

    const handleNumericChange = (field: keyof PaymentInfo, value: string) => {
        if (/^\d*$/.test(value)) {
            setPaymentInfo({ ...paymentInfo, [field]: value });
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-6 w-6 text-amber-700 stroke-[1.5]" />
                <h3 className="text-teal-500 font-bold text-lg">Pago</h3>
            </div>

            <div className="flex flex-col gap-4">
                <Input
                    placeholder="Nombre en tarjeta"
                    value={paymentInfo.cardName}
                    onChange={(e) => handleChange("cardName", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    placeholder="Numero de Tarjeta"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handleNumericChange("cardNumber", e.target.value)}
                    className="bg-white border-gray-200"
                    maxLength={16}
                />
                <div className="grid grid-cols-3 gap-3">
                    <Input
                        placeholder="Mes"
                        value={paymentInfo.expMonth}
                        onChange={(e) => handleNumericChange("expMonth", e.target.value)}
                        className="bg-white border-gray-200 text-center"
                        maxLength={2}
                    />
                    <Input
                        placeholder="Año"
                        value={paymentInfo.expYear}
                        onChange={(e) => handleNumericChange("expYear", e.target.value)}
                        className="bg-white border-gray-200 text-center"
                        maxLength={2}
                    />
                    <Input
                        placeholder="CVV"
                        value={paymentInfo.cvv}
                        onChange={(e) => handleNumericChange("cvv", e.target.value)}
                        className="bg-white border-gray-200 text-center"
                        maxLength={3}
                    />
                </div>
            </div>
        </div>
    );
}
