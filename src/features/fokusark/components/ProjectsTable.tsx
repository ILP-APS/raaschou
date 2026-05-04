
import React, { useState, useMemo } from "react";
import { useSettings } from "../hooks/useSettings";
import { useAppointmentCategories } from "../hooks/useAppointmentCategories";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "../types/project";
import { parseProjectHierarchy, flattenHierarchy, ProjectHierarchy } from "../utils/projectHierarchy";
import { FokusarkFilters, isFilterActive } from "../types/filters";

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  filters: FokusarkFilters;
  onClearFilters: () => void;
  onUpdateCompletionPercentage: (projectId: string, value: number) => Promise<void> | void;
  onUpdateManualAssemblyAmount: (projectId: string, value: number) => Promise<void> | void;
  onUpdateManualSubcontractorAmount: (projectId: string, value: number) => Promise<void> | void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  loading,
  filters,
  onClearFilters,
  onUpdateCompletionPercentage,
  onUpdateManualAssemblyAmount,
  onUpdateManualSubcontractorAmount,
}) => {
  const { settings } = useSettings();
  const { categories } = useAppointmentCategories();
  const { containerRef, isDragging, handleMouseDown } = useHoldScroll();
  const { state } = useSidebar();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const projectHierarchies = useMemo(() => {
      const hierarchies = parseProjectHierarchy(projects, settings.min_offer_amount, filters);
      return hierarchies.map(hierarchy => ({
        ...hierarchy,
        isExpanded: expandedProjects.has(hierarchy.parent.id)
      }));
    }, [projects, expandedProjects, settings.min_offer_amount, filters]);

  const displayProjects = useMemo(() => {
    return flattenHierarchy(projectHierarchies);
  }, [projectHierarchies]);

  const toggleProjectExpansion = (parentId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) newSet.delete(parentId);
      else newSet.add(parentId);
      return newSet;
    });
  };

  const getContainerWidth = () => {
    return state === "expanded" ? "calc(100vw - 16rem - 2rem)" : "calc(100vw - 3rem - 2rem)";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (!loading && displayProjects.length === 0 && isFilterActive(filters)) {
    return (
      <div className="w-full border border-border rounded-lg p-12 flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground">Ingen projekter matcher de valgte filtre.</p>
        <Button variant="outline" size="sm" onClick={onClearFilters}>Ryd alle filtre</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div
        ref={containerRef}
        className="w-full border border-border rounded-lg"
        style={{ 
          height: 'calc(100vh - 252px)', minHeight: '400px', maxWidth: '100vw',
          width: getContainerWidth(), overflow: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab', userSelect: isDragging ? 'none' : 'auto',
          position: 'relative', isolation: 'isolate'
        }}
        onMouseDown={handleMouseDown}
      >
        <Table style={{ minWidth: '2530px', width: 'max-content', tableLayout: 'fixed' }}>
          <ProjectsTableHeaders />
          <TableBody>
            {displayProjects.map((project: Project, index) => {
              const parentHierarchy = projectHierarchies.find(h => 
                h.parent.id === project.id || h.children.some(c => c.id === project.id)
              );
              const isParent = parentHierarchy?.parent.id === project.id;
              const isSubProject = !isParent;
              const hasChildren = isParent && parentHierarchy && parentHierarchy.children.length > 0;
              const isExpanded = isParent && parentHierarchy ? parentHierarchy.isExpanded : false;

              return (
                <ProjectsTableRow
                  key={project.id}
                  project={project}
                  index={index}
                  isSubProject={isSubProject}
                  isParent={isParent}
                  hasChildren={hasChildren}
                  isExpanded={isExpanded}
                  categoryName={project.hn_appointment_category_id ? categories.get(project.hn_appointment_category_id) ?? null : null}
                  onUpdateCompletionPercentage={onUpdateCompletionPercentage}
                  onUpdateManualAssemblyAmount={onUpdateManualAssemblyAmount}
                  onUpdateManualSubcontractorAmount={onUpdateManualSubcontractorAmount}
                  onToggleCollapse={() => toggleProjectExpansion(project.id)}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectsTable;
