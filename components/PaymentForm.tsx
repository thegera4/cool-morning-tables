
"use client";

import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    const handleNameChange = (value: string) => {
        if (/^[a-zA-Z\s\u00C0-\u00FF]*$/.test(value)) {
            setPaymentInfo({ ...paymentInfo, cardName: value });
        }
    };

    const handleCardNumberChange = (value: string) => {
        const rawValue = value.replace(/\D/g, "");
        const formatted = rawValue.replace(/(\d{4})(?=\d)/g, "$1-").slice(0, 19);
        setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
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
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    placeholder="Numero de Tarjeta"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className="bg-white border-gray-200"
                    maxLength={19}
                />
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex items-center gap-3">
                        <Select
                            value={paymentInfo.expMonth}
                            onValueChange={(value) => handleChange("expMonth", value)}
                        >
                            <SelectTrigger className="bg-white border-gray-200 w-full [&>span]:flex-1 [&>span]:justify-center">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[10rem]">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const month = (i + 1).toString().padStart(2, "0");
                                    return (<SelectItem key={month} value={month}>{month}</SelectItem>);
                                })}
                            </SelectContent>
                        </Select>
                        <span className="text-gray-400 font-medium">/</span>
                        <Input
                            placeholder="Año"
                            value={paymentInfo.expYear}
                            onChange={(e) => handleNumericChange("expYear", e.target.value)}
                            className="bg-white border-gray-200 text-center"
                            maxLength={2}
                        />
                    </div>
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
