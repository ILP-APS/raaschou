import React from "react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface Props {
  fromDate: Date;
  toDate: Date;
  onChange: (from: Date, to: Date) => void;
}

export default function DateRangePicker({ fromDate, toDate, onChange }: Props) {
  const label = `${format(fromDate, "d. MMM", { locale: da })} – ${format(toDate, "d. MMM yyyy", { locale: da })}`;

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange(range.from, range.to);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={fromDate}
          selected={{ from: fromDate, to: toDate }}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={da}
        />
      </PopoverContent>
    </Popover>
  );
}
