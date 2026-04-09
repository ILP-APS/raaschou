import { Project } from "../types/project";
import { FokusarkSettings } from "../hooks/useSettings";

export const calculateProjectFields = (
  project: Project,
  settings: FokusarkSettings
): Project => {
  const D = project.offer_amount ?? 0;
  const E = project.manual_assembly_amount ?? project.assembly_amount ?? 0;
  const F = project.manual_subcontractor_amount ?? project.subcontractor_amount ?? 0;
  const K = project.hours_used_projecting ?? 0;
  const M = project.hours_used_assembly ?? 0;
  const N = project.hours_used_total ?? 0;
  const Q = project.completion_percentage_manual ?? 0;

  const G = (D - E - F) * settings.material_share;
  const H = (D - E) * settings.projecting_share / settings.projecting_hourly_rate;
  const I = (D - E - G - F) / settings.average_hourly_rate - H;
  const J = (E - E * settings.freight_share) / settings.assembly_hourly_rate;
  const L = N - M - K;
  const O = H - K;
  const P = I - L;
  const S = I * Q;
  const T = -L + S;
  const U = J - M;
  const V = settings.freight_share * E;

  return {
    ...project,
    materials_amount: G,
    hours_estimated_projecting: H,
    hours_estimated_production: I,
    hours_estimated_assembly: J,
    hours_used_production: L,
    hours_remaining_projecting: O,
    hours_remaining_production: P,
    hours_estimated_by_completion: S,
    plus_minus_hours: T,
    hours_remaining_assembly: U,
    allocated_freight_amount: V,
  };
};

export const calculateAllProjects = (
  projects: Project[],
  settings: FokusarkSettings
): Project[] => {
  return projects.map((p) => calculateProjectFields(p, settings));
};
