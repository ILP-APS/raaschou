import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EmployeeSummary } from "../utils/classify";
import { getTargetStatus, statusTextClass, formatDeviation } from "../utils/targetStatus";

interface Props {
  rows: EmployeeSummary[];
  target: number;
  onSelectEmployee?: (hnUserId: number) => void;
}

export default function UtilizationTable({ rows, target, onSelectEmployee }: Props) {
  const totals = rows.reduce(
    (acc, r) => ({
      fakturerbar: acc.fakturerbar + r.fakturerbar,
      intern: acc.intern + r.intern,
      fravaer: acc.fravaer + r.fravaer,
      total: acc.total + r.total,
    }),
    { fakturerbar: 0, intern: 0, fravaer: 0, total: 0 }
  );
  const totalUtilization = totals.total > 0 ? totals.fakturerbar / totals.total : 0;
  const totalStatus = getTargetStatus(totalUtilization, target);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medarbejder</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Fakturerbar</TableHead>
          <TableHead className="text-right">Intern</TableHead>
          <TableHead className="text-right">Fravær</TableHead>
          <TableHead className="text-right">Utilization</TableHead>
          <TableHead className="text-right">Vs mål</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const status = getTargetStatus(r.utilization, target);
          return (
            <TableRow
              key={r.hn_user_id}
              className={onSelectEmployee ? "cursor-pointer hover:bg-muted/50" : undefined}
              onClick={() => onSelectEmployee?.(r.hn_user_id)}
            >
              <TableCell>{r.employee_name}</TableCell>
              <TableCell className="text-right">{r.total.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.fakturerbar.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.intern.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.fravaer.toFixed(1)}</TableCell>
              <TableCell className={`text-right font-semibold ${statusTextClass(status)}`}>
                {(r.utilization * 100).toFixed(1)}%
              </TableCell>
              <TableCell className={`text-right ${statusTextClass(status)}`}>
                {formatDeviation(r.utilization, target)}
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow className="font-semibold border-t-2">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">{totals.total.toFixed(1)}</TableCell>
          <TableCell className="text-right">{totals.fakturerbar.toFixed(1)}</TableCell>
          <TableCell className="text-right">{totals.intern.toFixed(1)}</TableCell>
          <TableCell className="text-right">{totals.fravaer.toFixed(1)}</TableCell>
          <TableCell className={`text-right ${statusTextClass(totalStatus)}`}>
            {(totalUtilization * 100).toFixed(1)}%
          </TableCell>
          <TableCell className={`text-right ${statusTextClass(totalStatus)}`}>
            {formatDeviation(totalUtilization, target)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
