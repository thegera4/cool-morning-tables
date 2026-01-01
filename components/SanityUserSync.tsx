"use client";

import { createSanityUserAction } from "@/lib/actions/customer";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SanityUserSync() {
    const { user, isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn && user) {
            createSanityUserAction()
                .then((data) => {
                    if (data?.sanityCustomerId) {
                        console.log("Sanity user synced correctly!");
                    }
                })
                .catch((err) => console.error("Sync error:", err));
        }
    }, [isSignedIn, user]);

    return null;
}