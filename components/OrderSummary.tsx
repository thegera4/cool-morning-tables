
"use client";

import { LOCATIONS, EXTRAS, Location } from "@/lib/data";
import { ContactInfo } from "@/components/ContactForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

interface OrderSummaryProps {
    locationId: string | null;
    date: Date | undefined;
    time: string | undefined;
    extras: Record<string, number>;
    contactInfo: ContactInfo;
}

export function OrderSummary({ locationId, date, time, extras, contactInfo }: OrderSummaryProps) {
    const selectedLocation = LOCATIONS.find((l) => l.id === locationId);

    // Calculate Totals
    const locationPrice = selectedLocation?.price || 0;

    const extrasTotal = Object.entries(extras).reduce((total, [id, count]) => {
        const extra = EXTRAS.find((e) => e.id === id);
        if (!extra || !extra.price) return total;
        return total + (extra.price * count);
    }, 0);

    const total = locationPrice + extrasTotal;

    if (!selectedLocation && !date && Object.keys(extras).length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-400 text-sm italic">
                Selecciona un lugar y fecha para ver el resumen
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
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
                            {/* Add address from design if needed, using hardcoded address for now per design image */}
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
                                const extra = EXTRAS.find(e => e.id === id);
                                if (!extra || count === 0) return null;
                                return (
                                    <div key={id} className="flex justify-between font-medium text-gray-700">
                                        <span>{extra.name} {count > 1 ? `(${count})` : ''}</span>
                                        <span>{extra.price ? `$${extra.price * count}` : '-'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-teal-500 text-lg">Total:</h4>
                    <span className="font-bold text-xl text-gray-900">${total} mxn</span>
                </div>

                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 text-base shadow-lg shadow-teal-500/20">
                    Pagar
                </Button>
            </div>
        </div>
    );
}
