import { getOrders } from "@/lib/actions/get-orders";
import { ReservationList } from "@/components/reservas/ReservationList";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mis Reservas | Restaurante Especial",
  description: "Gestiona tus reservaciones y consulta tu historial.",
};

export default async function MisReservasPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/?error=login_required");
  }

  const orders = await getOrders();

  return (
    <div className="flex min-h-screen flex-col font-sans bg-zinc-50 dark:bg-zinc-950 selection:bg-teal-100">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <ReservationList orders={orders} />
      </main>
      <Footer />
    </div>
  );
}
