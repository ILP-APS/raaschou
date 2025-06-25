
import React, { useState } from "react";
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

  // Handle cell click for editing - simplified without event conflicts
  const handleCellClick = (projectId: string, currentValue: number | null) => {
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
    <tr 
      key={project.id} 
      className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}
    >
      {/* Aftale */}
      <td className="sticky-column sticky-col-0 border-r font-mono text-sm">
        {project.id}
      </td>
      <td className="sticky-column sticky-col-1 border-r font-medium">
        {project.name || '-'}
      </td>
      <td className="border-r-2 border-border text-center">
        {project.responsible_person_initials || '-'}
      </td>
      {/* Tilbud */}
      <td className="text-right font-mono">
        {project.offer_amount ? formatDanishCurrency(project.offer_amount) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.assembly_amount ? formatDanishCurrency(project.assembly_amount) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.subcontractor_amount ? formatDanishCurrency(project.subcontractor_amount) : '-'}
      </td>
      <td className="text-right font-mono border-r-2 border-border">
        {project.materials_amount ? formatDanishCurrency(project.materials_amount) : '-'}
      </td>
      {/* Estimeret */}
      <td className="text-right font-mono">
        {project.hours_estimated_projecting ? formatDanishNumber(project.hours_estimated_projecting) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.hours_estimated_production ? formatDanishNumber(project.hours_estimated_production) : '-'}
      </td>
      <td className="text-right font-mono border-r-2 border-border">
        {project.hours_estimated_assembly ? formatDanishNumber(project.hours_estimated_assembly) : '-'}
      </td>
      {/* Realiseret */}
      <td className="text-right font-mono">
        {project.hours_used_projecting ? formatDanishNumber(project.hours_used_projecting) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.hours_used_production ? formatDanishNumber(project.hours_used_production) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.hours_used_assembly ? formatDanishNumber(project.hours_used_assembly) : '-'}
      </td>
      <td className="text-right font-mono border-r-2 border-border">
        {project.hours_used_total ? formatDanishNumber(project.hours_used_total) : '-'}
      </td>
      {/* Projektering */}
      <td className="text-right font-mono border-r-2 border-border">
        {project.hours_remaining_projecting ? formatDanishNumber(project.hours_remaining_projecting) : '-'}
      </td>
      {/* Produktions stadie */}
      <td className="text-right font-mono">
        {project.hours_remaining_production ? formatDanishNumber(project.hours_remaining_production) : '-'}
      </td>
      <td className="text-right font-mono">
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
            onClick={() => handleCellClick(project.id, project.completion_percentage_manual)}
          >
            {project.completion_percentage_manual ? formatDanishNumber(project.completion_percentage_manual) + '%' : '-'}
          </div>
        )}
      </td>
      <td className="text-right font-mono">
        {project.completion_percentage_previous ? formatDanishNumber(project.completion_percentage_previous) + '%' : '-'}
      </td>
      <td className="text-right font-mono">
        {project.hours_estimated_by_completion ? formatDanishNumber(project.hours_estimated_by_completion) : '-'}
      </td>
      <td className="text-right font-mono border-r-2 border-border">
        {project.plus_minus_hours ? formatDanishNumber(project.plus_minus_hours) : '-'}
      </td>
      {/* Montage */}
      <td className="text-right font-mono">
        {project.hours_remaining_assembly ? formatDanishNumber(project.hours_remaining_assembly) : '-'}
      </td>
      <td className="text-right font-mono">
        {project.allocated_freight_amount ? formatDanishCurrency(project.allocated_freight_amount) : '-'}
      </td>
    </tr>
  );
};
