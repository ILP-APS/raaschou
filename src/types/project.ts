
export interface Project {
  id: string;
  name: string | null;
  responsible_person_initials: string | null;
  offer_amount: number | null;
  assembly_amount: number | null;
  subcontractor_amount: number | null;
  manual_assembly_amount: number | null;
  manual_subcontractor_amount: number | null;
  materials_amount: number | null;
  hours_estimated_projecting: number | null;
  hours_estimated_production: number | null;
  hours_estimated_assembly: number | null;
  hours_used_projecting: number | null;
  hours_used_production: number | null;
  hours_used_assembly: number | null;
  hours_used_total: number | null;
  hours_remaining_projecting: number | null;
  hours_remaining_production: number | null;
  hours_remaining_assembly: number | null;
  completion_percentage_manual: number | null;
  completion_percentage_previous: number | null;
  hours_estimated_by_completion: number | null;
  plus_minus_hours: number | null;
  allocated_freight_amount: number | null;
}
