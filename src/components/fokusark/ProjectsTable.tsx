
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
    <div className="fokusark-native-scroll-container">
      <div className="scroll-fade-left"></div>
      <div className="scroll-fade-right"></div>
      <div 
        ref={containerRef}
        className={`fokusark-scroll-wrapper ${isDragging ? 'dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ cursor: 'grab' }}
      >
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
  );
};

export default ProjectsTable;
