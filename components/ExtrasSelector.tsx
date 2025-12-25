
"use client";

import { EXTRAS, Extra } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gift, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtrasSelectorProps {
    selectedExtras: Record<string, number>;
    onUpdateExtra: (id: string, count: number) => void;
}

export function ExtrasSelector({ selectedExtras, onUpdateExtra }: ExtrasSelectorProps) {

    const handleToggle = (extra: Extra, checked: boolean) => {
        onUpdateExtra(extra.id, checked ? 1 : 0);
    };

    const handleIncrement = (extra: Extra) => {
        const current = selectedExtras[extra.id] || 0;
        onUpdateExtra(extra.id, current + 1);
    };

    const handleDecrement = (extra: Extra) => {
        const current = selectedExtras[extra.id] || 0;
        if (current > 0) {
            onUpdateExtra(extra.id, current - 1);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <Gift className="h-6 w-6 text-amber-700 stroke-[1.5]" />
                <h3 className="text-teal-500 font-bold text-lg">Resumen y Confirmacion</h3>
            </div>

            {/* Note: The design title says "Resumen y Confirmacion" but contains the extras checklist. */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {EXTRAS.map((extra) => {
                    const count = selectedExtras[extra.id] || 0;
                    const isSelected = count > 0;

                    if (extra.type === 'counter') {
                        return (
                            <div key={extra.id} className="flex flex-col gap-1 md:col-span-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={extra.id}
                                        checked={isSelected}
                                        onCheckedChange={(c) => onUpdateExtra(extra.id, c ? 1 : 0)}
                                        className="data-[state=checked]:bg-teal-500 border-teal-500"
                                    />
                                    <Label htmlFor={extra.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                                        {extra.name}
                                    </Label>
                                </div>
                                {isSelected && (
                                    <div className="flex items-center gap-2 mt-1 ml-6">
                                        <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => handleDecrement(extra)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-xs w-3 text-center">{count}</span>
                                        <Button variant="outline" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => handleIncrement(extra)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={extra.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={extra.id}
                                checked={isSelected}
                                onCheckedChange={(c) => handleToggle(extra, c as boolean)}
                                className="data-[state=checked]:bg-teal-500 border-teal-500"
                            />
                            <Label htmlFor={extra.id} className="text-sm font-medium text-gray-700 cursor-pointer user-select-none">
                                {extra.name}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
