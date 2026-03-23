
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "../types/project";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching projects:', error);
          toast({
            title: "Error fetching projects",
            description: "There was a problem loading the project data.",
            variant: "destructive",
          });
          return;
        }

        allData = allData.concat(data || []);
        hasMore = (data?.length || 0) === pageSize;
        from += pageSize;
      }

      allData.sort((a, b) => {
        const numA = parseInt(a.id.split('-')[0], 10) || 0;
        const numB = parseInt(b.id.split('-')[0], 10) || 0;
        if (numB !== numA) return numB - numA;
        return b.id.localeCompare(a.id);
      });

      setProjects(allData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompletionPercentage = async (projectId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ completion_percentage_manual: value })
        .eq('id', projectId);
      if (error) {
        toast({ title: "Error updating completion percentage", description: "There was a problem saving the changes.", variant: "destructive" });
        return;
      }
      toast({ title: "Completion percentage updated", description: "The completion percentage has been saved successfully." });
      fetchProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateManualAssemblyAmount = async (projectId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ manual_assembly_amount: value })
        .eq('id', projectId);
      if (error) {
        toast({ title: "Error updating manual assembly amount", description: "There was a problem saving the changes.", variant: "destructive" });
        return;
      }
      toast({ title: "Manual assembly amount updated", description: "The manual assembly amount has been saved successfully." });
      fetchProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateManualSubcontractorAmount = async (projectId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ manual_subcontractor_amount: value })
        .eq('id', projectId);
      if (error) {
        toast({ title: "Error updating manual subcontractor amount", description: "There was a problem saving the changes.", variant: "destructive" });
        return;
      }
      toast({ title: "Manual subcontractor amount updated", description: "The manual subcontractor amount has been saved successfully." });
      fetchProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { fetchProjects(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { projects, loading, updateCompletionPercentage, updateManualAssemblyAmount, updateManualSubcontractorAmount };
};
