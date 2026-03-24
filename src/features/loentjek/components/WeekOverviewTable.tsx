import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getWeekDays, getExpectedHours, formatDateStr, type WeekRange } from "../utils/weekUtils";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import DayCell from "./DayCell";
import DeviationBadge from "./DeviationBadge";
import EmployeeDetailSheet from "./EmployeeDetailSheet";
import type { DayRegistration, EmployeeInfo } from "../hooks/useWeekData";

const ABSENCE_CATS = new Set(["sickness", "vacation", "private"]);

interface Props {
  employees: EmployeeInfo[];
  registrations: DayRegistration[];
  schedules: any[];
  weekRange: WeekRange;
}

const WeekOverviewTable: React.FC<Props> = ({ employees, registrations, schedules, weekRange }) => {
  const [onlyDeviations, setOnlyDeviations] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeInfo | null>(null);

  const days = getWeekDays(weekRange);

  const scheduleMap = useMemo(() => {
    const m = new Map<number, Record<string, number | null>>();
    for (const s of schedules) m.set(s.hn_user_id, s);
    return m;
  }, [schedules]);

  const regsByUser = useMemo(() => {
    const m = new Map<number, DayRegistration[]>();
    for (const r of registrations) {
      if (!m.has(r.hn_user_id)) m.set(r.hn_user_id, []);
      m.get(r.hn_user_id)!.push(r);
    }
    return m;
  }, [registrations]);

  const rows = useMemo(() => {
    return employees.map((emp) => {
      const regs = regsByUser.get(emp.hn_user_id) ?? [];
      const schedule = scheduleMap.get(emp.hn_user_id);

      let totalRegistered = 0;
      let totalExpected = 0;

      const daySummaries = days.map((date) => {
        const dateStr = formatDateStr(date);
        const dayRegs = regs.filter((r) => r.date === dateStr);
        const registered = dayRegs.reduce((s, r) => s + r.duration, 0);
        const expected = getExpectedHours(date.getDay(), schedule);
        const categories = [...new Set(dayRegs.map((r) => r.category))];
        const hasAbsence = dayRegs.some((r) => ABSENCE_CATS.has(r.category));

        totalRegistered += registered;
        totalExpected += expected;

        return { date, dateStr, registered, expected, categories, hasAbsence };
      });

      return { emp, regs, schedule, daySummaries, totalRegistered, totalExpected };
    });
  }, [employees, regsByUser, scheduleMap, days]);

  const filteredRows = onlyDeviations
    ? rows.filter((r) => Math.abs(r.totalRegistered - r.totalExpected) >= 0.01)
    : rows;

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch id="deviations" checked={onlyDeviations} onCheckedChange={setOnlyDeviations} />
        <Label htmlFor="deviations" className="text-sm">Vis kun afvigelser</Label>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Medarbejder</TableHead>
              {days.map((d) => (
                <TableHead key={d.toISOString()} className="text-center min-w-[70px]">
                  {format(d, "EEE", { locale: da })}
                </TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Forventet</TableHead>
              <TableHead className="text-center">Afvigelse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {onlyDeviations ? "Ingen afvigelser denne uge 🎉" : "Ingen data"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map(({ emp, daySummaries, totalRegistered, totalExpected }) => (
                <TableRow
                  key={emp.hn_user_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <TableCell className="font-medium">{emp.employee_name}</TableCell>
                  {daySummaries.map((ds) => (
                    <TableCell key={ds.dateStr} className="p-1 text-center">
                      <DayCell
                        registered={ds.registered}
                        expected={ds.expected}
                        categories={ds.categories}
                        hasAbsence={ds.hasAbsence}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">{totalRegistered.toFixed(1)}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{totalExpected.toFixed(1)}</TableCell>
                  <TableCell className="text-center">
                    <DeviationBadge total={totalRegistered} expected={totalExpected} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeDetailSheet
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        registrations={selectedEmployee ? (regsByUser.get(selectedEmployee.hn_user_id) ?? []) : []}
        schedule={selectedEmployee ? scheduleMap.get(selectedEmployee.hn_user_id) : undefined}
        weekRange={weekRange}
      />
    </>
  );
};

export default WeekOverviewTable;
