export interface Location {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    blockedDates?: string[];
    // Sanity specific fields
    _type?: 'product';
    images?: any[]; // Simplified for now, can be ImageAsset[]
    slug?: { current: string };
}

export interface Extra {
    id: string;
    name: string;
    price: number | null; // null if it's "Included" or price varies/not shown in grid
    type: 'checkbox' | 'counter';
    _type?: 'extra';
    _id?: string;
}

export const LOCATIONS: Location[] = [
    {
        id: 'terraza-privada',
        name: 'Terraza Privada',
        price: 1000,
        description: 'Exterior del restaurante.',
        imageUrl: '/terrace.png',
    },
    {
        id: 'terraza-privada-2',
        name: 'Terraza Privada 2',
        price: 1000, // Assuming same price from image if readable, or generic
        description: 'Exterior del restaurante.',
        imageUrl: '/terrace.png',
    },
    {
        id: 'balcon-privado',
        name: 'Balcon Privado',
        price: 1000,
        description: 'Exterior del restaurante.',
        imageUrl: '/terrace.png',
    },
    {
        id: 'rooftop-privada',
        name: 'Rooftop Privada',
        price: 1000,
        description: 'Exterior del restaurante.',
        imageUrl: '/terrace.png',
    },
    {
        id: 'rancho-privado',
        name: 'Rancho Privado',
        price: 1990,
        description: 'Exterior del restaurante.',
        imageUrl: '/terrace.png',
    },
    {
        id: 'privado',
        name: 'Privado',
        price: 1990,
        description: 'Interior del restaurante.',
        imageUrl: '/indoors.png',
    },
    {
        id: 'salon-privado',
        name: 'Salon Privado',
        price: 1990,
        description: 'Interior del restaurante.',
        imageUrl: '/indoors.png',
    },
    {
        id: 'alberca-privada',
        name: 'Alberca Privada',
        price: 1990,
        description: 'Quinta con alberca privada.',
        imageUrl: '/indoors.png', // Fallback for now
    },
];

export const EXTRAS: Extra[] = [
    { id: 'petalos', name: 'Petalos', price: 200, type: 'checkbox' },
    { id: 'fotografo', name: 'Fotografo', price: 900, type: 'checkbox' },
    { id: 'big-ballon', name: 'Big Ballon', price: 300, type: 'checkbox' },
    { id: 'extra-4', name: 'Extra 4', price: 0, type: 'checkbox' },
    { id: 'extra-5', name: 'Extra 5', price: 0, type: 'checkbox' },
    { id: 'extra-6', name: 'Extra 6', price: 0, type: 'checkbox' },
    { id: 'extra-7', name: 'Extra 7', price: 0, type: 'checkbox' },
    { id: 'extra-8', name: 'Extra 8', price: 0, type: 'checkbox' },
    { id: 'extra-9', name: 'Extra 9', price: 0, type: 'checkbox' },
    { id: 'extra-10', name: 'Extra 10', price: 0, type: 'checkbox' },
    { id: 'extra-11', name: 'Extra 11', price: 0, type: 'checkbox' },
    { id: 'extra-12', name: 'Extra 12', price: 0, type: 'checkbox' },
    { id: 'personas', name: 'Personas', price: 1000, type: 'counter' }, // Special case
];

export interface Settings {
    isChatEnabled: boolean;
    heroTitle: string;
    heroDescription: string;
    heroImageUrl: string;
    productSelectionTitle: string;
    productSelectionDescription: string;

    features: {
        title: string;
        description: string;
        icon: string;
    }[];
}

export interface Customer {
    _id: string;
    _type: 'customer';
    name?: string;
    email?: string;
    clerkId?: string;
    phone?: string;
}

export interface OrderItem {
    product: Location | Extra | { _id: string; name: string; _type: string }; // flexible for expanded refs
    quantity: number;
    priceAtPurchase: number;
    _key?: string;
}

export interface Order {
    _id: string;
    _type: 'order';
    orderNumber: string;
    source?: 'web' | 'manual';
    reservationDate?: string;
    items: OrderItem[];
    total: number;
    amountPaid: number;
    amountPending: number;
    status: string;
    customer?: Customer;
    clerkUserId?: string;
    email?: string;
    stripePaymentId?: string;
    createdAt: string;
}