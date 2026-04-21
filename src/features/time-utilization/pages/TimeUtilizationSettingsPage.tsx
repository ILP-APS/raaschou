import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useUtilizationEmployees,
  useUtilizationSettings,
  useAppointmentCategories,
  useAppointmentWorktypes,
  useHourlyEmployeesInventar,
} from "../hooks/useTimeUtilization";

export default function TimeUtilizationSettingsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: selectedEmployees = [] } = useUtilizationEmployees();
  const { data: settings } = useUtilizationSettings();
  const { data: categories = [] } = useAppointmentCategories();
  const { data: worktypes = [] } = useAppointmentWorktypes();
  const { data: availableEmployees = [] } = useHourlyEmployeesInventar();

  const selectedIds = new Set(selectedEmployees.map((e) => e.hn_user_id));

  const [targetInput, setTargetInput] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setTargetInput(Math.round(settings.target_utilization * 100).toString());
    }
  }, [settings?.target_utilization]);

  const saveTarget = async () => {
    if (!settings) return;
    const parsed = parseFloat(targetInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast({ title: "Ugyldig værdi", description: "Skal være mellem 0 og 100", variant: "destructive" });
      setTargetInput(Math.round(settings.target_utilization * 100).toString());
      return;
    }
    const asFraction = parsed / 100;
    if (Math.abs(asFraction - settings.target_utilization) < 0.001) return;
    const { error } = await supabase
      .from("time_utilization_settings")
      .update({ target_utilization: asFraction, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) { toast({ title: "Fejl", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["time-utilization-settings"] });
    toast({ title: "Mål opdateret", description: `${parsed}%` });
  };

  const toggleEmployee = async (emp: { hn_user_id: number; name: string }) => {
    const isSelected = selectedIds.has(emp.hn_user_id);
    if (isSelected) {
      const { error } = await supabase
        .from("time_utilization_employees")
        .delete()
        .eq("hn_user_id", emp.hn_user_id);
      if (error) { toast({ title: "Fejl", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase
        .from("time_utilization_employees")
        .insert({ hn_user_id: emp.hn_user_id, employee_name: emp.name });
      if (error) { toast({ title: "Fejl", description: error.message, variant: "destructive" }); return; }
    }
    queryClient.invalidateQueries({ queryKey: ["time-utilization-employees"] });
  };

  const toggleCategory = async (id: number) => {
    if (!settings) return;
    const current = settings.intern_appointment_category_ids;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    const { error } = await supabase
      .from("time_utilization_settings")
      .update({ intern_appointment_category_ids: next, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) { toast({ title: "Fejl", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["time-utilization-settings"] });
  };

  const toggleWorktype = async (id: number) => {
    if (!settings) return;
    const current = settings.intern_work_type_ids;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    const { error } = await supabase
      .from("time_utilization_settings")
      .update({ intern_work_type_ids: next, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) { toast({ title: "Fejl", description: error.message, variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["time-utilization-settings"] });
  };

  const handleRefreshRefData = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-reference-data");
      if (error) throw error;
      toast({
        title: "Opdateret",
        description: `${data.categories} kategorier, ${data.worktypes} worktypes`,
      });
      queryClient.invalidateQueries({ queryKey: ["appointment-categories"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-worktypes"] });
    } catch (e: any) {
      toast({ title: "Fejl", description: e.message, variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/time-utilization"><ArrowLeft className="h-4 w-4 mr-1" /> Tilbage</Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">Indstillinger — Time Utilization</h1>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshRefData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Opdater kategorier/worktypes
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6 max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Utilization-mål</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      onBlur={saveTarget}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Utilization under målet markeres rødt, tæt på gult, på/over målet grønt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medarbejdere ({selectedEmployees.length} valgt)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {availableEmployees.map((emp) => (
                    <div key={emp.hn_user_id} className="flex items-center justify-between">
                      <Label htmlFor={`emp-${emp.hn_user_id}`}>{emp.name}</Label>
                      <Switch
                        id={`emp-${emp.hn_user_id}`}
                        checked={selectedIds.has(emp.hn_user_id)}
                        onCheckedChange={() => toggleEmployee(emp)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intern aftalekategorier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Ingen kategorier. Klik "Opdater kategorier/worktypes" øverst.
                    </p>
                  ) : categories.map((cat) => (
                    <div key={cat.hn_appointment_category_id} className="flex items-center justify-between">
                      <Label htmlFor={`cat-${cat.hn_appointment_category_id}`}>{cat.name}</Label>
                      <Switch
                        id={`cat-${cat.hn_appointment_category_id}`}
                        checked={settings?.intern_appointment_category_ids.includes(cat.hn_appointment_category_id) ?? false}
                        onCheckedChange={() => toggleCategory(cat.hn_appointment_category_id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intern worktypes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {worktypes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Ingen worktypes. Klik "Opdater kategorier/worktypes" øverst.
                    </p>
                  ) : worktypes.map((wt) => (
                    <div key={wt.hn_work_type_id} className="flex items-center justify-between">
                      <Label htmlFor={`wt-${wt.hn_work_type_id}`}>{wt.name}</Label>
                      <Switch
                        id={`wt-${wt.hn_work_type_id}`}
                        checked={settings?.intern_work_type_ids.includes(wt.hn_work_type_id) ?? false}
                        onCheckedChange={() => toggleWorktype(wt.hn_work_type_id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
