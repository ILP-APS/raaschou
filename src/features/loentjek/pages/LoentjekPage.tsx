import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoentjekHeader from "../components/LoentjekHeader";
import WeekSelector from "../components/WeekSelector";
import WeekOverviewTable from "../components/WeekOverviewTable";
import { useWeekData } from "../hooks/useWeekData";
import { getCurrentWeekRange, shiftWeek, formatDateStr } from "../utils/weekUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function LoentjekPage() {
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { employees, registrations, schedules, isLoading } = useWeekData(weekRange);

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
      // Refresh registrations data
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Synkroniserer..." : "Opdater fra e-regnskab"}
                </Button>
              </div>
              {isLoading ? (
                <p className="text-muted-foreground">Indlæser...</p>
              ) : (
                <WeekOverviewTable
                  employees={employees}
                  registrations={registrations}
                  schedules={schedules}
                  weekRange={weekRange}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
