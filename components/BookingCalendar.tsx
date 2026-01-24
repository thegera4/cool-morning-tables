"use client";

import { addMonths, startOfToday, isSameDay, startOfTomorrow } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DayButtonProps } from "react-day-picker";

interface BookingCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string | undefined;
  setTime: (time: string) => void;
  blockedDates: Date[];
}

export function BookingCalendar({ date, setDate, blockedDates }: BookingCalendarProps) {
  const today = startOfToday();
  const currentHour = new Date().getHours();
  const startDate = currentHour >= 17 ? startOfTomorrow() : today;   // If it's past 5 PM (17:00), bookings start from tomorrow
  const maxDate = addMonths(today, 1);

  const CustomDayButton = (props: DayButtonProps) => {
    const { day } = props;
    const isBlocked = blockedDates.some((blocked) => isSameDay(day.date, blocked));

    if (isBlocked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="w-full h-full">
              <div className="w-full h-full cursor-not-allowed"><CalendarDayButton {...props} /></div>
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-brand-brown text-white border-brand-brown [&_svg]:fill-brand-brown [&_svg]:text-brand-brown [&_svg]:bg-brand-brown"><p>No Disponible</p></TooltipContent>
        </Tooltip>
      );
    }
    return <CalendarDayButton {...props} />;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Title */}
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-6 w-6 text-brand-brown stroke-[1.5]" />
        <h3 className="text-brand-teal font-bold text-lg">Selecciona tu fecha</h3>
      </div>
      {/* Calendar */}
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full flex justify-center data-[selected-single=true]:bg-blue-500"
            classNames={{
              month: "space-y-4 w-full",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full justify-between",
              row: "flex w-full mt-2 justify-between",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-teal/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
              day_selected: "bg-brand-teal text-white hover:bg-brand-teal/90 hover:text-white focus:bg-brand-teal focus:text-white rounded-md",
              day_today: "bg-gray-100 text-gray-900 border border-gray-200",
            }}
            disabled={(date) => date < startDate || date > maxDate || blockedDates.some(blocked => isSameDay(date, blocked))}
            hidden={{ before: startDate, after: maxDate }}
            startMonth={startDate}
            endMonth={maxDate}
            autoFocus
            locale={es}
            components={{
              DayButton: CustomDayButton,
            }}
          />
        </div>
      </div>
    </div>
  );
}