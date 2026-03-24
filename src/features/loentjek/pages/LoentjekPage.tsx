import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LoentjekHeader from "../components/LoentjekHeader";
import WeekSelector from "../components/WeekSelector";
import WeekOverviewTable from "../components/WeekOverviewTable";
import { useWeekData } from "../hooks/useWeekData";
import { getCurrentWeekRange, shiftWeek } from "../utils/weekUtils";

export default function LoentjekPage() {
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange);

  const { employees, registrations, schedules, isLoading } = useWeekData(weekRange);

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <LoentjekHeader />
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <WeekSelector
                weekRange={weekRange}
                onPrev={() => setWeekRange((w) => shiftWeek(w, -1))}
                onNext={() => setWeekRange((w) => shiftWeek(w, 1))}
              />
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
