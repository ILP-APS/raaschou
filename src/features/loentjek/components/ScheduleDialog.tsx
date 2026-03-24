import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EmployeeInfo } from "../hooks/useWeekData";

const DAYS = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
] as const;

const DEFAULTS: Record<string, number> = {
  monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0,
};

interface Props {
  employees: EmployeeInfo[];
  schedules: any[];
}

const ScheduleDialog: React.FC<Props> = ({ employees, schedules }) => {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [hours, setHours] = useState<Record<string, number>>({ ...DEFAULTS });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scheduleMap = new Map<number, any>();
  for (const s of schedules) scheduleMap.set(s.hn_user_id, s);

  const selectedEmployee = employees.find((e) => e.hn_user_id === Number(selectedUserId));
  const currentSchedule = selectedUserId ? scheduleMap.get(Number(selectedUserId)) : null;

  useEffect(() => {
    if (currentSchedule) {
      setHours(
        DAYS.reduce((acc, d) => ({ ...acc, [d.key]: currentSchedule[d.key] ?? DEFAULTS[d.key] }), {} as Record<string, number>)
      );
    } else {
      setHours({ ...DEFAULTS });
    }
  }, [selectedUserId, currentSchedule]);

  const upsertSchedule = useMutation({
    mutationFn: async (schedule: any) => {
      const { error } = await supabase
        .from("employee_work_schedules")
        .upsert(schedule, { onConflict: "hn_user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loentjek-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["employee-work-schedules"] });
    },
  });

  const handleSave = async () => {
    if (!selectedEmployee) return;
    try {
      await upsertSchedule.mutateAsync({
        hn_user_id: selectedEmployee.hn_user_id,
        employee_name: selectedEmployee.employee_name,
        is_custom: true,
        ...hours,
      });
      toast({ title: "Skema gemt", description: `Arbejdstider for ${selectedEmployee.employee_name} er opdateret.` });
    } catch (err: any) {
      toast({ title: "Fejl", description: err.message, variant: "destructive" });
    }
  };

  const totalWeek = DAYS.reduce((sum, d) => sum + (hours[d.key] ?? 0), 0);
  const isCustom = DAYS.some((d) => hours[d.key] !== DEFAULTS[d.key]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-1" />
          Sæt arbejdstid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Sæt medarbejders arbejdstid</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Medarbejder</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Vælg medarbejder..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.hn_user_id} value={String(emp.hn_user_id)}>
                    {emp.employee_name}
                    {scheduleMap.has(emp.hn_user_id) && " ✎"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dag</TableHead>
                      <TableHead className="text-center">Timer</TableHead>
                      <TableHead className="text-center text-muted-foreground">Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((day) => (
                      <TableRow key={day.key}>
                        <TableCell className="font-medium">{day.label}</TableCell>
                        <TableCell className="text-center p-1">
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            value={hours[day.key] ?? 0}
                            onChange={(e) =>
                              setHours((prev) => ({ ...prev, [day.key]: parseFloat(e.target.value) || 0 }))
                            }
                            className="w-20 mx-auto text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {DEFAULTS[day.key]}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-center font-semibold">{totalWeek.toFixed(1)}</TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">37.0</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {isCustom && (
                <p className="text-xs text-muted-foreground">
                  ✎ Afviger fra standard-skema (37 timer/uge)
                </p>
              )}

              <Button
                onClick={handleSave}
                disabled={upsertSchedule.isPending}
                className="w-full"
              >
                {upsertSchedule.isPending ? "Gemmer..." : "Gem skema"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
