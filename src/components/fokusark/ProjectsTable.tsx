
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { useProjects } from "@/hooks/useProjects";
import { useDragScroll } from "@/hooks/useDragScroll";
import { ProjectsTableHeader } from "./ProjectsTableHeader";
import { ProjectRow } from "./ProjectRow";
import "./FokusarkTableStyles.css";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();
  const {
    containerRef,
    isDragging,
    handleMouseDown,
  } = useDragScroll();

  // Debug scrollable dimensions
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      console.log('Container dimensions:', {
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        offsetWidth: container.offsetWidth,
        scrollLeft: container.scrollLeft,
        isScrollable: container.scrollWidth > container.clientWidth
      });
    }
  }, [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Loading projects...</h3>
          <p className="text-muted-foreground">Please wait while we fetch the project data.</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">There are no projects to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full overflow-auto border rounded-lg hover:cursor-grab ${
        isDragging ? 'cursor-grabbing select-none' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <Table className="fokusark-table-force-width">
        <ProjectsTableHeader />
        <TableBody>
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              onUpdateCompletionPercentage={updateCompletionPercentage}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
