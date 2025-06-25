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

  // Handle cell click for editing - now works properly with drag scroll
  const handleCellClick = (e: React.MouseEvent, projectId: string, currentValue: number | null) => {
    // Only handle if this was a genuine click (not part of a drag operation)
    // The drag scroll hook now properly distinguishes between clicks and drags
    e.stopPropagation();
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

  return (
    <TableRow 
      key={project.id} 
      className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}
    >
      {/* Aftale */}
      <TableCell className="sticky left-0 bg-inherit z-10 border-r font-mono text-sm">
        {project.id}
      </TableCell>
      <TableCell className="sticky left-20 bg-inherit z-10 border-r font-medium min-w-48">
        {project.name || '-'}
      </TableCell>
      <TableCell className="border-r-2 border-border text-center">
        {project.responsible_person_initials || '-'}
      </TableCell>
      {/* Tilbud */}
      <TableCell className="text-right font-mono">
        {project.offer_amount ? formatDanishCurrency(project.offer_amount) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.assembly_amount ? formatDanishCurrency(project.assembly_amount) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.subcontractor_amount ? formatDanishCurrency(project.subcontractor_amount) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono border-r-2 border-border">
        {project.materials_amount ? formatDanishCurrency(project.materials_amount) : '-'}
      </TableCell>
      {/* Estimeret */}
      <TableCell className="text-right font-mono">
        {project.hours_estimated_projecting ? formatDanishNumber(project.hours_estimated_projecting) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.hours_estimated_production ? formatDanishNumber(project.hours_estimated_production) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono border-r-2 border-border">
        {project.hours_estimated_assembly ? formatDanishNumber(project.hours_estimated_assembly) : '-'}
      </TableCell>
      {/* Realiseret */}
      <TableCell className="text-right font-mono">
        {project.hours_used_projecting ? formatDanishNumber(project.hours_used_projecting) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.hours_used_production ? formatDanishNumber(project.hours_used_production) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.hours_used_assembly ? formatDanishNumber(project.hours_used_assembly) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono border-r-2 border-border">
        {project.hours_used_total ? formatDanishNumber(project.hours_used_total) : '-'}
      </TableCell>
      {/* Projektering */}
      <TableCell className="text-right font-mono border-r-2 border-border">
        {project.hours_remaining_projecting ? formatDanishNumber(project.hours_remaining_projecting) : '-'}
      </TableCell>
      {/* Produktions stadie */}
      <TableCell className="text-right font-mono">
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
          >
            {project.completion_percentage_manual ? formatDanishNumber(project.completion_percentage_manual) + '%' : '-'}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.completion_percentage_previous ? formatDanishNumber(project.completion_percentage_previous) + '%' : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.hours_estimated_by_completion ? formatDanishNumber(project.hours_estimated_by_completion) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono border-r-2 border-border">
        {project.plus_minus_hours ? formatDanishNumber(project.plus_minus_hours) : '-'}
      </TableCell>
      {/* Montage */}
      <TableCell className="text-right font-mono">
        {project.hours_remaining_assembly ? formatDanishNumber(project.hours_remaining_assembly) : '-'}
      </TableCell>
      <TableCell className="text-right font-mono">
        {project.allocated_freight_amount ? formatDanishCurrency(project.allocated_freight_amount) : '-'}
      </TableCell>
    </TableRow>
  );
};
