
import { Project } from "../types/project";

export interface ProjectHierarchy {
  parent: Project;
  children: Project[];
  isExpanded: boolean;
}

export const isSubProject = (projectId: string): boolean => {
  return projectId.includes('-');
};

export const getParentProjectId = (projectId: string): string => {
  return projectId.split('-')[0];
};

export const parseProjectHierarchy = (projects: Project[], minOfferAmount: number = 25000): ProjectHierarchy[] => {
  const filtered = projects.filter(p => {
    if (isSubProject(p.id)) return true;
    const numId = parseInt(p.id, 10) || 0;
    if (numId < 10000) return false;
    return (p.offer_amount ?? 0) >= minOfferAmount;
  });

  const hierarchyMap = new Map<string, ProjectHierarchy>();
  const subProjects: Project[] = [];
  
  filtered.forEach(project => {
    if (isSubProject(project.id)) {
      subProjects.push(project);
    } else {
      hierarchyMap.set(project.id, {
        parent: project,
        children: [],
        isExpanded: true
      });
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
      
      hierarchyMap.set(parentId, {
        parent: placeholderParent,
        children: [subProject],
        isExpanded: true
      });
    }
  });
  
  hierarchyMap.forEach(hierarchy => {
    hierarchy.children.sort((a, b) => {
      const numA = parseInt(a.id.split('-')[1] || '0', 10);
      const numB = parseInt(b.id.split('-')[1] || '0', 10);
      return numA - numB;
    });
  });
  
  return Array.from(hierarchyMap.values()).sort((a, b) => {
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
