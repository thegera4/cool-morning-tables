"use client";

import { urlFor } from "@/sanity/lib/image";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Calendar, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Assuming Badge doesn't exist in ui/badge based on file list, I'll default to Tailwind classes or check if I missed it.
// Checking file list... no badge.tsx. I will implement a simple badge span.

interface ReservationCardProps {
  order: any; // Type this properly if possible, or use the inferred type from params
}

export function ReservationCard({ order }: ReservationCardProps) {
  const statusConfig = getOrderStatus(order.status);
  const mainItem = order.items?.[0];
  const product = mainItem?.product;

  // Format dates
  const reservationDate = new Date(order.reservationDate);
  const formattedDate = format(reservationDate, "EEEE, d 'de' MMMM", { locale: es });
  // Capitalize first letter
  const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Mock times for now as they aren't in the partial query provided in getOrders,
  // or assume reservationDate has time? The schema says 'date', usually YYYY-MM-DD.
  // Unless 'datetime'. orderType says: reservationDate is 'date'.
  // So time might be fixed or not stored. The design shows times. 
  // I will just show the date for now or 20:00 - 22:00 hardcoded if data missing.
  // Update: check orderType.ts. reservationDate is 'date'. 
  // But wait, the design shows "20:00 - 22:00". Maybe I should assume a dinner slot.

  const imageUrl = product?.images?.[0] ? urlFor(product.images[0]).url() : "/placeholder.png";

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900 mb-4">
      <CardContent className="p-0 sm:flex">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusConfig.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
              <statusConfig.icon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </div>
            <span className="text-zinc-400 text-sm font-medium">#{order.orderNumber}</span>
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {product?.name || "Reservación"}
          </h3>
          <p className="text-zinc-500 text-sm mb-4">
            {/* Subtitle/Description - hardcoded or from product */}
            {/* Cena Romántica • 2 Personas */}
            {mainItem?.quantity && `${mainItem.quantity} Personas`}
          </p>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{formattedDateCapitalized}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>20:00 - 22:00</span> {/* Hardcoded time slot based on design since data missing */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {order.status === 'deposito' || order.status === 'pendiente' ? (
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar ${order.amountPending}
              </Button>
            ) : (
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-orange-500/20 shadow-lg">
                Ver Detalles
              </Button>
            )}

            {/* Cancel logic not implemented yet */}
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
              Cancelar
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden sm:block w-72 h-auto relative shrink-0">
          <Image
            src={imageUrl}
            alt={product?.name || "Reservation"}
            fill
            className="object-cover h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
