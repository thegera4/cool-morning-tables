"use client";

// import { EXTRAS, Location } from "@/lib/data"; // Exclude legacy EXTRAS
import { Location } from "@/lib/data";
import { ContactInfo } from "@/components/ContactForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ListChecks, Minus, Plus } from "lucide-react";
import { bookProduct } from "@/app/actions";
import { useTransition } from "react";
import { ExtraItem } from "@/components/ExtrasSelector";

interface OrderSummaryProps {
    locationId: string | null;
    location: Location;
    date: Date | undefined;
    time: string | undefined;
    extras: Record<string, number>;
    extrasData: ExtraItem[]; // New prop for dynamic data
    contactInfo: ContactInfo;
    onUpdateExtra: (id: string, count: number) => void;
}

export function OrderSummary({ locationId, location, date, time, extras, extrasData, contactInfo, onUpdateExtra }: OrderSummaryProps) {
    const selectedLocation = location;
    const [isPending, startTransition] = useTransition();

    const locationPrice = selectedLocation?.price || 0;

    // Calculate extras total
    const extrasTotal = Object.entries(extras).reduce((total, [id, count]) => {
        const extra = extrasData.find((e) => e._id === id); // Use dynamic data
        if (!extra || !extra.price) return total;
        return total + (extra.price * count);
    }, 0);

    const total = locationPrice + extrasTotal;

    const handleIncrement = (id: string, current: number) => {
        onUpdateExtra(id, current + 1);
    }

    const handleDecrement = (id: string, current: number) => {
        if (current > 1) {
            onUpdateExtra(id, current - 1);
        } else {
            // If decrementing from 1, maybe confirm removal? Or just remove? 
            // Normally 0 removes it. But here we are in the "selected" list.
            // Let's assume hitting minus at 1 removes it (sets to 0).
            onUpdateExtra(id, 0);
        }
    }

    const handlePayment = () => {
        if (!locationId || !date) {
            alert("Por favor selecciona una fecha.");
            return;
        }

        startTransition(async () => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const result = await bookProduct(locationId, formattedDate);

            if (result.success) {
                alert("¡Reserva confirmada! La fecha se ha bloqueado.");
                // Optionally redirect or reset
                window.location.reload(); // Simple reload to refresh state for now
            } else {
                alert("Hubo un error al procesar la reserva. Intenta de nuevo.");
            }
        });
    };

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
                                const extra = extrasData.find(e => e._id === id);
                                if (!extra || count === 0) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span>{extra.name}</span>
                                            {extra.allowQuantity && (
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => handleDecrement(id, count)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-xs w-4 text-center">{count}</span>
                                                    <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => handleIncrement(id, count)}>
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

            <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-teal-500 text-lg">Total:</h4>
                    <span className="font-bold text-xl text-gray-900">${total} mxn</span>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={isPending || !date}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 text-base shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Procesando..." : "Pagar"}
                </Button>
            </div>
        </div>
    );
}
