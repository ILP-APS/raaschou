import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FokusarkSettings {
  material_share: number;
  average_hourly_rate: number;
  assembly_hourly_rate: number;
  projecting_share: number;
  projecting_hourly_rate: number;
  freight_share: number;
}

const DEFAULTS: FokusarkSettings = {
  material_share: 0.25,
  average_hourly_rate: 750,
  assembly_hourly_rate: 630,
  projecting_share: 0.10,
  projecting_hourly_rate: 830,
  freight_share: 0.08,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<FokusarkSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value");
      if (error) throw error;
      if (data) {
        const mapped = { ...DEFAULTS };
        data.forEach((row: { key: string; value: number | null }) => {
          if (row.key in mapped && row.value !== null) {
            (mapped as any)[row.key] = Number(row.value);
          }
        });
        setSettings(mapped);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: number) => {
    try {
      const { error } = await supabase
        .from("settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({ title: "Indstilling opdateret", description: `${key} er nu ${value}` });
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({ title: "Fejl", description: "Kunne ikke gemme indstillingen.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
};
