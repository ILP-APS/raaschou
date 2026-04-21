import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useUtilizationEmployees,
  useUtilizationSettings,
  useRegistrationsInRange,
  useAppointmentCategories,
  useAppointmentWorktypes,
} from "../hooks/useTimeUtilization";
import { summarize } from "../utils/classify";
import DateRangePicker from "../components/DateRangePicker";
import UtilizationTable from "../components/UtilizationTable";
import EmployeeBreakdownSheet from "../components/EmployeeBreakdownSheet";
import { buildBreakdown } from "../utils/breakdown";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firstOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function TimeUtilizationPage() {
  const [fromDate, setFromDate] = useState<Date>(firstOfMonth());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useUtilizationEmployees();
  const { data: settings } = useUtilizationSettings();
  const { data: registrations = [], isLoading } = useRegistrationsInRange(
    formatYMD(fromDate),
    formatYMD(toDate),
    employees.map((e) => e.hn_user_id),
  );
  const { data: categories = [] } = useAppointmentCategories();
  const { data: worktypes = [] } = useAppointmentWorktypes();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleSync = async () => {
    if (employees.length === 0) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-registrations", {
        body: {
          week_start: formatYMD(fromDate),
          week_end: formatYMD(toDate),
          hn_user_ids: employees.map((e) => e.hn_user_id),
        },
      });
      if (error) throw error;
      toast({
        title: "Synkroniseret",
        description: `${data.lines_synced} registreringer hentet`,
      });
      queryClient.invalidateQueries({ queryKey: ["utilization-regs"] });
    } catch (e: any) {
      toast({ title: "Sync fejlede", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const rows = settings ? summarize(registrations, employees, settings) : [];

  const selectedEmployee = selectedUserId
    ? employees.find((e) => e.hn_user_id === selectedUserId)
    : null;

  const breakdown = (settings && selectedUserId)
    ? buildBreakdown(
        registrations.filter((r) => r.hn_user_id === selectedUserId),
        settings,
        categories,
        worktypes,
      )
    : null;

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-semibold">Time Utilization</h1>
              <p className="text-sm text-muted-foreground">
                Fakturerbare timer som % af totalt registrerede timer
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <DateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onChange={(f, t) => { setFromDate(f); setToDate(t); }}
                />
                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing || employees.length === 0}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Synkroniserer..." : "Opdater fra e-regnskab"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/time-utilization/settings">
                    <SettingsIcon className="h-4 w-4 mr-1" />
                    Indstillinger
                  </Link>
                </Button>
              </div>
              {employees.length === 0 ? (
                <p className="text-muted-foreground">
                  Ingen medarbejdere tilføjet. Gå til{" "}
                  <Link to="/time-utilization/settings" className="underline">
                    Indstillinger
                  </Link>{" "}
                  for at tilføje.
                </p>
              ) : isLoading ? (
                <p className="text-muted-foreground">Indlæser...</p>
              ) : (
                <UtilizationTable rows={rows} onSelectEmployee={setSelectedUserId} />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
      <EmployeeBreakdownSheet
        open={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        employeeName={selectedEmployee?.employee_name ?? null}
        fromDate={fromDate}
        toDate={toDate}
        breakdown={breakdown}
      />
    </SidebarProvider>
  );
}
