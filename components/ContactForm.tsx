
"use client";

import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export interface ContactInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface ContactFormProps {
    contactInfo: ContactInfo;
    setContactInfo: (info: ContactInfo) => void;
}

export function ContactForm({ contactInfo, setContactInfo }: ContactFormProps) {
    const handleChange = (field: keyof ContactInfo, value: string) => {
        setContactInfo({ ...contactInfo, [field]: value });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits

        // Format as XX-XX-XX-XX-XX
        let formattedValue = "";
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 2 === 0) {
                formattedValue += "-";
            }
            formattedValue += value[i];
        }

        setContactInfo({ ...contactInfo, phone: formattedValue });
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-2">
                <User className="h-6 w-6 text-brand-brown stroke-[1.5]" />
                <h3 className="text-brand-teal font-bold text-lg">Informacion de contacto</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Input
                    placeholder="Nombre(s)"
                    value={contactInfo.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    placeholder="Apellido(s)"
                    value={contactInfo.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    type="email"
                    placeholder="Email"
                    value={contactInfo.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    type="tel"
                    placeholder="Telefono (10 digitos)"
                    value={contactInfo.phone}
                    onChange={handlePhoneChange}
                    className="bg-white border-gray-200"
                    maxLength={14} // 10 digits + 4 hyphens
                />
            </div>
        </div>
    );
}
