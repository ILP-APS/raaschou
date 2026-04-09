import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoentjekHeader from "../components/LoentjekHeader";
import WeekSelector from "../components/WeekSelector";
import WeekOverviewTable from "../components/WeekOverviewTable";
import ScheduleDialog from "../components/ScheduleDialog";
import AccountFilter, { type AccountFilterValue } from "@/components/AccountFilter";
import { useWeekData } from "../hooks/useWeekData";
import { useHiddenEmployees, type HiddenFilter } from "../hooks/useHiddenEmployees";
import { getCurrentWeekRange, shiftWeek, formatDateStr } from "../utils/weekUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function LoentjekPage() {
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange);
  const [syncing, setSyncing] = useState(false);
  const [accountFilter, setAccountFilter] = useState<AccountFilterValue>("alle");
  const [showHidden, setShowHidden] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { employees, registrations, schedules, isLoading } = useWeekData(weekRange);
  const { isHidden, hiddenCountForFilter, hide, unhide } = useHiddenEmployees();

  const activeFilter = accountFilter !== "alle" ? (accountFilter as HiddenFilter) : null;
  const hiddenCount = activeFilter ? hiddenCountForFilter(activeFilter) : 0;

  const filteredEmployees = employees.filter((emp) => {
    if (accountFilter === "alle") return true;
    if (accountFilter === "inventar" && !emp.accounts.includes("Konto 1")) return false;
    if (accountFilter === "byg" && !emp.accounts.includes("Konto 2")) return false;

    // Apply hidden filter
    if (activeFilter && !showHidden && isHidden(emp.hn_user_id, activeFilter)) return false;

    return true;
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-registrations", {
        body: { week_start: formatDateStr(weekRange.start) },
      });
      if (error) throw error;
      toast({
        title: "Synkroniseret",
        description: `${data.lines_synced} registreringer hentet for ${data.employees} medarbejdere`,
      });
      queryClient.invalidateQueries({ queryKey: ["loentjek-registrations"] });
    } catch (e: any) {
      toast({ title: "Sync fejlede", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <LoentjekHeader />
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <WeekSelector
                  weekRange={weekRange}
                  onPrev={() => setWeekRange((w) => shiftWeek(w, -1))}
                  onNext={() => setWeekRange((w) => shiftWeek(w, 1))}
                />
                <AccountFilter value={accountFilter} onChange={setAccountFilter} />
                {activeFilter && hiddenCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-hidden"
                      checked={showHidden}
                      onCheckedChange={setShowHidden}
                    />
                    <Label htmlFor="show-hidden" className="text-sm text-muted-foreground">
                      Vis skjulte ({hiddenCount})
                    </Label>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Synkroniserer..." : "Opdater fra e-regnskab"}
                </Button>
                <ScheduleDialog employees={employees} schedules={schedules} />
              </div>
              {isLoading ? (
                <p className="text-muted-foreground">Indlæser...</p>
              ) : (
                <WeekOverviewTable
                  employees={filteredEmployees}
                  registrations={registrations}
                  schedules={schedules}
                  weekRange={weekRange}
                  activeFilter={activeFilter}
                  showHidden={showHidden}
                  isHidden={isHidden}
                  onHide={hide}
                  onUnhide={unhide}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
