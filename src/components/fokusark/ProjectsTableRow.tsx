
import React from "react";
import { TableRow } from "@/components/ui/table";
import { Project } from "@/types/project";
import { cn } from "@/lib/utils";
import { ProjectIdentifierCell } from "./cells/ProjectIdentifierCell";
import { ProjectNameCell } from "./cells/ProjectNameCell";
import { ResponsiblePersonCell } from "./cells/ResponsiblePersonCell";
import { EditableManualAmountCell } from "./cells/EditableManualAmountCell";
import { EditableCompletionPercentageCell } from "./cells/EditableCompletionPercentageCell";
import { ConditionalValueCell } from "./cells/ConditionalValueCell";
import { BasicValueCell } from "./cells/BasicValueCell";
import { getRowBgColor } from "./utils/rowStyleUtils";

interface ProjectsTableRowProps {
  project: Project;
  index: number;
  isSubProject?: boolean;
  isParent?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onUpdateCompletionPercentage: (projectId: string, value: number) => void;
  onUpdateManualAssemblyAmount: (projectId: string, value: number) => void;
  onUpdateManualSubcontractorAmount: (projectId: string, value: number) => void;
  onToggleCollapse?: () => void;
}

export const ProjectsTableRow: React.FC<ProjectsTableRowProps> = ({
  project,
  index,
  isSubProject = false,
  isParent = false,
  hasChildren = false,
  isExpanded = false,
  onUpdateCompletionPercentage,
  onUpdateManualAssemblyAmount,
  onUpdateManualSubcontractorAmount,
  onToggleCollapse,
}) => {
  const rowBgColor = getRowBgColor(isSubProject, index);

  return (
    <TableRow className={cn(rowBgColor)}>
      {/* Aftale - Frozen columns */}
      <ProjectIdentifierCell
        projectId={project.id}
        isSubProject={isSubProject}
        isParent={isParent}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        rowBgColor={rowBgColor}
        onToggleCollapse={onToggleCollapse}
      />
      <ProjectNameCell
        projectName={project.name}
        isSubProject={isSubProject}
        isParent={isParent}
        hasChildren={hasChildren}
        rowBgColor={rowBgColor}
      />
      <ResponsiblePersonCell
        responsiblePersonInitials={project.responsible_person_initials}
        rowBgColor={rowBgColor}
      />
      
      {/* Tilbud */}
      <BasicValueCell value={project.offer_amount} />
      <BasicValueCell value={project.assembly_amount} />
      <BasicValueCell value={project.subcontractor_amount} />
      <EditableManualAmountCell
        value={project.manual_assembly_amount}
        projectId={project.id}
        fieldType="assembly"
        isSubProject={isSubProject}
        onUpdate={onUpdateManualAssemblyAmount}
      />
      <EditableManualAmountCell
        value={project.manual_subcontractor_amount}
        projectId={project.id}
        fieldType="subcontractor"
        isSubProject={isSubProject}
        onUpdate={onUpdateManualSubcontractorAmount}
      />
      <BasicValueCell value={project.materials_amount} />
      
      {/* Estimeret */}
      <BasicValueCell value={project.hours_estimated_projecting} isNumber />
      <BasicValueCell value={project.hours_estimated_production} isNumber />
      <BasicValueCell value={project.hours_estimated_assembly} isNumber />
      
      {/* Realiseret */}
      <BasicValueCell value={project.hours_used_projecting} isNumber />
      <BasicValueCell value={project.hours_used_production} isNumber />
      <BasicValueCell value={project.hours_used_assembly} isNumber />
      <BasicValueCell value={project.hours_used_total} isNumber />
      
      {/* Projektering */}
      <ConditionalValueCell value={project.hours_remaining_projecting} />
      
      {/* Produktions stadie */}
      <BasicValueCell value={project.hours_remaining_production} isNumber />
      <EditableCompletionPercentageCell
        value={project.completion_percentage_manual}
        projectId={project.id}
        isSubProject={isSubProject}
        onUpdate={onUpdateCompletionPercentage}
      />
      <BasicValueCell value={project.completion_percentage_previous} isNumber />
      <BasicValueCell value={project.hours_estimated_by_completion} isNumber />
      <ConditionalValueCell value={project.plus_minus_hours} />
      
      {/* Montage */}
      <ConditionalValueCell value={project.hours_remaining_assembly} />
      <BasicValueCell value={project.allocated_freight_amount} className="text-right" />
    </TableRow>
  );
};
