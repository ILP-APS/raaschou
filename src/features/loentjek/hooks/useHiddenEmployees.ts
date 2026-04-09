import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HiddenFilter = "inventar" | "byg";

interface HiddenEmployee {
  id: string;
  hn_user_id: number;
  filter: string;
}

export function useHiddenEmployees() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["hidden-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hidden_employees")
        .select("id, hn_user_id, filter");
      if (error) throw error;
      return data as HiddenEmployee[];
    },
  });

  const hideMutation = useMutation({
    mutationFn: async ({ hn_user_id, filter }: { hn_user_id: number; filter: HiddenFilter }) => {
      const { error } = await supabase
        .from("hidden_employees")
        .insert({ hn_user_id, filter });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hidden-employees"] }),
  });

  const unhideMutation = useMutation({
    mutationFn: async ({ hn_user_id, filter }: { hn_user_id: number; filter: HiddenFilter }) => {
      const { error } = await supabase
        .from("hidden_employees")
        .delete()
        .eq("hn_user_id", hn_user_id)
        .eq("filter", filter);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hidden-employees"] }),
  });

  const isHidden = (hn_user_id: number, filter: HiddenFilter) =>
    (query.data ?? []).some((h) => h.hn_user_id === hn_user_id && h.filter === filter);

  const hiddenCountForFilter = (filter: HiddenFilter) =>
    (query.data ?? []).filter((h) => h.filter === filter).length;

  return {
    hiddenEmployees: query.data ?? [],
    isHidden,
    hiddenCountForFilter,
    hide: hideMutation.mutate,
    unhide: unhideMutation.mutate,
    isLoading: query.isLoading,
  };
}
