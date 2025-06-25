
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDanishNumber, formatDanishCurrency, extractInitials } from "@/utils/formatUtils";
import { Project } from "@/types/project";
import { EditablePercentageCell } from "./EditablePercentageCell";
import { cn } from "@/lib/utils";

interface ProjectsTableRowProps {
  project: Project;
  index: number;
  onUpdateCompletionPercentage: (projectId: string, value: number) => void;
}

export const ProjectsTableRow: React.FC<ProjectsTableRowProps> = ({
  project,
  index,
  onUpdateCompletionPercentage,
}) => {
  const formatValue = (value: number | null, isNumber = false): string => {
    if (value === null || value === undefined) return "-";
    return isNumber ? formatDanishNumber(value) : formatDanishCurrency(value);
  };

  // Utility function to get conditional background class based on numeric value
  const getConditionalCellClass = (value: number | null): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return ""; // No special styling for null/invalid values
    }
    
    if (value > 15) {
      return "bg-green-100";
    } else if (value >= -10 && value <= 15) {
      return "bg-yellow-100";
    } else if (value < -10) {
      return "bg-red-100";
    }
    
    return "";
  };

  return (
    <TableRow className={index === 0 || index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
      {/* Aftale */}
      <TableCell className="bg-inherit border-r font-medium">
        {project.id}
      </TableCell>
      <TableCell className="bg-inherit border-r min-w-[200px]">
        {project.name || "-"}
      </TableCell>
      <TableCell className="text-center border-r">
        {extractInitials(project.responsible_person_initials)}
      </TableCell>
      
      {/* Tilbud */}
      <TableCell className="text-right border-r">
        {formatValue(project.offer_amount)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.assembly_amount)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.subcontractor_amount)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.materials_amount)}
      </TableCell>
      
      {/* Estimeret */}
      <TableCell className="text-right border-r">
        {formatValue(project.hours_estimated_projecting, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_estimated_production, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_estimated_assembly, true)}
      </TableCell>
      
      {/* Realiseret */}
      <TableCell className="text-right border-r">
        {formatValue(project.hours_used_projecting, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_used_production, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_used_assembly, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_used_total, true)}
      </TableCell>
      
      {/* Projektering - hours_remaining_projecting with conditional styling */}
      <TableCell className={cn("text-right border-r", getConditionalCellClass(project.hours_remaining_projecting))}>
        {formatValue(project.hours_remaining_projecting, true)}
      </TableCell>
      
      {/* Produktions stadie */}
      <TableCell className="text-right border-r">
        {formatValue(project.hours_remaining_production, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        <EditablePercentageCell
          value={project.completion_percentage_manual}
          projectId={project.id}
          onUpdate={onUpdateCompletionPercentage}
        />
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.completion_percentage_previous, true)}
      </TableCell>
      <TableCell className="text-right border-r">
        {formatValue(project.hours_estimated_by_completion, true)}
      </TableCell>
      {/* plus_minus_hours with conditional styling */}
      <TableCell className={cn("text-right border-r", getConditionalCellClass(project.plus_minus_hours))}>
        {formatValue(project.plus_minus_hours, true)}
      </TableCell>
      
      {/* Montage - hours_remaining_assembly with conditional styling */}
      <TableCell className={cn("text-right border-r", getConditionalCellClass(project.hours_remaining_assembly))}>
        {formatValue(project.hours_remaining_assembly, true)}
      </TableCell>
      <TableCell className="text-right">
        {formatValue(project.allocated_freight_amount)}
      </TableCell>
    </TableRow>
  );
};
