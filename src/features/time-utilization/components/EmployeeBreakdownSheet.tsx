import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import type { Breakdown } from "../utils/breakdown";
import { getTargetStatus, statusTextClass, formatDeviation } from "../utils/targetStatus";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeName: string | null;
  fromDate: Date;
  toDate: Date;
  breakdown: Breakdown | null;
  target: number;
}

export default function EmployeeBreakdownSheet({
  open, onClose, employeeName, fromDate, toDate, breakdown, target,
}: Props) {
  if (!employeeName || !breakdown) return null;

  const { billable, internal, absence, totals } = breakdown;
  const utilization = totals.total > 0 ? totals.billable / totals.total : 0;
  const utilizationPct = utilization * 100;
  const status = getTargetStatus(utilization, target);
  const periodLabel = `${format(fromDate, "d. MMM", { locale: da })} – ${format(toDate, "d. MMM yyyy", { locale: da })}`;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{employeeName}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {periodLabel} · {totals.total.toFixed(1)} t total · Utilization{" "}
            <span className={`font-semibold ${statusTextClass(status)}`}>
              {utilizationPct.toFixed(1)}%
            </span>{" "}
            <span className={statusTextClass(status)}>
              ({formatDeviation(utilization, target)})
            </span>
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold">Fakturerbar</h3>
              <span className="text-sm text-muted-foreground">{totals.billable.toFixed(1)} t</span>
            </div>
            {billable.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen fakturerbar tid i perioden.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {billable.map((row, i) => (
                  <li key={`b-${i}`} className="flex justify-between gap-4 border-b py-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{row.subject}</div>
                      {row.category_name && (
                        <div className="text-xs text-muted-foreground">{row.category_name}</div>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap">{row.duration.toFixed(1)} t</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold">Intern</h3>
              <span className="text-sm text-muted-foreground">{totals.internal.toFixed(1)} t</span>
            </div>
            {internal.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen intern tid i perioden.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {internal.map((row, i) => (
                  <li key={`i-${i}`} className="flex justify-between gap-4 border-b py-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{row.subject}</div>
                      <div className="text-xs text-muted-foreground">{row.reason}</div>
                    </div>
                    <div className="text-right whitespace-nowrap">{row.duration.toFixed(1)} t</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-semibold">Fravær</h3>
              <span className="text-sm text-muted-foreground">{totals.absence.toFixed(1)} t</span>
            </div>
            <ul className="space-y-1 text-sm">
              {absence.map((row) => (
                <li key={row.label} className="flex justify-between gap-4 border-b py-2">
                  <div>{row.label}</div>
                  <div className="text-right">{row.duration.toFixed(1)} t</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
