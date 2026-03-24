import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getWeekDays, getExpectedHours, formatDateStr, type WeekRange } from "../utils/weekUtils";
import DayBreakdown from "./DayBreakdown";
import type { DayRegistration, EmployeeInfo } from "../hooks/useWeekData";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: EmployeeInfo | null;
  registrations: DayRegistration[];
  schedule?: Record<string, number | null>;
  weekRange: WeekRange;
}

const EmployeeDetailSheet: React.FC<Props> = ({ open, onClose, employee, registrations, schedule, weekRange }) => {
  if (!employee) return null;

  const days = getWeekDays(weekRange);
  const totalRegistered = registrations.reduce((s, r) => s + r.duration, 0);
  const totalExpected = days.reduce((s, d) => s + getExpectedHours(d.getDay(), schedule), 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{employee.employee_name}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Uge {weekRange.weekNumber} · {totalRegistered.toFixed(1)} / {totalExpected.toFixed(1)} timer
          </p>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {days.map((date) => {
            const dateStr = formatDateStr(date);
            const dayRegs = registrations.filter((r) => r.date === dateStr);
            return <DayBreakdown key={dateStr} date={date} registrations={dayRegs} schedule={schedule} />;
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeDetailSheet;
