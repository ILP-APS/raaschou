
import React from "react";

export const ProjectsTableHeader: React.FC = () => {
  return (
    <thead>
      <tr>
        {/* Aftale columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={3}>
          Aftale
        </th>
        {/* Tilbud columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={4}>
          Tilbud
        </th>
        {/* Estimeret columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={3}>
          Estimeret
        </th>
        {/* Realiseret columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={4}>
          Realiseret
        </th>
        {/* Projektering columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={1}>
          Projektering
        </th>
        {/* Produktions stadie columns */}
        <th className="bg-muted/50 font-semibold text-center border-r-2 border-border" colSpan={5}>
          Produktions stadie
        </th>
        {/* Montage columns */}
        <th className="bg-muted/50 font-semibold text-center" colSpan={2}>
          Montage
        </th>
      </tr>
      <tr>
        {/* Aftale */}
        <th className="sticky-column sticky-col-0 sticky-header sticky-corner border-r">Projekt ID</th>
        <th className="sticky-column sticky-col-1 sticky-header sticky-corner border-r">Projekt Navn/Emne</th>
        <th className="sticky-header border-r-2 border-border">Ansvarlig</th>
        {/* Tilbud */}
        <th className="sticky-header text-right">Tilbudsbeløb i alt</th>
        <th className="sticky-header text-right">Heraf Montage</th>
        <th className="sticky-header text-right">Heraf Underleverandør</th>
        <th className="sticky-header text-right border-r-2 border-border">Beregnet Materialebeløb</th>
        {/* Estimeret */}
        <th className="sticky-header text-right">Estimeret timer - Projektering</th>
        <th className="sticky-header text-right">Estimeret timer - Produktion</th>
        <th className="sticky-header text-right border-r-2 border-border">Estimeret timer - Montage</th>
        {/* Realiseret */}
        <th className="sticky-header text-right">Brugte timer - Projektering</th>
        <th className="sticky-header text-right">Brugte timer - Produktion</th>
        <th className="sticky-header text-right">Brugte timer - Montage</th>
        <th className="sticky-header text-right border-r-2 border-border">Total antal timer brugt</th>
        {/* Projektering */}
        <th className="sticky-header text-right border-r-2 border-border">Timer tilbage - Projektering</th>
        {/* Produktions stadie */}
        <th className="sticky-header text-right">Timer tilbage - Produktion</th>
        <th className="sticky-header text-right">Færdig% (NU)</th>
        <th className="sticky-header text-right">Færdig% (FØR)</th>
        <th className="sticky-header text-right">Estimeret timer ift. Færdig%</th>
        <th className="sticky-header text-right border-r-2 border-border">+/- Timer</th>
        {/* Montage */}
        <th className="sticky-header text-right">Timer tilbage - Montage</th>
        <th className="sticky-header text-right">Afsat Fragt</th>
      </tr>
    </thead>
  );
};
