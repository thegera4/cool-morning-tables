"use client";

import { useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReservationCardProps {
  order: any; // Type this properly if possible, or use the inferred type from params
}

export function ReservationCard({ order }: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = getOrderStatus(order.status);
  // Find the main product item (not extras)
  // If multiple products or none found, fallback to first item
  const mainItem = order.items?.find((item: any) => item.product?._type === 'product') || order.items?.[0];
  const product = mainItem?.product;

  // Format dates
  const reservationDate = new Date(order.reservationDate);
  const formattedDate = format(reservationDate, "EEEE, d 'de' MMMM", { locale: es });
  // Capitalize first letter
  const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const imageUrl = product?.images?.[0] ? urlFor(product.images[0]).url() : "/placeholder.png";

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900 mb-4 transition-all">
      <CardContent className="p-0 sm:flex items-start">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusConfig.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
              <statusConfig.icon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </div>
          </div>

          <div
            className="flex items-center gap-2 mb-2 cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors">
              Order #{order.orderNumber}
            </h3>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
            )}
          </div>

          {isExpanded && (
            <div className="flex flex-col gap-1 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {order.items?.map((item: any) => (
                <p key={item._key} className="text-zinc-500 text-sm pl-2 border-l-2 border-zinc-100 dark:border-zinc-800">
                  {item.quantity}x {item.product?.name}
                </p>
              ))}
            </div>
          )}

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
        </div>

        {/* Image Section */}
        <div className="hidden sm:block p-4">
          <div className="w-48 h-32 relative shrink-0 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product?.name || "Reservation"}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
