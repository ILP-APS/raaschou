
import React from "react";

export const ProjectsTableHeader: React.FC = () => {
  return (
    <thead>
      <tr>
        {/* Aftale - Projekt ID (Sticky Column 1) */}
        <th className="sticky-column sticky-col-0 sticky-header sticky-corner border-r">Projekt ID</th>
        {/* Aftale - Projekt Navn (Sticky Column 2) */}
        <th className="sticky-column sticky-col-1 sticky-header sticky-corner border-r">Projekt Navn/Emne</th>
        {/* Aftale - Ansvarlig */}
        <th className="sticky-header border-r-2 text-center">Ansvarlig</th>
        {/* Tilbud - Tilbudsbeløb i alt */}
        <th className="sticky-header text-right">Tilbudsbeløb i alt</th>
        {/* Tilbud - Heraf Montage */}
        <th className="sticky-header text-right">Heraf Montage</th>
        {/* Tilbud - Heraf Underleverandør */}
        <th className="sticky-header text-right">Heraf Underleverandør</th>
        {/* Tilbud - Beregnet Materialebeløb */}
        <th className="sticky-header text-right border-r-2">Beregnet Materialebeløb</th>
        {/* Estimeret - Projektering */}
        <th className="sticky-header text-right">Estimeret timer - Projektering</th>
        {/* Estimeret - Produktion */}
        <th className="sticky-header text-right">Estimeret timer - Produktion</th>
        {/* Estimeret - Montage */}
        <th className="sticky-header text-right border-r-2">Estimeret timer - Montage</th>
        {/* Realiseret - Projektering */}
        <th className="sticky-header text-right">Brugte timer - Projektering</th>
        {/* Realiseret - Produktion */}
        <th className="sticky-header text-right">Brugte timer - Produktion</th>
        {/* Realiseret - Montage */}
        <th className="sticky-header text-right">Brugte timer - Montage</th>
        {/* Realiseret - Total */}
        <th className="sticky-header text-right border-r-2">Total antal timer brugt</th>
        {/* Projektering - Timer tilbage */}
        <th className="sticky-header text-right border-r-2">Timer tilbage - Projektering</th>
        {/* Produktions stadie - Timer tilbage */}
        <th className="sticky-header text-right">Timer tilbage - Produktion</th>
        {/* Produktions stadie - Færdig% (NU) */}
        <th className="sticky-header text-right">Færdig% (NU)</th>
        {/* Produktions stadie - Færdig% (FØR) */}
        <th className="sticky-header text-right">Færdig% (FØR)</th>
        {/* Produktions stadie - Estimeret timer ift. Færdig% */}
        <th className="sticky-header text-right">Estimeret timer ift. Færdig%</th>
        {/* Produktions stadie - +/- Timer */}
        <th className="sticky-header text-right border-r-2">+/- Timer</th>
        {/* Montage - Timer tilbage */}
        <th className="sticky-header text-right">Timer tilbage - Montage</th>
        {/* Montage - Afsat Fragt */}
        <th className="sticky-header text-right">Afsat Fragt</th>
      </tr>
    </thead>
  );
};
