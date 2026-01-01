"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Gift } from "lucide-react";

// Define the shape of an Extra based on Sanity response + what we need in UI
export interface ExtraItem {
    _id: string; // Sanity ID
    name: string;
    price: number;
    description?: string;
    allowQuantity?: boolean;
}

interface ExtrasSelectorProps {
    extras: ExtraItem[];
    selectedExtras: Record<string, number>;
    onUpdateExtra: (id: string, count: number) => void;
}

export function ExtrasSelector({ extras, selectedExtras, onUpdateExtra }: ExtrasSelectorProps) {

    const handleToggle = (extra: ExtraItem, checked: boolean) => {
        onUpdateExtra(extra._id, checked ? 1 : 0);
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <Gift className="h-6 w-6 text-amber-700 stroke-[1.5]" />
                <h3 className="text-teal-500 font-bold text-lg">Extras</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extras.map((extra) => {
                    const count = selectedExtras[extra._id] || 0;
                    const isSelected = count > 0;

                    return (
                        <div key={extra._id} className="flex items-center space-x-2">
                            <Checkbox
                                id={extra._id}
                                checked={isSelected}
                                onCheckedChange={(c) => handleToggle(extra, c as boolean)}
                                className="data-[state=checked]:bg-teal-500 border-teal-500"
                            />
                            <Label htmlFor={extra._id} className="text-sm font-medium text-gray-700 cursor-pointer user-select-none">
                                {extra.name}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}