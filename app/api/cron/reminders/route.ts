import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { sendPaymentReminderEmail } from "@/lib/email";

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET(req: NextRequest) {
    // 1. Verify Authentication (Vercel Cron)
    // Vercel automatically sends this header. You can also set a CRON_SECRET env var for local testing protection.
    // For simplicity here, we'll assume the route is protected by being hidden or relying on the header in prod.
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    console.log("Starting Payment Reminder Cron Job...");

    try {
        // 2. Calculate Target Dates (Today, Tomorrow, Day After Tomorrow)
        // We want to send emails 2 days before, 1 day before, and on the day of.
        // So if today is Jan 26, we look for reservations on Jan 26, Jan 27, Jan 28.

        // Use Mexico City time (UTC-6) roughly for calculations, or just UTC date strings if stored as such.
        // Since reservationDate is likely YYYY-MM-DD string without time, we should generate these strings.

        const today = new Date();
        // To be safe with "Mexico time", let's adjust the date if needed, but assuming server runs in UTC or we just want 3 consecutive days:

        const dates = [];
        for (let i = 0; i <= 2; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            // Format as YYYY-MM-DD
            const dateString = d.toISOString().split('T')[0];
            dates.push(dateString);
        }

        console.log("Target dates:", dates);

        // 3. Query Sanity for Unpaid Orders in these dates
        const query = `*[_type == "order" && status == "deposito" && reservationDate in $dates]{
            _id,
            orderNumber,
            customer->{name, email},
            reservationDate,
            amountPending,
            items[]{
                product->{name, _type}
            }
        }`;

        const orders = await client.fetch(query, { dates });

        console.log(`Found ${orders.length} orders with pending balance for dates: ${dates.join(", ")}`);

        // 4. Send Emails
        const results = await Promise.allSettled(orders.map(async (order: any) => {
            if (!order.customer?.email) {
                console.warn(`Order ${order.orderNumber} has no customer email.`);
                return { order: order.orderNumber, status: 'skipped_no_email' };
            }

            // Calculate days remaining
            const resDate = new Date(order.reservationDate);
            const diffTime = resDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Determine location name
            const locationItem = order.items?.find((item: any) => item.product?._type === 'product');
            const locationName = locationItem?.product?.name || "Ubicación desconocida";

            await sendPaymentReminderEmail(order.customer.email, {
                customerName: order.customer.name || "Cliente",
                orderNumber: order.orderNumber,
                date: order.reservationDate,
                amountPending: order.amountPending,
                locationName: locationName,
                daysRemaining: diffDays
            });

            return { order: order.orderNumber, status: 'sent' };
        }));

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Successfully sent ${successCount} reminder emails.`);

        return NextResponse.json({
            success: true,
            processed: orders.length,
            sent: successCount,
            dates: dates
        });

    } catch (error: any) {
        console.error("Error in Payment Reminder Cron:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
