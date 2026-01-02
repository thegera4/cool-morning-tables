"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateCustomer } from "@/lib/actions/customer";

/*
  * Book a product (location) for a specific date
  * @param slug - The slug of the product to book
  * @param date - The date to book the product for
  * @returns { success: true } if the product was booked successfully
*/
export async function bookProduct(slug: string, date: string) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "Debes iniciar sesión para reservar" };
  }

  // Ensure customer exists in Sanity
  const email = user.emailAddresses[0]?.emailAddress;
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email;

  if (email) {
    await getOrCreateCustomer(email, name, userId);
  }

  try {
    // 1. Find the document ID for the product with the given slug
    const product = await writeClient.fetch(
      `*[_type == "product" && slug.current == $slug][0]._id`,
      { slug }
    );

    if (!product) {
      throw new Error("Product not found");
    }

    // 2. Patch the document to append the date to blockedDates
    await writeClient
      .patch(product)
      .setIfMissing({ blockedDates: [] })
      .append("blockedDates", [date])
      .commit();

    revalidatePath("/"); // Revalidate cache to show updated availability
    return { success: true };
  } catch (error) {
    console.error("Error booking product:", error);
    return { success: false, error: "Failed to book date" };
  }
}

interface CreateOrderParams {
  locationId: string;
  date: string;
  extras: Record<string, number>;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  payDeposit?: boolean;
}

/*
  * Create an order automatically in Sanity
  * @param {CreateOrderParams} params - The order parameters (locationId, date, extras, contactInfo).
  * @returns {Promise<{ success: boolean; error?: string; orderNumber?: string }>} - The result of the order creation.
*/
export async function createOrder({ locationId, date, extras, contactInfo, payDeposit }: CreateOrderParams) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "Debes iniciar sesión para reservar" };
  }

  // 1. Get/Create Customer
  const email = contactInfo.email || user.emailAddresses[0]?.emailAddress;
  const name = `${contactInfo.firstName} ${contactInfo.lastName}`.trim();

  // Using the existing action logic
  const { sanityCustomerId } = await getOrCreateCustomer(email, name, userId);

  try {
    // 2. Fetch Product (Location) Details
    const product = await writeClient.fetch(
      `*[_type == "product" && (_id == $locationId || slug.current == $locationId)][0]{
                _id,
                name,
                price,
                "slug": slug.current
            }`,
      { locationId }
    );

    if (!product) {
      throw new Error(`Location not found for ID: ${locationId}`);
    }

    // 3. Fetch Extras Details
    const extraIds = Object.keys(extras);
    const extrasDocs = extraIds.length > 0
      ? await writeClient.fetch(`*[_type == "extra" && _id in $ids]`, { ids: extraIds })
      : [];

    // 4. Construct Order Items & Calculate Total
    const orderItems = [
      {
        _key: crypto.randomUUID(),
        product: { _type: "reference", _ref: product._id },
        quantity: 1,
        priceAtPurchase: product.price
      }
    ];

    let total = product.price;

    extrasDocs.forEach((extra: any) => {
      const quantity = extras[extra._id] || 0;
      if (quantity > 0) {
        // Determine if extra allows quantity or is single selection 
        // (Though schema says allowQuantity, for now we treat based on passed quantity)
        orderItems.push({
          _key: crypto.randomUUID(),
          product: { _type: "reference", _ref: extra._id },
          quantity: quantity,
          priceAtPurchase: extra.price
        });
        total += extra.price * quantity;
      }
    });

    // 5. Create Order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await writeClient.create({
      _type: "order",
      orderNumber,
      customer: { _type: "reference", _ref: sanityCustomerId },
      clerkUserId: userId,
      email,
      items: orderItems,
      total,
      amountPaid: payDeposit ? total / 2 : total,
      amountPending: payDeposit ? total / 2 : 0,
      status: payDeposit ? "deposito" : "pagada", // Using new status "deposito" for 50%
      createdAt: new Date().toISOString(),
      reservationDate: date,
    });

    // 6. Block Date on Product (Location)
    await writeClient
      .patch(product._id)
      .setIfMissing({ blockedDates: [] })
      .append("blockedDates", [date])
      .commit();

    revalidatePath("/");
    return { success: true, orderNumber };

  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
