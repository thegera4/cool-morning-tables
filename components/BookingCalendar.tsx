"use client";

import { addMonths, startOfToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

interface BookingCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string | undefined;
  setTime: (time: string) => void;
}

export function BookingCalendar({ date, setDate }: BookingCalendarProps) {
  const today = startOfToday();
  const maxDate = addMonths(today, 1);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <CalendarIcon className="h-6 w-6 text-amber-700 stroke-[1.5]" />
        <h3 className="text-teal-500 font-bold text-lg">Selecciona tu fecha y hora</h3>
      </div>
      {/* Calendar */}
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
            hidden={{before: today, after: maxDate}}
            autoFocus
            locale={es}
          />
        </div>
      </div>
    </div>
  );
}