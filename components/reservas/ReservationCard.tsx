"use client";

import { useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Calendar, Clock, ChevronDown, ChevronUp, ClipboardList, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ReservationCardProps {
  order: any; // Type this properly if possible, or use the inferred type from params
  priority?: boolean;
}

export function ReservationCard({ order, priority = false }: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getOrderStatus(order.status);
  // Find the main product item (not extras)
  // If multiple products or none found, fallback to first item
  const mainItem = order.items?.find((item: any) => item.product?._type === 'product') || order.items?.[0];
  const product = mainItem?.product;

  // Format dates
  // Manually parse YYYY-MM-DD to ensure it's treated as local time, not UTC
  const [year, month, day] = order.reservationDate.split("-").map(Number);
  const reservationDate = new Date(year, month - 1, day);
  const formattedDate = format(reservationDate, "EEEE, d 'de' MMMM", { locale: es });
  // Capitalize first letter
  const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Time slot logic
  const isSunday = reservationDate.getDay() === 0;
  const reservationTime = isSunday ? "19:00 - 20:45" : "20:15 - 22:45";

  const imageUrl = product?.images?.[0] ? urlFor(product.images[0]).url() : "/placeholder.png";

  // Payment status logic for title and icons colors
  const isPaid = statusConfig.value === 'pagada';
  const accentColorClass = isPaid ? "text-brand-teal" : "text-brand-brown";
  const hoverColorClass = isPaid ? "group-hover:text-brand-teal" : "group-hover:text-brand-brown";

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900 mb-4 transition-all">
      <CardContent className="p-0 sm:flex items-start">
        <div className="flex-1 p-6">
          <div className="flex flex-col items-start mb-4">
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusConfig.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                <statusConfig.icon className="w-3.5 h-3.5" />
                {statusConfig.label}
              </div>
              {order.source === 'manual' && (
                <div className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Manual
                </div>
              )}
            </div>
            {order.status === 'deposito' && (
              <p className="text-xs text-brand-brown dark:text-brand-brown font-medium mt-1 max-w-[500px] leading-tight">
                Recuerda que tienes pendiente pagar el 50% del costo total de tu reservación.
              </p>
            )}
          </div>

          {/* Mobile Image */}
          <div className="block sm:hidden w-full h-32 relative mb-4 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product?.name || "Reservation"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 1px"
              loading={priority ? "eager" : "lazy"}
            />
          </div>

          <div
            className="flex items-center gap-2 mb-2 cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className={`text-xl font-bold text-zinc-900 dark:text-zinc-100 ${hoverColorClass} transition-colors`}>
              {order.orderNumber}
            </h3>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 text-zinc-400 ${hoverColorClass}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 text-zinc-400 ${hoverColorClass}`} />
            )}
          </div>

          {isExpanded && (
            <div className="flex flex-col gap-1 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {order.items?.map((item: any) => (
                <p key={item._key} className="text-zinc-500 text-sm pl-2 border-l-2 border-zinc-100 dark:border-zinc-800">
                  • {item.product?.name} - ({item.quantity})
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${accentColorClass}`} />
              <span>{formattedDateCapitalized}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${accentColorClass}`} />
              <span>{reservationTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${accentColorClass}`} />
              <span>
                {product?.name?.toLowerCase().trim() === "alberca privada"
                  ? "Andrés Villarreal 191, Col. División del Norte"
                  : "La Trattoria TRC, Allende #138 Pte."
                }
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {order.status === 'deposito' ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Total reservación:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Pagado:</span>
                  <span>{formatCurrency(order.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-brown">
                  <span>Pendiente:</span>
                  <span>{formatCurrency(order.amountPending)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100">
                <span>Total pagado:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden sm:block p-6 pl-0">
          <div className="w-48 h-32 relative shrink-0 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product?.name || "Reservation"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 1px, 192px"
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
