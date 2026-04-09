
import React, { useState, useMemo, useEffect } from "react";
import { useProjects } from "../hooks/useProjects";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody } from "@/components/ui/table";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "../types/project";
import { parseProjectHierarchy, flattenHierarchy, ProjectHierarchy } from "../utils/projectHierarchy";

interface ProjectsTableProps {
  refreshKey?: number;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ refreshKey }) => {
  const { projects, loading, fetchProjects, updateCompletionPercentage, updateManualAssemblyAmount, updateManualSubcontractorAmount } = useProjects();
  const { containerRef, isDragging, handleMouseDown } = useHoldScroll();
  const { state } = useSidebar();
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const projectHierarchies = useMemo(() => {
      const hierarchies = parseProjectHierarchy(projects);
      return hierarchies.map(hierarchy => ({
        ...hierarchy,
        isExpanded: !collapsedProjects.has(hierarchy.parent.id)
      }));
    }, [projects, collapsedProjects]);

  const displayProjects = useMemo(() => {
    return flattenHierarchy(projectHierarchies);
  }, [projectHierarchies]);

  const toggleProjectCollapse = (parentId: string) => {
    setCollapsedProjects(prev => {
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
        <Table style={{ minWidth: '2000px', width: 'max-content' }}>
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
                  onToggleCollapse={() => toggleProjectCollapse(project.id)}
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
