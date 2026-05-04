
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FokusarkDescription from "./FokusarkDescription";
import ProjectsTable from "./ProjectsTable";
import { FokusarkFilterBar } from "./FokusarkFilterBar";
import { useSettings } from "../hooks/useSettings";
import { useProjects } from "../hooks/useProjects";
import { useFokusarkFilters } from "../hooks/useFokusarkFilters";
import { useAppointmentCategories } from "../hooks/useAppointmentCategories";
import { SettingsPanel } from "./SettingsPanel";
import { exportFokusarkToExcel } from "../utils/exportToExcel";
import { parseProjectHierarchy } from "../utils/projectHierarchy";
import { Project } from "../types/project";

const FokusarkContent: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { settings, updateSetting } = useSettings();
  const { projects, loading, fetchProjects, updateCompletionPercentage, updateManualAssemblyAmount, updateManualSubcontractorAmount } = useProjects();
  const { filters, update: updateFilter, clearAll: clearFilters } = useFokusarkFilters();
  const { categories } = useAppointmentCategories();

  const totalParents = useMemo(
    () => parseProjectHierarchy(projects, settings.min_offer_amount).length,
    [projects, settings.min_offer_amount],
  );
  const filteredParents = useMemo(
    () => parseProjectHierarchy(projects, settings.min_offer_amount, filters).length,
    [projects, settings.min_offer_amount, filters],
  );

  const handleUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-eregnskab');
      if (error) throw error;
      await fetchProjects();
      toast({ title: "Data synkroniseret", description: `${data.projects_upserted} projekter opdateret fra e-regnskab.` });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({ title: "Fejl ved synkronisering", description: "Kunne ikke hente data fra e-regnskab.", variant: "destructive" });
    } finally {
      setTimeout(() => setIsUpdating(false), 3000);
    }
  };

  const handleDownloadExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const hierarchies = parseProjectHierarchy(projects, settings.min_offer_amount, filters);
      const visible: Project[] = [];
      for (const h of hierarchies) {
        visible.push(h.parent);
        visible.push(...h.children);
      }
      await exportFokusarkToExcel(visible, settings.min_offer_amount);
      toast({ title: "Excel hentet", description: "Fokusark er downloadet." });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({ title: "Fejl ved eksport", description: "Kunne ikke generere Excel-fil.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-start gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Fokusark</h2>
          <Button onClick={handleUpdate} disabled={isUpdating} variant="outline" className="gap-2">
            {isUpdating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Synkroniserer...</>
            ) : (
              <><RefreshCw className="h-4 w-4" />Opdater fra e-regnskab</>
            )}
          </Button>
          <Button onClick={handleDownloadExcel} disabled={isExporting || projects.length === 0} variant="outline" className="gap-2">
            {isExporting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Eksporterer...</>
            ) : (
              <><Download className="h-4 w-4" />Download Excel</>
            )}
          </Button>
          <SettingsPanel settings={settings} onUpdateSetting={async (key, value) => {
            await updateSetting(key, value);
            await fetchProjects();
          }} />
        </div>
        <FokusarkFilterBar
          projects={projects}
          categories={categories}
          filters={filters}
          onUpdate={updateFilter}
          onClearAll={clearFilters}
          filteredCount={filteredParents}
          totalCount={totalParents}
        />
        <FokusarkDescription />
      </div>
      <div className="flex-1">
        <ProjectsTable
          projects={projects}
          loading={loading}
          filters={filters}
          onClearFilters={clearFilters}
          onUpdateCompletionPercentage={updateCompletionPercentage}
          onUpdateManualAssemblyAmount={updateManualAssemblyAmount}
          onUpdateManualSubcontractorAmount={updateManualSubcontractorAmount}
        />
      </div>
    </div>
  );
};

export default FokusarkContent;
