
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProjectsTableHeaders: React.FC = () => {
  return (
    <TableHeader className="sticky top-0 z-40 bg-background">
      {/* Group Headers */}
      <TableRow className="bg-muted/30">
        {/* Aftale - Frozen columns */}
        <TableHead 
          className="sticky z-30 bg-muted text-center font-semibold" 
          colSpan={3}
          style={{ 
            left: 0,
            boxShadow: '1px 0 0 0 hsl(var(--border))'
          }}
        >
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
        <TableHead 
          className="sticky z-30 bg-muted"
          style={{ left: 0, minWidth: '150px', width: '150px' }}
        >
          Projekt ID
        </TableHead>
        <TableHead 
          className="sticky z-30 bg-muted"
          style={{ left: '150px', minWidth: '300px', width: '300px' }}
        >
          Projekt Navn/Emne
        </TableHead>
        <TableHead 
          className="sticky z-30 bg-muted text-center"
          style={{ 
            left: '450px', 
            minWidth: '100px', 
            width: '100px',
            boxShadow: '1px 0 0 0 hsl(var(--border))'
          }}
        >
          Ansvarlig
        </TableHead>
        
        <TableHead className="text-right border-r">Tilbudsbeløb i alt</TableHead>
        <TableHead className="text-right border-r">Heraf Montage</TableHead>
        <TableHead className="text-right border-r">Heraf Underleverandør</TableHead>
        <TableHead className="text-right border-r">Beregnet Materialebeløb</TableHead>
        
        <TableHead className="text-right border-r">Est. timer - Proj.</TableHead>
        <TableHead className="text-right border-r">Est. timer - Prod.</TableHead>
        <TableHead className="text-right border-r">Est. timer - Mont.</TableHead>
        
        <TableHead className="text-right border-r">Brugte timer - Proj.</TableHead>
        <TableHead className="text-right border-r">Brugte timer - Prod.</TableHead>
        <TableHead className="text-right border-r">Brugte timer - Mont.</TableHead>
        <TableHead className="text-right border-r">Total timer brugt</TableHead>
        
        <TableHead className="text-right border-r">Timer tilbage - Proj.</TableHead>
        
        <TableHead className="text-right border-r">Timer tilbage - Prod.</TableHead>
        <TableHead className="text-right border-r">Færdig% (NU)</TableHead>
        <TableHead className="text-right border-r">Færdig% (FØR)</TableHead>
        <TableHead className="text-right border-r">Est. timer ift. Færdig%</TableHead>
        <TableHead className="text-right border-r">+/- Timer</TableHead>
        
        <TableHead className="text-right border-r">Timer tilbage - Mont.</TableHead>
        <TableHead className="text-right">Afsat Fragt</TableHead>
      </TableRow>
    </TableHeader>
  );
};
