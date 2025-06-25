
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ProjectsTableHeader: React.FC = () => {
  return (
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
  );
};
