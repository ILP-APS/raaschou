
import React, { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatDanishNumber, formatDanishCurrency } from "@/utils/formatUtils";
import { Project } from "@/types/project";

interface EditablePercentageCellProps {
  value: number | null;
  projectId: string;
  onUpdate: (projectId: string, value: number) => void;
}

const EditablePercentageCell: React.FC<EditablePercentageCellProps> = ({
  value,
  projectId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "");

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value?.toString() || "");
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onUpdate(projectId, numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value?.toString() || "");
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full text-right"
        autoFocus
        type="number"
        min="0"
        max="100"
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded text-right"
    >
      {value !== null ? formatDanishNumber(value) : "-"}
    </div>
  );
};

const ProjectsTable: React.FC = () => {
  const { projects, loading, updateCompletionPercentage } = useProjects();

  const formatValue = (value: number | null, isNumber = false): string => {
    if (value === null || value === undefined) return "-";
    return isNumber ? formatDanishNumber(value) : formatDanishCurrency(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea className="w-full overflow-x-auto">
        <Table className="min-w-[2000px]">
          <TableHeader>
            {/* Group Headers */}
            <TableRow className="bg-muted/30">
              <TableHead className="text-center font-semibold border-r" colSpan={3}>
                Aftale
              </TableHead>
              <TableHead className="text-center font-semibold border-r" colSpan={4}>
                Tilbud
              </TableHead>
              <TableHead className="text-center font-semibold border-r" colSpan={3}>
                Estimeret
              </TableHead>
              <TableHead className="text-center font-semibold border-r" colSpan={4}>
                Realiseret
              </TableHead>
              <TableHead className="text-center font-semibold border-r" colSpan={1}>
                Projektering
              </TableHead>
              <TableHead className="text-center font-semibold border-r" colSpan={5}>
                Produktions stadie
              </TableHead>
              <TableHead className="text-center font-semibold" colSpan={2}>
                Montage
              </TableHead>
            </TableRow>
            
            {/* Column Headers */}
            <TableRow>
              {/* Aftale */}
              <TableHead className="sticky left-0 bg-background border-r">Projekt ID</TableHead>
              <TableHead className="sticky left-24 bg-background border-r min-w-[200px]">Projekt Navn/Emne</TableHead>
              <TableHead className="text-center border-r">Ansvarlig</TableHead>
              
              {/* Tilbud */}
              <TableHead className="text-right border-r">Tilbudsbeløb i alt</TableHead>
              <TableHead className="text-right border-r">Heraf Montage</TableHead>
              <TableHead className="text-right border-r">Heraf Underleverandør</TableHead>
              <TableHead className="text-right border-r">Beregnet Materialebeløb</TableHead>
              
              {/* Estimeret */}
              <TableHead className="text-right border-r">Est. timer - Proj.</TableHead>
              <TableHead className="text-right border-r">Est. timer - Prod.</TableHead>
              <TableHead className="text-right border-r">Est. timer - Mont.</TableHead>
              
              {/* Realiseret */}
              <TableHead className="text-right border-r">Brugte timer - Proj.</TableHead>
              <TableHead className="text-right border-r">Brugte timer - Prod.</TableHead>
              <TableHead className="text-right border-r">Brugte timer - Mont.</TableHead>
              <TableHead className="text-right border-r">Total timer brugt</TableHead>
              
              {/* Projektering */}
              <TableHead className="text-right border-r">Timer tilbage - Proj.</TableHead>
              
              {/* Produktions stadie */}
              <TableHead className="text-right border-r">Timer tilbage - Prod.</TableHead>
              <TableHead className="text-right border-r">Færdig% (NU)</TableHead>
              <TableHead className="text-right border-r">Færdig% (FØR)</TableHead>
              <TableHead className="text-right border-r">Est. timer ift. Færdig%</TableHead>
              <TableHead className="text-right border-r">+/- Timer</TableHead>
              
              {/* Montage */}
              <TableHead className="text-right border-r">Timer tilbage - Mont.</TableHead>
              <TableHead className="text-right">Afsat Fragt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project: Project, index) => (
              <TableRow key={project.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                {/* Aftale */}
                <TableCell className="sticky left-0 bg-inherit border-r font-medium">
                  {project.id}
                </TableCell>
                <TableCell className="sticky left-24 bg-inherit border-r min-w-[200px]">
                  {project.name || "-"}
                </TableCell>
                <TableCell className="text-center border-r">
                  {project.responsible_person_initials || "-"}
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
                
                {/* Projektering */}
                <TableCell className="text-right border-r">
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
                    onUpdate={updateCompletionPercentage}
                  />
                </TableCell>
                <TableCell className="text-right border-r">
                  {formatValue(project.completion_percentage_previous, true)}
                </TableCell>
                <TableCell className="text-right border-r">
                  {formatValue(project.hours_estimated_by_completion, true)}
                </TableCell>
                <TableCell className="text-right border-r">
                  {formatValue(project.plus_minus_hours, true)}
                </TableCell>
                
                {/* Montage */}
                <TableCell className="text-right border-r">
                  {formatValue(project.hours_remaining_assembly, true)}
                </TableCell>
                <TableCell className="text-right">
                  {formatValue(project.allocated_freight_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ProjectsTable;
