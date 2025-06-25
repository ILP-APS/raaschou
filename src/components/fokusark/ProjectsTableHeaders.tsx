
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProjectsTableHeaders: React.FC = () => {
  return (
    <TableHeader>
      {/* Group Headers */}
      <TableRow className="bg-muted/30">
        {/* Aftale - Frozen columns */}
        <TableHead className="sticky left-0 z-30 bg-muted/30 text-center font-semibold border-r-2 border-border" colSpan={3}>
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
      <TableRow className="bg-muted/30">
        {/* Aftale - Frozen columns */}
        <TableHead className="sticky left-0 z-20 bg-muted/30 border-r min-w-[120px]">Projekt ID</TableHead>
        <TableHead className="sticky left-[120px] z-20 bg-muted/30 border-r min-w-[200px]">Projekt Navn/Emne</TableHead>
        <TableHead className="sticky left-[320px] z-20 bg-muted/30 text-center border-r-2 border-border min-w-[100px]">Ansvarlig</TableHead>
        
        {/* Tilbud - Scrollable columns */}
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
  );
};
