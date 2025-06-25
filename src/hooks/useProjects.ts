
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error fetching projects",
          description: "There was a problem loading the project data.",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update completion percentage
  const updateCompletionPercentage = async (projectId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ completion_percentage_manual: value })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating completion percentage:', error);
        toast({
          title: "Error updating completion percentage",
          description: "There was a problem saving the changes.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Completion percentage updated",
        description: "The completion percentage has been saved successfully.",
      });

      // Refresh the data to get updated calculations
      fetchProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    projects,
    loading,
    updateCompletionPercentage,
  };
};
