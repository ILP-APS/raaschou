import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCases } from "../hooks/useCases";
import { useAutomationEmployees } from "../hooks/useEmployees";
import { useSmsLogSummary } from "../hooks/useSmsLogs";

const CaseOverview: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const { data: cases, isLoading } = useCases({
    status: statusFilter === "all" ? undefined : statusFilter,
    hnUserId: employeeFilter === "all" ? undefined : parseInt(employeeFilter),
  });

  const { data: employees } = useAutomationEmployees();
  const { data: smsSummary } = useSmsLogSummary();

  const employeeNames = new Map<number, string>();
  if (employees) {
    for (const e of employees) employeeNames.set(e.hn_user_id, e.employee_name);
  }

  // Server-side aggregering pr. case (uden alders-grænse)
  const smsCountByCase = new Map<string, number>();
  const smsSentAtByCase = new Map<string, string>();
  if (smsSummary) {
    for (const s of smsSummary) {
      smsCountByCase.set(s.case_id, s.sms_count);
      if (s.last_sent_at) smsSentAtByCase.set(s.case_id, s.last_sent_at);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Indlæser...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="open">Åben</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Medarbejder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle medarbejdere</SelectItem>
            {employees?.map((e) => (
              <SelectItem key={e.hn_user_id} value={String(e.hn_user_id)}>
                {e.employee_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(!cases || cases.length === 0) ? (
        <p className="text-muted-foreground">Ingen cases fundet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medarbejder</TableHead>
              <TableHead>Dato mangler</TableHead>
              <TableHead>Uge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Forventet timer</TableHead>
              <TableHead>SMS'er</TableHead>
              <TableHead>SMS sendt</TableHead>
              <TableHead>Resolved efter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {employeeNames.get(c.hn_user_id) || `User ${c.hn_user_id}`}
                </TableCell>
                <TableCell>{c.missing_date}</TableCell>
                <TableCell>{c.week_number}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "open" ? "destructive" : "secondary"}>
                    {c.status === "open" ? "Åben" : "Resolved"}
                  </Badge>
                </TableCell>
                <TableCell>{c.hours_expected}</TableCell>
                <TableCell>{smsCountByCase.get(c.id) || 0}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {smsSentAtByCase.get(c.id)
                    ? new Date(smsSentAtByCase.get(c.id)!).toLocaleString("da-DK", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.resolved_after_reminder || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CaseOverview;
