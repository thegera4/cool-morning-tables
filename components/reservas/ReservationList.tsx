"use client";

import { useState } from "react";
import { ReservationCard } from "./ReservationCard";
import { isAfter, isBefore, startOfDay } from "date-fns";

import { Order } from "@/lib/data";

interface ReservationListProps {
  orders: Order[];
}

type Tab = "upcoming" | "history";

export function ReservationList({ orders }: ReservationListProps) {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const today = startOfDay(new Date());

  // Split orders into upcoming and history
  const upcomingOrders = orders.filter((order): order is Order & { reservationDate: string } => {
    if (!order.reservationDate) return false;
    // Manually parse YYYY-MM-DD to ensure it's treated as local time
    const [year, month, day] = order.reservationDate.split("-").map(Number);
    const orderDate = new Date(year, month - 1, day);
    // Include today in upcoming
    return isAfter(orderDate, today) || orderDate.getTime() === today.getTime();
  }).sort((a, b) => {
    // Sort Ascending (closest first)
    const [yA, mA, dA] = a.reservationDate.split("-").map(Number);
    const dateA = new Date(yA, mA - 1, dA);
    const [yB, mB, dB] = b.reservationDate.split("-").map(Number);
    const dateB = new Date(yB, mB - 1, dB);
    return dateA.getTime() - dateB.getTime();
  });

  const historyOrders = orders.filter((order): order is Order & { reservationDate: string } => {
    if (!order.reservationDate) return false;
    // Manually parse YYYY-MM-DD to ensure it's treated as local time
    const [year, month, day] = order.reservationDate.split("-").map(Number);
    const orderDate = new Date(year, month - 1, day);
    return isBefore(orderDate, today);
  });

  const currentTabOrders = activeTab === "upcoming" ? upcomingOrders : historyOrders;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-8 pl-1">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Mis Reservas</h1>
        <p className="text-zinc-500">Gestiona tus próximas visitas y revisa tu historial.</p>
      </div>

      {/* Main Tabs (Próximas / Historial) */}
      <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`cursor-pointer pb-3 text-sm font-medium transition-colors relative ${activeTab === "upcoming"
            ? "text-brand-brown"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
        >
          Próximas
          {activeTab === "upcoming" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-brown rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`cursor-pointer pb-3 text-sm font-medium transition-colors relative ${activeTab === "history"
            ? "text-brand-brown"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
        >
          Historial
          {activeTab === "history" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-brown rounded-t-full" />
          )}
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {currentTabOrders.length > 0 ? (
          currentTabOrders.map((order, index) => (
            <ReservationCard key={order._id} order={order} priority={index === 0} />
          ))
        ) : (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
            <p className="text-zinc-500">No hay reservaciones en esta sección.</p>
          </div>
        )}
      </div>
    </div>
  );
}
