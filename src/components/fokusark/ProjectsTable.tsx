
import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { useDragScroll } from "@/hooks/useDragScroll";
import { ProjectsTableHeader } from "./ProjectsTableHeader";
import { ProjectRow } from "./ProjectRow";
import "./FokusarkTableStyles.css";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();
  const { 
    containerRef, 
    handlePointerDown, 
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    isDragging
  } = useDragScroll();

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
    <div className="w-full h-full overflow-hidden border border-border rounded-lg bg-background">
      <div 
        ref={containerRef}
        className={`w-full h-full overflow-auto fokusark-scroll-container ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <div style={{ width: '3200px', minWidth: '3200px' }}>
          <table className="fokusark-native-table">
            <ProjectsTableHeader />
            <tbody>
              {projects.map((project, index) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={index}
                  onUpdateCompletionPercentage={updateCompletionPercentage}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;
