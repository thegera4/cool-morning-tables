"use client";

import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useState } from "react";

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
    const [emailError, setEmailError] = useState<string | null>(null);

    const handleNameChange = (field: "firstName" | "lastName", value: string) => {
        // Only allow letters and spaces (including accents)
        const sanitizedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        setContactInfo({ ...contactInfo, [field]: sanitizedValue });
    };

    const handleEmailChange = (value: string) => {
        setContactInfo({ ...contactInfo, email: value });
        // Clear error when user starts typing again
        if (emailError) setEmailError(null);
    };

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (contactInfo.email && !emailRegex.test(contactInfo.email)) {
            setEmailError("Por favor ingresa un email válido");
        } else {
            setEmailError(null);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits

        // Format as XXX XXX XXXX
        let formattedValue = "";
        if (value.length > 6) {
            formattedValue = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
        } else if (value.length > 3) {
            formattedValue = `${value.slice(0, 3)} ${value.slice(3)}`;
        } else {
            formattedValue = value;
        }

        setContactInfo({ ...contactInfo, phone: formattedValue });
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-2">
                <User className="h-6 w-6 text-brand-brown stroke-[1.5]" />
                <h3 className="text-brand-teal font-bold text-lg">Información de contacto</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Input
                    placeholder="Nombre(s)"
                    value={contactInfo.firstName}
                    onChange={(e) => handleNameChange("firstName", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <Input
                    placeholder="Apellido(s)"
                    value={contactInfo.lastName}
                    onChange={(e) => handleNameChange("lastName", e.target.value)}
                    className="bg-white border-gray-200"
                />
                <div className="space-y-1">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={contactInfo.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={validateEmail}
                        className={`bg-white border-gray-200 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        aria-invalid={!!emailError}
                    />
                    {emailError && <p className="text-xs text-red-500 font-medium">{emailError}</p>}
                </div>
                <Input
                    type="tel"
                    placeholder="Telefono (10 digitos)"
                    value={contactInfo.phone}
                    onChange={handlePhoneChange}
                    className="bg-white border-gray-200"
                    maxLength={12} // 10 digits + 2 spaces
                />
            </div>
        </div>
    );
}