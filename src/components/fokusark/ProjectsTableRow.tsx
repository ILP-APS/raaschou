
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

  // Get background color based on row pattern - using fully opaque colors for frozen columns
  const getRowBgColor = () => {
    if (isSubProject) return "bg-muted";
    return index === 0 || index % 2 === 0 ? "bg-background" : "bg-muted";
  };

  const rowBgColor = getRowBgColor();

  return (
    <TableRow className={cn(
      rowBgColor
    )}>
      {/* Aftale - Frozen columns */}
      <TableCell 
        className={cn(
          "sticky z-20 font-medium",
          rowBgColor,
          isSubProject && "pl-8" // Indent sub-projects
        )}
        style={{ left: 0, minWidth: '150px', width: '150px' }}
      >
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
      <TableCell 
        className={cn(
          "sticky z-20",
          rowBgColor,
          isSubProject && "pl-8" // Indent sub-projects
        )}
        style={{ left: '150px', minWidth: '300px', width: '300px' }}
      >
        <span className={cn(
          isParent && hasChildren && "font-semibold",
          isSubProject && "text-muted-foreground"
        )}>
          {project.name || "-"}
        </span>
      </TableCell>
      <TableCell 
        className={cn(
          "sticky z-20 text-center",
          rowBgColor
        )}
        style={{ 
          left: '450px', 
          minWidth: '100px', 
          width: '100px',
          boxShadow: '1px 0 0 0 hsl(var(--border))'
        }}
      >
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
