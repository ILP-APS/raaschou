import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSmsLogs } from "../hooks/useSmsLogs";
import { useCases } from "../hooks/useCases";
import { useAutomationEmployees } from "../hooks/useEmployees";

const REMINDER_TYPE_LABELS: Record<string, string> = {
  same_day: "Samme dag",
  next_morning: "Næste morgen",
  next_midday: "Næste middag",
  friday_summary: "Fredagsoverblik",
};

const SmsLogTable: React.FC = () => {
  const { data: logs, isLoading } = useSmsLogs();
  const { data: cases } = useCases();
  const { data: employees } = useAutomationEmployees();

  const employeeNames = new Map<number, string>();
  if (employees) {
    for (const e of employees) employeeNames.set(e.hn_user_id, e.employee_name);
  }

  const caseUserMap = new Map<string, number>();
  if (cases) {
    for (const c of cases) caseUserMap.set(c.id, c.hn_user_id);
  }

  if (isLoading) return <p className="text-muted-foreground">Indlæser...</p>;

  if (!logs || logs.length === 0) {
    return <p className="text-muted-foreground">Ingen SMS'er sendt endnu.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tidspunkt</TableHead>
          <TableHead>Medarbejder</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const userId = caseUserMap.get(log.case_id);
          const empName = userId ? employeeNames.get(userId) : null;

          return (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.sent_at).toLocaleString("da-DK", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="font-medium">
                {empName || (userId ? `User ${userId}` : "Ukendt")}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {REMINDER_TYPE_LABELS[log.reminder_type] || log.reminder_type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{log.phone_number}</TableCell>
              <TableCell>
                <Badge variant={log.sms_status === "delivered" ? "secondary" : "destructive"}>
                  {log.sms_status || "ukendt"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SmsLogTable;
