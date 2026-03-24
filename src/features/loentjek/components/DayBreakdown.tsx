import React from "react";
import { cn } from "@/lib/utils";
import { formatDayHeader, getExpectedHours, getDayCellStatus } from "../utils/weekUtils";
import CategoryIcon from "./CategoryIcon";
import type { DayRegistration } from "../hooks/useWeekData";

const statusBorder: Record<string, string> = {
  ok: "border-l-green-500",
  missing: "border-l-red-500",
  partial: "border-l-amber-500",
  "no-work": "border-l-muted",
  absence: "border-l-blue-500",
};

interface Props {
  date: Date;
  registrations: DayRegistration[];
  schedule?: Record<string, number | null>;
}

const ABSENCE_CATS = new Set(["sickness", "vacation", "private"]);

const DayBreakdown: React.FC<Props> = ({ date, registrations, schedule }) => {
  const expected = getExpectedHours(date.getDay(), schedule);
  const total = registrations.reduce((s, r) => s + r.duration, 0);
  const hasAbsence = registrations.some((r) => ABSENCE_CATS.has(r.category));
  const status = getDayCellStatus(total, expected, hasAbsence);

  const statusIcon = status === "ok" ? "✓" : status === "missing" ? "❌" : status === "partial" ? "⚠️" : "";

  return (
    <div className={cn("border-l-4 pl-3 py-2 mb-3", statusBorder[status] ?? "border-l-muted")}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm capitalize">{formatDayHeader(date)}</span>
        <span className="text-sm text-muted-foreground">
          {total.toFixed(1)} / {expected.toFixed(1)} {statusIcon}
        </span>
      </div>
      {registrations.length === 0 ? (
        <p className="text-xs text-muted-foreground ml-2">Ingen registreringer</p>
      ) : (
        <div className="space-y-0.5 ml-2">
          {registrations.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CategoryIcon category={r.category} />
              <span className="text-muted-foreground">
                {r.appointment_subject || r.description || categoryLabel(r.category)}
              </span>
              <span className="ml-auto font-medium">{r.duration.toFixed(1)} t</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    work: "Arbejde",
    internal: "Internt",
    sickness: "Sygdom",
    vacation: "Ferie",
    private: "Privat",
  };
  return labels[cat] || cat;
}

export default DayBreakdown;
