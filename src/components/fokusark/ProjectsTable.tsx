
import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { useHoldScroll } from "@/hooks/useHoldScroll";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProjectsTableHeaders } from "./ProjectsTableHeaders";
import { ProjectsTableRow } from "./ProjectsTableRow";
import { Project } from "@/types/project";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();
  const { containerRef, isDragging, handleMouseDown, debugContainer, testManualScroll } = useHoldScroll();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Debug Controls */}
      <div className="flex gap-2 p-2 bg-muted/20 rounded">
        <Button onClick={debugContainer} variant="outline" size="sm">
          Debug Container
        </Button>
        <Button onClick={testManualScroll} variant="outline" size="sm">
          Test Manual Scroll
        </Button>
        <div className="text-sm text-muted-foreground flex items-center">
          Status: {isDragging ? 'Dragging' : 'Ready'} | 
          Projects: {projects.length}
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div
        ref={containerRef}
        className="w-full border border-border rounded-lg"
        style={{ 
          height: '600px', // Fixed height to ensure vertical scrolling capability  
          maxWidth: '100vw', // Constraint to viewport width
          width: '1200px', // Fixed width smaller than table's minWidth
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
