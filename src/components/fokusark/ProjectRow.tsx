
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatDanishNumber, formatDanishCurrency } from "@/utils/formatUtils";
import { Project } from "@/types/project";

interface ProjectRowProps {
  project: Project;
  index: number;
  onUpdateCompletionPercentage: (projectId: string, value: number) => Promise<void>;
}

export const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  index,
  onUpdateCompletionPercentage,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Handle cell editing
  const handleCellClick = (e: React.MouseEvent, projectId: string, currentValue: number | null) => {
    // Check if CTRL is pressed - if so, don't start editing to allow drag scrolling
    if (e.ctrlKey) {
      return;
    }
    
    e.stopPropagation(); // Prevent bubbling when we want to edit
    setEditingCell(projectId);
    setEditValue(currentValue?.toString() || "");
  };

  const handleCellSave = async (projectId: string) => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue)) {
      await onUpdateCompletionPercentage(projectId, numericValue);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      handleCellSave(projectId);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue("");
    }
  };

  // Handle mouse down on cells - allow event to bubble if CTRL is pressed
  const handleCellMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey && !editingCell) {
      // Don't prevent default or stop propagation - let it bubble up for drag scrolling
      console.log('CTRL+click on cell - allowing event to bubble for drag scrolling');
      return;
    }
    // For normal clicks when not editing, we can still allow bubbling
    if (!editingCell) {
      return;
    }
  };

  return (
    <TableRow key={project.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}>
      {/* Aftale */}
      <TableCell 
        className="sticky left-0 bg-inherit z-10 border-r font-mono text-sm"
        onMouseDown={handleCellMouseDown}
      >
        {project.id}
      </TableCell>
      <TableCell 
        className="sticky left-20 bg-inherit z-10 border-r font-medium min-w-48"
        onMouseDown={handleCellMouseDown}
      >
        {project.name || '-'}
      </TableCell>
      <TableCell 
        className="border-r-2 border-border text-center"
        onMouseDown={handleCellMouseDown}
      >
        {project.responsible_person_initials || '-'}
      </TableCell>
      {/* Tilbud */}
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.offer_amount ? formatDanishCurrency(project.offer_amount) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.assembly_amount ? formatDanishCurrency(project.assembly_amount) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.subcontractor_amount ? formatDanishCurrency(project.subcontractor_amount) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono border-r-2 border-border"
        onMouseDown={handleCellMouseDown}
      >
        {project.materials_amount ? formatDanishCurrency(project.materials_amount) : '-'}
      </TableCell>
      {/* Estimeret */}
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_estimated_projecting ? formatDanishNumber(project.hours_estimated_projecting) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_estimated_production ? formatDanishNumber(project.hours_estimated_production) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono border-r-2 border-border"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_estimated_assembly ? formatDanishNumber(project.hours_estimated_assembly) : '-'}
      </TableCell>
      {/* Realiseret */}
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_used_projecting ? formatDanishNumber(project.hours_used_projecting) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_used_production ? formatDanishNumber(project.hours_used_production) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_used_assembly ? formatDanishNumber(project.hours_used_assembly) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono border-r-2 border-border"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_used_total ? formatDanishNumber(project.hours_used_total) : '-'}
      </TableCell>
      {/* Projektering */}
      <TableCell 
        className="text-right font-mono border-r-2 border-border"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_remaining_projecting ? formatDanishNumber(project.hours_remaining_projecting) : '-'}
      </TableCell>
      {/* Produktions stadie */}
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_remaining_production ? formatDanishNumber(project.hours_remaining_production) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {editingCell === project.id ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellSave(project.id)}
            onKeyDown={(e) => handleKeyDown(e, project.id)}
            className="w-20 text-right"
            autoFocus
          />
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/50 p-1 rounded"
            onClick={(e) => handleCellClick(e, project.id, project.completion_percentage_manual)}
            onMouseDown={handleCellMouseDown}
          >
            {project.completion_percentage_manual ? formatDanishNumber(project.completion_percentage_manual) + '%' : '-'}
          </div>
        )}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.completion_percentage_previous ? formatDanishNumber(project.completion_percentage_previous) + '%' : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_estimated_by_completion ? formatDanishNumber(project.hours_estimated_by_completion) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono border-r-2 border-border"
        onMouseDown={handleCellMouseDown}
      >
        {project.plus_minus_hours ? formatDanishNumber(project.plus_minus_hours) : '-'}
      </TableCell>
      {/* Montage */}
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.hours_remaining_assembly ? formatDanishNumber(project.hours_remaining_assembly) : '-'}
      </TableCell>
      <TableCell 
        className="text-right font-mono"
        onMouseDown={handleCellMouseDown}
      >
        {project.allocated_freight_amount ? formatDanishCurrency(project.allocated_freight_amount) : '-'}
      </TableCell>
    </TableRow>
  );
};
