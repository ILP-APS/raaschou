import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, Trash2 } from "lucide-react";
import { useAutomationEmployees, useToggleEmployeeActive, useRemoveEmployee, useEmployeeSchedules } from "../hooks/useEmployees";
import EmployeeScheduleDialog from "./EmployeeScheduleDialog";
import AddEmployeeDialog from "./AddEmployeeDialog";

const DEFAULT_HOURS = { monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0 };

const EmployeeList: React.FC = () => {
  const { data: employees, isLoading } = useAutomationEmployees();
  const { data: schedules } = useEmployeeSchedules();
  const toggleActive = useToggleEmployeeActive();
  const removeEmployee = useRemoveEmployee();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const scheduleMap = new Map<number, any>();
  if (schedules) {
    for (const s of schedules) scheduleMap.set(s.hn_user_id, s);
  }

  if (isLoading) return <p className="text-muted-foreground">Indlæser...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AddEmployeeDialog />
      </div>

      {(!employees || employees.length === 0) ? (
        <p className="text-muted-foreground">Ingen medarbejdere tilføjet endnu. Tilføj medarbejdere for at aktivere SMS-automationen.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>hnUserID</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Skema</TableHead>
              <TableHead>Aktiv</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const schedule = scheduleMap.get(emp.hn_user_id);
              const hasCustom = !!schedule?.is_custom;

              return (
                <TableRow key={emp.hn_user_id}>
                  <TableCell className="font-medium">{emp.employee_name}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.hn_user_id}</TableCell>
                  <TableCell>{emp.phone_number}</TableCell>
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
