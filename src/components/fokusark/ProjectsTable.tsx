
import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useProjects } from "@/hooks/useProjects";
import { ProjectsTableHeader } from "./ProjectsTableHeader";
import { ProjectRow } from "./ProjectRow";
import "./FokusarkTableStyles.css";

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();

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
      <div className="fokusark-scroll-wrapper">
        <Table>
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
    </div>
  );
};

export default ProjectsTable;
