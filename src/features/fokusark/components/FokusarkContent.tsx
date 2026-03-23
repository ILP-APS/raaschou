
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FokusarkDescription from "./FokusarkDescription";
import ProjectsTable from "./ProjectsTable";

const FokusarkContent: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-eregnskab');
      if (error) throw error;
      toast({ title: "Data synkroniseret", description: `${data.projects_upserted} projekter opdateret fra e-regnskab.` });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({ title: "Fejl ved synkronisering", description: "Kunne ikke hente data fra e-regnskab.", variant: "destructive" });
    } finally {
      setTimeout(() => setIsUpdating(false), 3000);
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
        </div>
        <FokusarkDescription />
      </div>
      <div className="flex-1">
        <ProjectsTable />
      </div>
    </div>
  );
};

export default FokusarkContent;
