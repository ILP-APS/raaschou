
CREATE OR REPLACE FUNCTION public.recalculate_project_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  s_material_share numeric;
  s_average_hourly_rate numeric;
  s_assembly_hourly_rate numeric;
  s_projecting_share numeric;
  s_projecting_hourly_rate numeric;
  s_freight_share numeric;
  v_D numeric;
  v_E numeric;
  v_F numeric;
  v_K numeric;
  v_M numeric;
  v_N numeric;
  v_Q numeric;
  v_G numeric;
  v_H numeric;
  v_I numeric;
  v_J numeric;
  v_L numeric;
BEGIN
  IF (OLD.manual_assembly_amount IS NOT DISTINCT FROM NEW.manual_assembly_amount)
     AND (OLD.manual_subcontractor_amount IS NOT DISTINCT FROM NEW.manual_subcontractor_amount)
     AND (OLD.completion_percentage_manual IS NOT DISTINCT FROM NEW.completion_percentage_manual)
  THEN
    RETURN NEW;
  END IF;

  IF (OLD.completion_percentage_manual IS DISTINCT FROM NEW.completion_percentage_manual) THEN
    NEW.completion_percentage_previous := OLD.completion_percentage_manual;
  END IF;

  SELECT COALESCE(value, 0.25) INTO s_material_share FROM settings WHERE key = 'material_share';
  SELECT COALESCE(value, 750) INTO s_average_hourly_rate FROM settings WHERE key = 'average_hourly_rate';
  SELECT COALESCE(value, 630) INTO s_assembly_hourly_rate FROM settings WHERE key = 'assembly_hourly_rate';
  SELECT COALESCE(value, 0.10) INTO s_projecting_share FROM settings WHERE key = 'projecting_share';
  SELECT COALESCE(value, 830) INTO s_projecting_hourly_rate FROM settings WHERE key = 'projecting_hourly_rate';
  SELECT COALESCE(value, 0.08) INTO s_freight_share FROM settings WHERE key = 'freight_share';

  v_D := COALESCE(NEW.offer_amount, 0);
  v_E := COALESCE(NEW.assembly_amount, 0) + COALESCE(NEW.manual_assembly_amount, 0);
  v_F := COALESCE(NEW.subcontractor_amount, 0) + COALESCE(NEW.manual_subcontractor_amount, 0);
  v_K := COALESCE(NEW.hours_used_projecting, 0);
  v_M := COALESCE(NEW.hours_used_assembly, 0);
  v_N := COALESCE(NEW.hours_used_total, 0);
  v_Q := COALESCE(NEW.completion_percentage_manual, 0);

  v_G := (v_D - v_E - v_F) * s_material_share;
  v_H := (v_D - v_E) * s_projecting_share / s_projecting_hourly_rate;
  v_I := (v_D - v_E - v_G - v_F) / s_average_hourly_rate - v_H;
  v_J := (v_E - v_E * s_freight_share) / s_assembly_hourly_rate;
  v_L := v_N - v_M - v_K;

  NEW.materials_amount := v_G;
  NEW.hours_estimated_projecting := v_H;
  NEW.hours_estimated_production := v_I;
  NEW.hours_estimated_assembly := v_J;
  NEW.hours_used_production := v_L;
  NEW.hours_remaining_projecting := v_H - v_K;
  NEW.hours_remaining_production := v_I - v_L;
  NEW.hours_estimated_by_completion := v_I * v_Q / 100;
  NEW.plus_minus_hours := -v_L + (v_I * v_Q / 100);
  NEW.hours_remaining_assembly := v_J - v_M;
  NEW.allocated_freight_amount := s_freight_share * v_E;
  NEW.last_calculation_update := now();

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recalculate_all_projects_on_settings_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  s_material_share numeric;
  s_average_hourly_rate numeric;
  s_assembly_hourly_rate numeric;
  s_projecting_share numeric;
  s_projecting_hourly_rate numeric;
  s_freight_share numeric;
BEGIN
  SELECT COALESCE(value, 0.25) INTO s_material_share FROM settings WHERE key = 'material_share';
  SELECT COALESCE(value, 750) INTO s_average_hourly_rate FROM settings WHERE key = 'average_hourly_rate';
  SELECT COALESCE(value, 630) INTO s_assembly_hourly_rate FROM settings WHERE key = 'assembly_hourly_rate';
  SELECT COALESCE(value, 0.10) INTO s_projecting_share FROM settings WHERE key = 'projecting_share';
  SELECT COALESCE(value, 830) INTO s_projecting_hourly_rate FROM settings WHERE key = 'projecting_hourly_rate';
  SELECT COALESCE(value, 0.08) INTO s_freight_share FROM settings WHERE key = 'freight_share';

  UPDATE projects SET
    materials_amount = (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0))) * s_material_share,
    hours_estimated_projecting = (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate,
    hours_estimated_production = (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))
       - ((COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0))) * s_material_share)
       - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0)))
      / s_average_hourly_rate
    ) - (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate
    ),
    hours_estimated_assembly = ((COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) * s_freight_share) / s_assembly_hourly_rate,
    hours_used_production = COALESCE(hours_used_total, 0) - COALESCE(hours_used_assembly, 0) - COALESCE(hours_used_projecting, 0),
    hours_remaining_projecting = (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate
    ) - COALESCE(hours_used_projecting, 0),
    hours_remaining_production = (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))
       - ((COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0))) * s_material_share)
       - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0)))
      / s_average_hourly_rate
    ) - (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate
    ) - (COALESCE(hours_used_total, 0) - COALESCE(hours_used_assembly, 0) - COALESCE(hours_used_projecting, 0)),
    hours_estimated_by_completion = (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))
       - ((COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0))) * s_material_share)
       - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0)))
      / s_average_hourly_rate
    - (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate
    ) * COALESCE(completion_percentage_manual, 0),
    plus_minus_hours = -(COALESCE(hours_used_total, 0) - COALESCE(hours_used_assembly, 0) - COALESCE(hours_used_projecting, 0)) + (
      (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))
       - ((COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0))) * s_material_share)
       - (COALESCE(subcontractor_amount,0) + COALESCE(manual_subcontractor_amount,0)))
      / s_average_hourly_rate
    - (COALESCE(offer_amount,0) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0))) * s_projecting_share / s_projecting_hourly_rate
    ) * COALESCE(completion_percentage_manual, 0),
    hours_remaining_assembly = (
      ((COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) - (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)) * s_freight_share) / s_assembly_hourly_rate
    ) - COALESCE(hours_used_assembly, 0),
    allocated_freight_amount = s_freight_share * (COALESCE(assembly_amount,0) + COALESCE(manual_assembly_amount,0)),
    last_calculation_update = now()
  WHERE id IS NOT NULL;

  RETURN NEW;
END;
$function$;
