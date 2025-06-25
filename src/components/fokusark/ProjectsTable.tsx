
import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { useSidebar } from "@/components/ui/sidebar";
import { Table, TableBody } from "@/components/ui/table";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "@/types/project";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();
  const { containerRef, isDragging, handleMouseDown } = useHoldScroll();
  const { state } = useSidebar();

  // Calculate dynamic width based on sidebar state
  const getContainerWidth = () => {
    if (state === "expanded") {
      // When sidebar is expanded (16rem = 256px), subtract sidebar width and padding
      return "calc(100vw - 16rem - 2rem)";
    } else {
      // When sidebar is collapsed (3rem = 48px), subtract icon width and padding
      return "calc(100vw - 3rem - 2rem)";
    }
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
      {/* Scrollable Table Container */}
      <div
        ref={containerRef}
        className="w-full border border-border rounded-lg"
        style={{ 
          height: 'calc(100vh - 252px)', // Dynamic height: viewport - header(64px) - padding(48px) - description(120px) - buffer(20px)
          minHeight: '400px', // Minimum height for usability on small screens
          maxWidth: '100vw', // Constraint to viewport width
          width: getContainerWidth(), // Dynamic width based on sidebar state
          overflow: 'auto', // Critical for scrolling
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          position: 'relative',
          isolation: 'isolate' // Create new stacking context
        }}
        onMouseDown={handleMouseDown}
      >
        <Table 
          style={{ 
            minWidth: '2000px', // Force table to be wider than container
            width: 'max-content' // Let table take its natural width
          }}
        >
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
