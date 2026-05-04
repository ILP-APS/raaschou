import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppointmentCategory {
  hn_appointment_category_id: number;
  name: string;
}

export const useAppointmentCategories = () => {
  const [categories, setCategories] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("appointment_categories")
        .select("hn_appointment_category_id, name");
      if (!mounted) return;
      if (!error && data) {
        const map = new Map<number, string>();
        data.forEach((c: any) => map.set(c.hn_appointment_category_id, c.name));
        setCategories(map);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { categories, loading };
};
