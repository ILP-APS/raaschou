import { Project } from "../types/project";
import { FokusarkFilters, FremdriftBucket, OfferAmountBucket } from "../types/filters";

export interface ProjectHierarchy {
  parent: Project;
  children: Project[];
  isExpanded: boolean;
}

export const isSubProject = (projectId: string): boolean => projectId.includes('-');
export const getParentProjectId = (projectId: string): string => projectId.split('-')[0];

const matchesFremdrift = (plusMinus: number | null, buckets: FremdriftBucket[]): boolean => {
  if (buckets.length === 0) return true;
  const v = plusMinus ?? 0;
  if (buckets.includes("behind") && v < 0) return true;
  if (buckets.includes("on_track") && v === 0) return true;
  if (buckets.includes("ahead") && v > 0) return true;
  return false;
};

const matchesSearch = (p: Project, query: string): boolean => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (p.id.toLowerCase().includes(q)) return true;
  if (p.name && p.name.toLowerCase().includes(q)) return true;
  return false;
};

export const parseProjectHierarchy = (
  projects: Project[],
  minOfferAmount: number = 25000,
  filters?: FokusarkFilters,
): ProjectHierarchy[] => {
  const baseFiltered = projects.filter(p => {
    if (isSubProject(p.id)) return true;
    const numId = parseInt(p.id, 10) || 0;
    if (numId < 10000) return false;
    return (p.offer_amount ?? 0) >= minOfferAmount;
  });

  const hierarchyMap = new Map<string, ProjectHierarchy>();
  const subProjects: Project[] = [];

  baseFiltered.forEach(project => {
    if (isSubProject(project.id)) {
      subProjects.push(project);
    } else {
      hierarchyMap.set(project.id, { parent: project, children: [], isExpanded: true });
    }
  });

  subProjects.forEach(subProject => {
    const parentId = getParentProjectId(subProject.id);
    const parentHierarchy = hierarchyMap.get(parentId);
    if (parentHierarchy) {
      parentHierarchy.children.push(subProject);
    } else {
      const placeholderParent: Project = {
        id: parentId,
        name: `Project ${parentId}`,
        responsible_person_initials: null,
        hn_appointment_category_id: null,
        offer_amount: null,
        assembly_amount: null,
        subcontractor_amount: null,
        manual_assembly_amount: null,
        manual_subcontractor_amount: null,
        materials_amount: null,
        hours_estimated_projecting: null,
        hours_estimated_production: null,
        hours_estimated_assembly: null,
        hours_used_projecting: null,
        hours_used_production: null,
        hours_used_assembly: null,
        hours_used_total: null,
        hours_remaining_projecting: null,
        hours_remaining_production: null,
        hours_remaining_assembly: null,
        completion_percentage_manual: null,
        completion_percentage_previous: null,
        hours_estimated_by_completion: null,
        plus_minus_hours: null,
        allocated_freight_amount: null,
      };
      hierarchyMap.set(parentId, { parent: placeholderParent, children: [subProject], isExpanded: true });
    }
  });

  hierarchyMap.forEach(h => {
    h.children.sort((a, b) => {
      const numA = parseInt(a.id.split('-')[1] || '0', 10);
      const numB = parseInt(b.id.split('-')[1] || '0', 10);
      return numA - numB;
    });
  });

  let result = Array.from(hierarchyMap.values());

  if (filters) {
    result = result.filter(h => {
      const p = h.parent;

      if (filters.responsible.length > 0) {
        if (!p.responsible_person_initials || !filters.responsible.includes(p.responsible_person_initials)) {
          return false;
        }
      }
      if (filters.categoryIds.length > 0) {
        if (!p.hn_appointment_category_id || !filters.categoryIds.includes(p.hn_appointment_category_id)) {
          return false;
        }
      }
      if (filters.fremdrift.length > 0) {
        if (!matchesFremdrift(p.plus_minus_hours, filters.fremdrift)) return false;
      }
      if (filters.search.trim()) {
        const parentMatch = matchesSearch(p, filters.search);
        const childMatch = h.children.some(c => matchesSearch(c, filters.search));
        if (!parentMatch && !childMatch) return false;
      }

      return true;
    });
  }

  return result.sort((a, b) => {
    const numA = parseInt(a.parent.id, 10) || 0;
    const numB = parseInt(b.parent.id, 10) || 0;
    return numB - numA;
  });
};

export const flattenHierarchy = (hierarchies: ProjectHierarchy[]): Project[] => {
  const flattened: Project[] = [];
  hierarchies.forEach(hierarchy => {
    flattened.push(hierarchy.parent);
    if (hierarchy.isExpanded) {
      flattened.push(...hierarchy.children);
    }
  });
  return flattened;
};
