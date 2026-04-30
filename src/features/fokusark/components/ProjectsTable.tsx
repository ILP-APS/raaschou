
import React, { useState, useMemo } from "react";
import { useSettings } from "../hooks/useSettings";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody } from "@/components/ui/table";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "../types/project";
import { parseProjectHierarchy, flattenHierarchy, ProjectHierarchy } from "../utils/projectHierarchy";

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onUpdateCompletionPercentage: (projectId: string, value: number) => Promise<void> | void;
  onUpdateManualAssemblyAmount: (projectId: string, value: number) => Promise<void> | void;
  onUpdateManualSubcontractorAmount: (projectId: string, value: number) => Promise<void> | void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  loading,
  onUpdateCompletionPercentage,
  onUpdateManualAssemblyAmount,
  onUpdateManualSubcontractorAmount,
}) => {
  const { settings } = useSettings();
  const { containerRef, isDragging, handleMouseDown } = useHoldScroll();
  const { state } = useSidebar();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const projectHierarchies = useMemo(() => {
      const hierarchies = parseProjectHierarchy(projects, settings.min_offer_amount);
      return hierarchies.map(hierarchy => ({
        ...hierarchy,
        isExpanded: expandedProjects.has(hierarchy.parent.id)
      }));
    }, [projects, expandedProjects, settings.min_offer_amount]);

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
        <Table style={{ minWidth: '2350px', width: 'max-content', tableLayout: 'fixed' }}>
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
                  onUpdateCompletionPercentage={updateCompletionPercentage}
                  onUpdateManualAssemblyAmount={updateManualAssemblyAmount}
                  onUpdateManualSubcontractorAmount={updateManualSubcontractorAmount}
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
