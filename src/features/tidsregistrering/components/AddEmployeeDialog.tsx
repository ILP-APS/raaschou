import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useAddEmployee } from "../hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

const AddEmployeeDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [hnUserId, setHnUserId] = useState("");
  const [phone, setPhone] = useState("");
  const addEmployee = useAddEmployee();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hnUserId || !phone) return;

    try {
      await addEmployee.mutateAsync({
        hn_user_id: parseInt(hnUserId),
        employee_name: name,
        phone_number: phone.startsWith("+45") ? phone : `+45${phone.replace(/\D/g, "")}`,
        is_active: true,
      });
      toast({ title: "Medarbejder tilføjet", description: `${name} er nu aktiv i SMS-automationen.` });
      setName("");
      setHnUserId("");
      setPhone("");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Fornavn Efternavn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hnUserId">hnUserID (fra e-regnskab)</Label>
            <Input id="hnUserId" value={hnUserId} onChange={(e) => setHnUserId(e.target.value)} placeholder="12345" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobilnummer</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="23420525" required />
          </div>
          <Button type="submit" disabled={addEmployee.isPending} className="w-full">
            {addEmployee.isPending ? "Tilføjer..." : "Tilføj"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
