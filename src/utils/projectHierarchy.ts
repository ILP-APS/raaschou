
import { Project } from "@/types/project";

export interface ProjectHierarchy {
  parent: Project;
  children: Project[];
  isExpanded: boolean;
}

/**
 * Check if a project ID represents a sub-project (contains hyphen)
 */
export const isSubProject = (projectId: string): boolean => {
  return projectId.includes('-');
};

/**
 * Extract parent project ID from a sub-project ID
 * Example: "24258-1" -> "24258"
 */
export const getParentProjectId = (projectId: string): string => {
  return projectId.split('-')[0];
};

/**
 * Transform flat project array into hierarchical structure
 * Groups sub-projects under their parent projects
 */
export const parseProjectHierarchy = (projects: Project[]): ProjectHierarchy[] => {
  const hierarchyMap = new Map<string, ProjectHierarchy>();
  const subProjects: Project[] = [];
  
  // First pass: identify parent projects and collect sub-projects
  projects.forEach(project => {
    if (isSubProject(project.id)) {
      subProjects.push(project);
    } else {
      // This is a parent project
      hierarchyMap.set(project.id, {
        parent: project,
        children: [],
        isExpanded: true // Default to expanded
      });
    }
  });
  
  // Second pass: assign sub-projects to their parents
  subProjects.forEach(subProject => {
    const parentId = getParentProjectId(subProject.id);
    const parentHierarchy = hierarchyMap.get(parentId);
    
    if (parentHierarchy) {
      parentHierarchy.children.push(subProject);
    } else {
      // Parent not found, create a placeholder or treat as standalone
      // For now, we'll create a minimal parent entry
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
  
  // Sort children within each parent
  hierarchyMap.forEach(hierarchy => {
    hierarchy.children.sort((a, b) => a.id.localeCompare(b.id));
  });
  
  return Array.from(hierarchyMap.values()).sort((a, b) => a.parent.id.localeCompare(b.parent.id));
};

/**
 * Flatten hierarchical structure back to a flat array for rendering
 * Respects the expanded/collapsed state
 */
export const flattenHierarchy = (hierarchies: ProjectHierarchy[]): Project[] => {
  const flattened: Project[] = [];
  
  hierarchies.forEach(hierarchy => {
    // Always include the parent project
    flattened.push(hierarchy.parent);
    
    // Include children only if expanded
    if (hierarchy.isExpanded) {
      flattened.push(...hierarchy.children);
    }
  });
  
  return flattened;
};
