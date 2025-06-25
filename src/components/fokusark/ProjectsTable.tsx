
import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { Table, TableBody } from "@/components/ui/table";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "@/types/project";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();
  const { containerRef, isDragging, handleMouseDown } = useHoldScroll();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full overflow-auto border border-border rounded-lg"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        <Table className="min-w-[2000px]">
          <ProjectsTableHeaders />
          <TableBody>
            {projects.map((project: Project, index) => (
              <ProjectsTableRow
                key={project.id}
                project={project}
                index={index}
                onUpdateCompletionPercentage={updateCompletionPercentage}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectsTable;
