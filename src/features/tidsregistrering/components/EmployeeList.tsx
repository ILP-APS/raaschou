import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useAutomationEmployees, useToggleEmployeeActive, useEmployeeSchedules, useSyncEmployees } from "../hooks/useEmployees";
import EmployeeScheduleDialog from "./EmployeeScheduleDialog";
import PhoneSourceDialog from "./PhoneSourceDialog";
import AccountFilter, { type AccountFilterValue } from "@/components/AccountFilter";
import { useToast } from "@/hooks/use-toast";

const EmployeeList: React.FC = () => {
  const { data: employees, isLoading } = useAutomationEmployees();
  const { data: schedules } = useEmployeeSchedules();
  const toggleActive = useToggleEmployeeActive();
  const syncEmployees = useSyncEmployees();
  const { toast } = useToast();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingPhoneUserId, setEditingPhoneUserId] = useState<number | null>(null);
  const [accountFilter, setAccountFilter] = useState<AccountFilterValue>("alle");

  const scheduleMap = new Map<number, any>();
  if (schedules) {
    for (const s of schedules) scheduleMap.set(s.hn_user_id, s);
  }

  const filteredEmployees = (employees || []).filter((emp) => {
    if (accountFilter === "alle") return true;
    if (accountFilter === "inventar") return (emp.accounts || []).includes("Konto 1");
    if (accountFilter === "byg") return (emp.accounts || []).includes("Konto 2");
    return true;
  });

  const handleSync = async () => {
    try {
      const result = await syncEmployees.mutateAsync();
      toast({
        title: "Synkronisering fuldført",
        description: `${result.added} nye medarbejdere tilføjet, ${result.updated} opdateret.`,
      });
    } catch (err: any) {
      toast({
        title: "Fejl ved synkronisering",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Indlæser...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncEmployees.isPending}
        >
          {syncEmployees.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Opdater fra e-regnskab
        </Button>
        <AccountFilter value={accountFilter} onChange={setAccountFilter} />
      </div>

      {filteredEmployees.length === 0 ? (
        <p className="text-muted-foreground">
          {(!employees || employees.length === 0)
            ? 'Ingen medarbejdere endnu. Tryk "Opdater fra e-regnskab" for at hente medarbejdere.'
            : "Ingen medarbejdere matcher det valgte filter."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>hnUserID</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead>Skema</TableHead>
              <TableHead>Aktiv</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => {
              const schedule = scheduleMap.get(emp.hn_user_id);
              const hasCustom = !!schedule?.is_custom;
              const missingPhone = !emp.phone_number || emp.phone_number === "" || emp.phone_number === "+45";

              return (
                <TableRow key={emp.hn_user_id}>
                  <TableCell className="font-medium">{emp.employee_name}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.hn_user_id}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setEditingPhoneUserId(emp.hn_user_id)}
                      className="flex items-center gap-2 text-left hover:underline"
                    >
                      {missingPhone ? (
                        <span className="flex items-center gap-1 text-destructive text-sm">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Mangler telefonnummer
                        </span>
                      ) : (
                        <>
                          <span>{emp.phone_number}</span>
                          <Badge variant="outline" className="text-xs">
                            {emp.phone_source === "cellphone" && "mobil"}
                            {emp.phone_source === "phone" && "fastnet"}
                            {emp.phone_source === "manual" && "manuelt"}
                          </Badge>
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {(emp.accounts || []).map((a) => (
                      <Badge key={a} variant="outline" className="mr-1">
                        {a === "Konto 1" ? "Inventar" : a === "Konto 2" ? "Byg" : a}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {hasCustom ? (
                      <Badge variant="outline">Custom</Badge>
                    ) : (
                      <Badge variant="secondary">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={emp.is_active}
                      disabled={missingPhone}
                      onCheckedChange={(checked) =>
                        toggleActive.mutate({ hn_user_id: emp.hn_user_id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingUserId(emp.hn_user_id)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {editingUserId !== null && (
        <EmployeeScheduleDialog
          hnUserId={editingUserId}
          employeeName={employees?.find((e) => e.hn_user_id === editingUserId)?.employee_name || ""}
          currentSchedule={scheduleMap.get(editingUserId) || null}
          open={true}
          onOpenChange={(open) => { if (!open) setEditingUserId(null); }}
        />
      )}
    </div>
  );
};

export default EmployeeList;
