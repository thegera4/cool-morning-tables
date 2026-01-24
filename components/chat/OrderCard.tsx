import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Clock, MapPin, CreditCard, Wallet, Calendar, Hash } from "lucide-react";

interface OrderCardProps {
  order: any; // Using any for now to match Sanity query result flexibility, can be typed strictly later
}

export function OrderCard({ order }: OrderCardProps) {
  // Check if fully paid (either status is paid/completed OR pending amount is 0 or less)
  const isPaid = order.status === "paid" || order.status === "completed" || (order.amountPending !== undefined && order.amountPending <= 0);

  const statusColor = isPaid ? "bg-green-100 text-green-800" : "bg-[#FAF6F3] text-brand-brown border border-brand-brown";

  // Update status label logic
  let statusLabel = "Pendiente";
  if (isPaid) statusLabel = "Pagado";
  else if (order.status === "deposit") statusLabel = "Depósito";

  // Find the main product item (not extras). If multiple products or none found, fallback to first item
  const mainItem = order.items?.find((item: any) => item.product?._type === 'product') || order.items?.[0];
  const product = mainItem?.product;
  const imageUrl = product?.images?.[0] ? urlFor(product.images[0]).url() : "/placeholder.png";

  // Determine time based on day of week. Manually parse YYYY-MM-DD to ensure it's treated as local time, not UTC
  const [year, month, day] = (order.reservationDate || "").split("-").map(Number);
  const reservationDate = order.reservationDate ? new Date(year, month - 1, day) : null;

  const dayOfWeek = reservationDate ? getDay(reservationDate) : 0; // 0 = Sunday
  const timeRange = dayOfWeek === 0 ? "7:00 pm - 8:45 pm" : "8:15 pm - 10:45 pm";

  // Determine address based on product (check if any item is "Alberca Privada")
  const hasAlberca = order.items?.some((item: any) => item.product?.name?.toLowerCase().includes("alberca"));
  const address = hasAlberca ? "Andrés Villarreal 191, Col. División del Norte, Torreón, Coah." : "La Trattoria, Allende 138 Pte. Torreón, Coah.";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-sm my-2">
      {/* Image Header */}
      <div className="w-full h-32 relative bg-gray-100">
        <Image src={imageUrl} alt={product?.name || "Order Image"} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor} shadow-sm flex items-center gap-1.5`}>
            <CreditCard className="h-3 w-3" />
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Order Details with Icons */}
        <div className="space-y-2 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Orden</p>
              <p className="text-sm text-gray-900 font-medium">{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Fecha</p>
              <p className="text-sm text-gray-900 capitalize">
                {reservationDate ? format(reservationDate, "PPP", { locale: es }) : "Fecha pendiente"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Horario</p>
              <p className="text-sm text-gray-900">{timeRange}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Ubicación</p>
              <p className="text-sm text-gray-900">{address}</p>
            </div>
          </div>
        </div>
        {/* Items */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Incluye</p>
          <div className="flex flex-col gap-2">
            {order.items?.map((item: any) => (
              <div key={item._key} className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                </div>
                <p className="text-xs text-gray-500 ml-2 shrink-0">
                  {item.quantity} x ${item.priceAtPurchase?.toLocaleString("es-MX")}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Payment Breakdown */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Pagada</span>
            </div>
            <span className="font-medium text-brand-teal">
              ${order.amountPaid?.toLocaleString("es-MX", { minimumFractionDigits: 2 }) || "0.00"}
            </span>
          </div>
          {order.amountPending > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Wallet className="h-3.5 w-3.5" />
                <span>Pago pendiente</span>
              </div>
              <span className="font-medium text-brand-brown">
                ${order.amountPending?.toLocaleString("es-MX", { minimumFractionDigits: 2 }) || "0.00"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600 font-semibold">Total</span>
            <span className="text-lg font-bold text-gray-900">
              ${order.total?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
