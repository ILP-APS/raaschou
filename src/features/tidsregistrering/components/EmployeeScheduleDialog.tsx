import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertSchedule, EmployeeSchedule } from "../hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { key: "monday", label: "Mandag" },
  { key: "tuesday", label: "Tirsdag" },
  { key: "wednesday", label: "Onsdag" },
  { key: "thursday", label: "Torsdag" },
  { key: "friday", label: "Fredag" },
  { key: "saturday", label: "Lørdag" },
  { key: "sunday", label: "Søndag" },
] as const;

const DEFAULTS = { monday: 7.5, tuesday: 7.5, wednesday: 7.5, thursday: 7.5, friday: 7.0, saturday: 0, sunday: 0 };

interface Props {
  hnUserId: number;
  employeeName: string;
  currentSchedule: EmployeeSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmployeeScheduleDialog: React.FC<Props> = ({ hnUserId, employeeName, currentSchedule, open, onOpenChange }) => {
  const [hours, setHours] = useState<Record<string, number>>(() => {
    if (currentSchedule) {
      return DAYS.reduce((acc, d) => ({ ...acc, [d.key]: currentSchedule[d.key] ?? DEFAULTS[d.key] }), {});
    }
    return { ...DEFAULTS };
  });

  const upsertSchedule = useUpsertSchedule();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await upsertSchedule.mutateAsync({
        hn_user_id: hnUserId,
        employee_name: employeeName,
        is_custom: true,
        ...hours,
      } as any);
      toast({ title: "Skema gemt", description: `Custom arbejdstider for ${employeeName} er opdateret.` });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Fejl", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arbejdstider — {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day.key} className="flex items-center justify-between gap-4">
              <Label className="w-24">{day.label}</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours[day.key] ?? 0}
                onChange={(e) => setHours((prev) => ({ ...prev, [day.key]: parseFloat(e.target.value) || 0 }))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">timer</span>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={upsertSchedule.isPending} className="w-full mt-4">
          {upsertSchedule.isPending ? "Gemmer..." : "Gem skema"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeScheduleDialog;
