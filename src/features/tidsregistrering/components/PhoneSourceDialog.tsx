import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUpdatePhoneSource, type AutomationEmployee, type PhoneSource } from "../hooks/useEmployees";

interface Props {
  employee: AutomationEmployee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PhoneSourceDialog: React.FC<Props> = ({ employee, open, onOpenChange }) => {
  const updatePhoneSource = useUpdatePhoneSource();
  const { toast } = useToast();

  const [source, setSource] = useState<PhoneSource>(employee.phone_source);
  const [manualNumber, setManualNumber] = useState(employee.manual_phone_number || "");

  useEffect(() => {
    setSource(employee.phone_source);
    setManualNumber(employee.manual_phone_number || "");
  }, [employee.hn_user_id, employee.phone_source, employee.manual_phone_number]);

  const handleSave = async () => {
    try {
      await updatePhoneSource.mutateAsync({
        hn_user_id: employee.hn_user_id,
        phone_source: source,
        manual_phone_number: source === "manual" ? manualNumber : null,
      });
      toast({ title: "Telefonnummer opdateret" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Fejl", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telefonnummer for {employee.employee_name}</DialogTitle>
          <DialogDescription>
            Vælg hvilket nummer SMS-påmindelser skal sendes til.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={source} onValueChange={(v) => setSource(v as PhoneSource)} className="space-y-3">
          <div className="flex items-start gap-2">
            <RadioGroupItem value="cellphone" id="src-cellphone" className="mt-1" />
            <Label htmlFor="src-cellphone" className="flex-1 cursor-pointer">
              <div className="font-medium">Mobil (e-regnskab)</div>
              <div className="text-sm text-muted-foreground">
                {employee.eregnskab_cellphone || <em>ikke registreret</em>}
              </div>
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <RadioGroupItem value="phone" id="src-phone" className="mt-1" />
            <Label htmlFor="src-phone" className="flex-1 cursor-pointer">
              <div className="font-medium">Fastnet (e-regnskab)</div>
              <div className="text-sm text-muted-foreground">
                {employee.eregnskab_phone || <em>ikke registreret</em>}
              </div>
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <RadioGroupItem value="manual" id="src-manual" className="mt-1" />
            <Label htmlFor="src-manual" className="flex-1 cursor-pointer">
              <div className="font-medium">Eget nummer</div>
              <div className="text-sm text-muted-foreground">
                Indtastet manuelt — sync rør det aldrig.
              </div>
            </Label>
          </div>
        </RadioGroup>

        {source === "manual" && (
          <div className="space-y-2">
            <Label htmlFor="manual-input">Telefonnummer</Label>
            <Input
              id="manual-input"
              placeholder="+4512345678"
              value={manualNumber}
              onChange={(e) => setManualNumber(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annullér</Button>
          <Button onClick={handleSave} disabled={updatePhoneSource.isPending}>
            Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneSourceDialog;
