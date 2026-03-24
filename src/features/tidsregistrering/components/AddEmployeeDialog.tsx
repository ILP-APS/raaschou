import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useAddEmployee } from "../hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HourlyEmployee {
  hn_user_id: number;
  name: string;
  cellphone: string;
}

const AddEmployeeDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hourlyEmployees, setHourlyEmployees] = useState<HourlyEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const addEmployee = useAddEmployee();
  const { toast } = useToast();

  useEffect(() => {
    if (open && hourlyEmployees.length === 0) {
      fetchHourlyEmployees();
    }
  }, [open]);

  const fetchHourlyEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-hourly-employees");
      if (error) throw error;
      setHourlyEmployees(data || []);
    } catch (err: any) {
      toast({ title: "Fejl", description: "Kunne ikke hente medarbejdere fra e-regnskab: " + err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;

    const emp = hourlyEmployees.find((e) => e.hn_user_id === parseInt(selectedUserId));
    if (!emp) return;

    const phone = emp.cellphone
      ? (emp.cellphone.startsWith("+45") ? emp.cellphone : `+45${emp.cellphone.replace(/\D/g, "")}`)
      : "";

    if (!phone) {
      toast({ title: "Fejl", description: `${emp.name} har intet mobilnummer i e-regnskab.`, variant: "destructive" });
      return;
    }

    try {
      await addEmployee.mutateAsync({
        hn_user_id: emp.hn_user_id,
        employee_name: emp.name,
        phone_number: phone,
        is_active: true,
      });
      toast({ title: "Medarbejder tilføjet", description: `${emp.name} er nu aktiv i SMS-automationen.` });
      setSelectedUserId("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Fejl", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Tilføj medarbejder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tilføj medarbejder til SMS-automation</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Henter timelønnede fra e-regnskab...
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Vælg medarbejder..." />
              </SelectTrigger>
              <SelectContent>
                {hourlyEmployees.map((emp) => (
                  <SelectItem key={emp.hn_user_id} value={String(emp.hn_user_id)}>
                    {emp.name} {emp.cellphone ? `(${emp.cellphone})` : "(intet nr.)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedUserId && (() => {
              const emp = hourlyEmployees.find((e) => e.hn_user_id === parseInt(selectedUserId));
              if (!emp) return null;
              return (
                <div className="text-sm text-muted-foreground space-y-1 border rounded-md p-3">
                  <p><span className="font-medium">Navn:</span> {emp.name}</p>
                  <p><span className="font-medium">hnUserID:</span> {emp.hn_user_id}</p>
                  <p><span className="font-medium">Mobil:</span> {emp.cellphone || "Ikke udfyldt"}</p>
                </div>
              );
            })()}

            <Button
              onClick={handleAdd}
              disabled={!selectedUserId || addEmployee.isPending}
              className="w-full"
            >
              {addEmployee.isPending ? "Tilføjer..." : "Tilføj"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
