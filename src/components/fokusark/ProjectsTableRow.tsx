
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDanishNumber, formatDanishCurrency, extractInitials } from "@/utils/formatUtils";
import { Project } from "@/types/project";
import { EditablePercentageCell } from "./EditablePercentageCell";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ProjectsTableRowProps {
  project: Project;
  index: number;
  isSubProject?: boolean;
  isParent?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onUpdateCompletionPercentage: (projectId: string, value: number) => void;
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
  onToggleCollapse,
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

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <TableRow className={cn(
      index === 0 || index % 2 === 0 ? "bg-background" : "bg-muted/20",
      isSubProject && "bg-muted/10" // Slightly different background for sub-projects
    )}>
      {/* Aftale - Frozen columns */}
      <TableCell className={cn(
        "sticky left-0 z-10 bg-inherit border-r font-medium min-w-[120px]",
        isSubProject && "pl-8" // Indent sub-projects
      )}>
        <div className="flex items-center gap-2">
          {isParent && hasChildren && (
            <button
              onClick={handleToggleClick}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <span className={cn(
            isParent && hasChildren && "font-semibold",
            isSubProject && "text-muted-foreground"
          )}>
            {project.id}
          </span>
        </div>
      </TableCell>
      <TableCell className={cn(
        "sticky left-[120px] z-10 bg-inherit border-r min-w-[200px]",
        isSubProject && "pl-8" // Indent sub-projects
      )}>
        <span className={cn(
          isParent && hasChildren && "font-semibold",
          isSubProject && "text-muted-foreground"
        )}>
          {project.name || "-"}
        </span>
      </TableCell>
      <TableCell className="sticky left-[320px] z-10 bg-inherit text-center border-r-2 border-border min-w-[100px]">
        {extractInitials(project.responsible_person_initials)}
      </TableCell>
      
      {/* Tilbud - Scrollable columns */}
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
