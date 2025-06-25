import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDanishNumber, formatDanishCurrency } from "@/utils/formatUtils";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string | null;
  responsible_person_initials: string | null;
  offer_amount: number | null;
  assembly_amount: number | null;
  subcontractor_amount: number | null;
  materials_amount: number | null;
  hours_estimated_projecting: number | null;
  hours_estimated_production: number | null;
  hours_estimated_assembly: number | null;
  hours_used_projecting: number | null;
  hours_used_production: number | null;
  hours_used_assembly: number | null;
  hours_used_total: number | null;
  hours_remaining_projecting: number | null;
  hours_remaining_production: number | null;
  hours_remaining_assembly: number | null;
  completion_percentage_manual: number | null;
  completion_percentage_previous: number | null;
  hours_estimated_by_completion: number | null;
  plus_minus_hours: number | null;
  allocated_freight_amount: number | null;
}

const ProjectsTable: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { toast } = useToast();

  // Drag scrolling state
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error fetching projects",
          description: "There was a problem loading the project data.",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update completion percentage
  const updateCompletionPercentage = async (projectId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ completion_percentage_manual: value })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating completion percentage:', error);
        toast({
          title: "Error updating completion percentage",
          description: "There was a problem saving the changes.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Completion percentage updated",
        description: "The completion percentage has been saved successfully.",
      });

      // Refresh the data to get updated calculations
      fetchProjects();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle cell editing
  const handleCellClick = (projectId: string, currentValue: number | null) => {
    setEditingCell(projectId);
    setEditValue(currentValue?.toString() || "");
  };

  const handleCellSave = async (projectId: string) => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue)) {
      await updateCompletionPercentage(projectId, numericValue);
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

  // Drag scrolling handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('Mouse down - CTRL pressed:', isCtrlPressed, 'Editing cell:', editingCell);
    if (isCtrlPressed && !editingCell) {
      e.preventDefault();
      console.log('Starting drag');
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      if (containerRef.current) {
        setScrollStart({
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      containerRef.current.scrollLeft = scrollStart.left - deltaX;
      containerRef.current.scrollTop = scrollStart.top - deltaY;
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('Ending drag');
    }
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Keyboard event handlers for CTRL key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.ctrlKey) {
        console.log('CTRL pressed');
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || !e.ctrlKey) {
        console.log('CTRL released');
        setIsCtrlPressed(false);
        setIsDragging(false);
      }
    };

    // Add event listeners to both window and document for better coverage
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    <div 
      ref={containerRef}
      className={`w-full overflow-auto border rounded-lg ${
        isCtrlPressed && !editingCell ? 'cursor-grab' : ''
      } ${isDragging ? 'cursor-grabbing select-none' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {/* Aftale columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={3}>
              Aftale
            </TableHead>
            {/* Tilbud columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={4}>
              Tilbud
            </TableHead>
            {/* Estimeret columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={3}>
              Estimeret
            </TableHead>
            {/* Realiseret columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={4}>
              Realiseret
            </TableHead>
            {/* Projektering columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={1}>
              Projektering
            </TableHead>
            {/* Produktions stadie columns */}
            <TableHead className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={5}>
              Produktions stadie
            </TableHead>
            {/* Montage columns */}
            <TableHead className="bg-muted/50 font-semibold text-center" colSpan={2}>
              Montage
            </TableHead>
          </TableRow>
          <TableRow>
            {/* Aftale */}
            <TableHead className="sticky left-0 bg-background z-10 border-r">Projekt ID</TableHead>
            <TableHead className="sticky left-20 bg-background z-10 border-r">Projekt Navn/Emne</TableHead>
            <TableHead className="border-r-2 border-border">Ansvarlig</TableHead>
            {/* Tilbud */}
            <TableHead className="text-right">Tilbudsbeløb i alt</TableHead>
            <TableHead className="text-right">Heraf Montage</TableHead>
            <TableHead className="text-right">Heraf Underleverandør</TableHead>
            <TableHead className="text-right border-r-2 border-border">Beregnet Materialebeløb</TableHead>
            {/* Estimeret */}
            <TableHead className="text-right">Estimeret timer - Projektering</TableHead>
            <TableHead className="text-right">Estimeret timer - Produktion</TableHead>
            <TableHead className="text-right border-r-2 border-border">Estimeret timer - Montage</TableHead>
            {/* Realiseret */}
            <TableHead className="text-right">Brugte timer - Projektering</TableHead>
            <TableHead className="text-right">Brugte timer - Produktion</TableHead>
            <TableHead className="text-right">Brugte timer - Montage</TableHead>
            <TableHead className="text-right border-r-2 border-border">Total antal timer brugt</TableHead>
            {/* Projektering */}
            <TableHead className="text-right border-r-2 border-border">Timer tilbage - Projektering</TableHead>
            {/* Produktions stadie */}
            <TableHead className="text-right">Timer tilbage - Produktion</TableHead>
            <TableHead className="text-right">Færdig% (NU)</TableHead>
            <TableHead className="text-right">Færdig% (FØR)</TableHead>
            <TableHead className="text-right">Estimeret timer ift. Færdig%</TableHead>
            <TableHead className="text-right border-r-2 border-border">+/- Timer</TableHead>
            {/* Montage */}
            <TableHead className="text-right">Timer tilbage - Montage</TableHead>
            <TableHead className="text-right">Afsat Fragt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, index) => (
            <TableRow key={project.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}>
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
                    onClick={() => handleCellClick(project.id, project.completion_percentage_manual)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
