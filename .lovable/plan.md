

# SQL til genskabelse af Fokusark-databasen

Kør disse queries i din Supabase SQL Editor: https://supabase.com/dashboard/project/xwxpbowfodnjienzrigj/sql/new

---

## Query 1: Opret tabeller

```sql
-- =====================
-- PROJECTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.projects (
  id text PRIMARY KEY,
  name text,
  responsible_person_initials text,
  offer_amount numeric,
  assembly_amount numeric,
  subcontractor_amount numeric,
  manual_assembly_amount numeric,
  manual_subcontractor_amount numeric,
  materials_amount numeric,
  hours_estimated_projecting numeric,
  hours_estimated_production numeric,
  hours_estimated_assembly numeric,
  hours_estimated_by_completion numeric,
  hours_used_projecting numeric,
  hours_used_production numeric,
  hours_used_assembly numeric,
  hours_used_total numeric,
  hours_remaining_projecting numeric,
  hours_remaining_production numeric,
  hours_remaining_assembly numeric,
  completion_percentage_manual numeric,
  completion_percentage_previous numeric,
  plus_minus_hours numeric,
  allocated_freight_amount numeric,
  last_api_update timestamptz,
  last_calculation_update timestamptz
);

-- =====================
-- OFFER LINE ITEMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.offer_line_items (
  "hnLineID" integer PRIMARY KEY,
  project_id text REFERENCES public.projects(id),
  description text,
  units numeric,
  "unitName" text,
  "salesPriceStandardCurrency" numeric,
  "totalPriceStandardCurrency" numeric,
  "hnBudgetLineID" integer
);

-- =====================
-- SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  description text,
  value numeric
);
```

## Query 2: RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Allow public read access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.projects FOR UPDATE USING (true);

-- Offer line items policies
CREATE POLICY "Allow public read access" ON public.offer_line_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.offer_line_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.offer_line_items FOR UPDATE USING (true);

-- Settings policies
CREATE POLICY "Allow public read access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.settings FOR UPDATE USING (true);
```

## Query 3: Database Functions

```sql
-- =====================
-- GET SETTING
-- =====================
CREATE OR REPLACE FUNCTION public.get_setting(p_key text)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT value FROM public.settings WHERE key = p_key;
$$;

