
"use client";

import Image from "next/image";
import { LOCATIONS } from "@/lib/data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationGridProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function LocationGrid({ selectedLocationId, onSelectLocation }: LocationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {LOCATIONS.map((location) => {
        const isSelected = selectedLocationId === location.id;
        return (
          <Card
            key={location.id}
            className={cn(
              "cursor-pointer transition-all duration-300 border-2 overflow-hidden group hover:shadow-lg",
              isSelected
              ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md transform scale-[1.02]"
              : "border-transparent hover:border-gray-200"
            )}
            onClick={() => onSelectLocation(location.id)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
              <Image
                src={location.imageUrl}
                alt={location.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn("object-cover transition-transform duration-500",
                  isSelected ? "scale-105" : "group-hover:scale-105"
                )}
              />
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-teal-500 fill-teal-50" />
                </div>
              )}
            </div>
            <CardContent className="p-4 pb-2">
              <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{location.name}</h4>
              <p className="font-bold text-gray-900 text-xs mt-1">${location.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <p className="text-[10px] text-gray-500 line-clamp-2">{location.description}</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}