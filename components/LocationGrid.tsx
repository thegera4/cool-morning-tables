
"use client";

import Image from "next/image";
import { Location } from "@/lib/data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationGridProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  products: Location[];
}

export function LocationGrid({ selectedLocationId, onSelectLocation, products }: LocationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((location) => {
        const isSelected = selectedLocationId === location.id;
        return (
          <Card
            key={location.id}
            className={cn(
              "cursor-pointer transition-all duration-300 border-2 overflow-hidden group hover:shadow-lg p-0 gap-0",
              isSelected
                ? "border-brand-teal ring-2 ring-brand-teal/20 shadow-md transform scale-[1.02]"
                : "border-transparent hover:border-gray-200"
            )}
            onClick={() => onSelectLocation(location.id)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
              {location.imageUrl ? (
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn("object-cover transition-transform duration-500",
                    isSelected ? "scale-105" : "group-hover:scale-105"
                  )}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                  <ImageOff className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-wide">Foto no disponible</span>
                </div>
              )}
            </div>
            <CardContent className="p-4 pb-2">
              <h4 className="font-bold text-gray-900 text-md md:text-base line-clamp-1">{location.name}</h4>
              <p className="font-bold text-gray-900 text-sm mt-1">${location.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <p className="text-sm text-gray-600 line-clamp-2">{location.description}</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}