-- =====================
-- UPSERT PROJECT (full, 18 params)
-- =====================
CREATE OR REPLACE FUNCTION public.upsert_project(
  p_id text,
  p_name text,
  p_responsible_person_initials text,
  p_offer_amount numeric,
  p_assembly_amount numeric,
  p_subcontractor_amount numeric,
  p_hours_used_projecting numeric,
  p_hours_used_production numeric,
  p_hours_used_assembly numeric,
  p_materials_amount numeric,
  p_hours_estimated_projecting numeric,
  p_hours_estimated_production numeric,
  p_hours_estimated_assembly numeric,
  p_hours_used_total numeric,
  p_hours_remaining_projecting numeric,
  p_hours_remaining_production numeric,
  p_hours_remaining_assembly numeric,
  p_allocated_freight_amount numeric,
  p_last_api_update text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.projects (
    id, name, responsible_person_initials, offer_amount, assembly_amount,
    subcontractor_amount, hours_used_projecting, hours_used_production,
    hours_used_assembly, materials_amount, hours_estimated_projecting,
    hours_estimated_production, hours_estimated_assembly, hours_used_total,
    hours_remaining_projecting, hours_remaining_production, hours_remaining_assembly,
    allocated_freight_amount, last_api_update
  ) VALUES (
    p_id, p_name, p_responsible_person_initials, p_offer_amount, p_assembly_amount,
    p_subcontractor_amount, p_hours_used_projecting, p_hours_used_production,
    p_hours_used_assembly, p_materials_amount, p_hours_estimated_projecting,
    p_hours_estimated_production, p_hours_estimated_assembly, p_hours_used_total,
    p_hours_remaining_projecting, p_hours_remaining_production, p_hours_remaining_assembly,
    p_allocated_freight_amount, p_last_api_update::timestamptz
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    responsible_person_initials = EXCLUDED.responsible_person_initials,
    offer_amount = EXCLUDED.offer_amount,
    assembly_amount = EXCLUDED.assembly_amount,
    subcontractor_amount = EXCLUDED.subcontractor_amount,
    hours_used_projecting = EXCLUDED.hours_used_projecting,
    hours_used_production = EXCLUDED.hours_used_production,
    hours_used_assembly = EXCLUDED.hours_used_assembly,
    materials_amount = EXCLUDED.materials_amount,
    hours_estimated_projecting = EXCLUDED.hours_estimated_projecting,
    hours_estimated_production = EXCLUDED.hours_estimated_production,
    hours_estimated_assembly = EXCLUDED.hours_estimated_assembly,
    hours_used_total = EXCLUDED.hours_used_total,
    hours_remaining_projecting = EXCLUDED.hours_remaining_projecting,
    hours_remaining_production = EXCLUDED.hours_remaining_production,
    hours_remaining_assembly = EXCLUDED.hours_remaining_assembly,
    allocated_freight_amount = EXCLUDED.allocated_freight_amount,
    last_api_update = EXCLUDED.last_api_update;
END;
$$;

-- =====================
-- UPSERT PROJECT FROM N8N (simplified, 9 params)
-- =====================
CREATE OR REPLACE FUNCTION public.upsert_project_from_n8n(
  p_id text,
  p_name text,
  p_responsible_person_initials text,
  p_offer_amount numeric,
  p_assembly_amount numeric,
  p_subcontractor_amount numeric,
  p_hours_used_projecting numeric,
  p_hours_used_production numeric,
  p_hours_used_assembly numeric,
  p_last_api_update text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.projects (
    id, name, responsible_person_initials, offer_amount, assembly_amount,
    subcontractor_amount, hours_used_projecting, hours_used_production,
    hours_used_assembly, last_api_update
  ) VALUES (
    p_id, p_name, p_responsible_person_initials, p_offer_amount, p_assembly_amount,
    p_subcontractor_amount, p_hours_used_projecting, p_hours_used_production,
    p_hours_used_assembly, p_last_api_update::timestamptz
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    responsible_person_initials = EXCLUDED.responsible_person_initials,
    offer_amount = EXCLUDED.offer_amount,
    assembly_amount = EXCLUDED.assembly_amount,
    subcontractor_amount = EXCLUDED.subcontractor_amount,
    hours_used_projecting = EXCLUDED.hours_used_projecting,
    hours_used_production = EXCLUDED.hours_used_production,
    hours_used_assembly = EXCLUDED.hours_used_assembly,
    last_api_update = EXCLUDED.last_api_update;
END;
$$;

-- =====================
-- UPSERT OFFER LINE ITEM
-- =====================
CREATE OR REPLACE FUNCTION public.upsert_offer_line_item(
  p_hnlineid integer,
  p_project_id text,
  p_description text,
  p_units numeric,
  p_unitname text,
  p_salespricestandardcurrency numeric,
  p_totalpricestandardcurrency numeric,
  p_hnbudgetlineid integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.offer_line_items (
    "hnLineID", project_id, description, units, "unitName",
    "salesPriceStandardCurrency", "totalPriceStandardCurrency", "hnBudgetLineID"
  ) VALUES (
    p_hnlineid, p_project_id, p_description, p_units, p_unitname,
    p_salespricestandardcurrency, p_totalpricestandardcurrency, p_hnbudgetlineid
  )
  ON CONFLICT ("hnLineID") DO UPDATE SET
    project_id = EXCLUDED.project_id,
    description = EXCLUDED.description,
    units = EXCLUDED.units,
    "unitName" = EXCLUDED."unitName",
    "salesPriceStandardCurrency" = EXCLUDED."salesPriceStandardCurrency",
    "totalPriceStandardCurrency" = EXCLUDED."totalPriceStandardCurrency",
    "hnBudgetLineID" = EXCLUDED."hnBudgetLineID";
END;
$$;

-- =====================
-- CALCULATE PROJECT METRICS (placeholder)
-- =====================
CREATE OR REPLACE FUNCTION public.calculate_project_metrics(project_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder: tilføj beregningslogik her
  UPDATE public.projects SET last_calculation_update = now() WHERE id = project_id;
END;
$$;

-- =====================
-- CALCULATE COMPLETION METRICS (placeholder)
-- =====================
CREATE OR REPLACE FUNCTION public.calculate_completion_metrics(project_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder: tilføj beregningslogik her
  UPDATE public.projects SET last_calculation_update = now() WHERE id = project_id;
END;
$$;
```

---

## Vigtige noter

- **Kør query 1 først**, derefter 2 og 3 (rækkefølgen er vigtig pga. foreign keys)
- `calculate_project_metrics` og `calculate_completion_metrics` er **placeholders** — den originale logik var kun i databasen og er gået tabt. Du skal muligvis genskabe beregningslogikken
- RLS er sat til public read + authenticated write, som matcher det originale setup
- Husk at reconnecte Supabase i Lovable bagefter (Projektindstillinger → Supabase)

