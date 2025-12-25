
"use client";

import * as React from "react";
import { format, addMonths, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { es } from "date-fns/locale";

interface BookingCalendarProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    time: string | undefined;
    setTime: (time: string) => void;
}

export function BookingCalendar({ date, setDate, time, setTime }: BookingCalendarProps) {
    // Generate time slots from 13:00 to 23:00
    const timeSlots = React.useMemo(() => {
        const slots = [];
        for (let i = 18; i <= 22; i++) {
            slots.push(`${i}:00`);
            slots.push(`${i}:30`);
        }
        return slots;
    }, []);

    const today = startOfToday();
    const maxDate = addMonths(today, 6);

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="h-6 w-6 text-amber-700 stroke-[1.5]" />
                <h3 className="text-teal-500 font-bold text-lg">Selecciona tu fecha y hora</h3>
            </div>

            <div className="flex flex-col gap-4">
                <div className="w-full">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow-sm w-full flex justify-center"
                        classNames={{
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex w-full justify-between",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-teal-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                            day_selected: "bg-teal-500 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-500 focus:text-white rounded-md",
                            day_today: "bg-gray-100 text-gray-900 border border-gray-200",
                        }}
                        disabled={(date) => date < today || date > maxDate}
                        fromDate={today}
                        toDate={maxDate}
                        initialFocus
                        locale={es}
                    />
                </div>

                <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                                {slot}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
