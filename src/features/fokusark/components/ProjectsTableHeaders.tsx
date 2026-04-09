
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderCellProps {
  children: React.ReactNode;
  tooltip: string;
  className?: string;
  style?: React.CSSProperties;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ children, tooltip, className, style }) => (
  <TableHead className={className} style={style}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dotted border-muted-foreground/40">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-sm">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TableHead>
);

export const ProjectsTableHeaders: React.FC = () => {
  return (
    <TooltipProvider delayDuration={200}>
      <TableHeader className="sticky top-0 z-40 bg-background">
        <TableRow className="bg-muted/30">
          <TableHead 
            className="sticky z-30 bg-muted text-center font-semibold" 
            colSpan={3}
            style={{ left: 0, boxShadow: '1px 0 0 0 hsl(var(--border))' }}
          >
            Aftale
          </TableHead>
          <TableHead className="text-center font-semibold border-r" colSpan={6}>Tilbud</TableHead>
          <TableHead className="text-center font-semibold border-r" colSpan={3}>Estimeret</TableHead>
          <TableHead className="text-center font-semibold border-r" colSpan={4}>Realiseret</TableHead>
          <TableHead className="text-center font-semibold border-r" colSpan={1}>Projektering</TableHead>
          <TableHead className="text-center font-semibold border-r" colSpan={5}>Produktions stadie</TableHead>
          <TableHead className="text-center font-semibold" colSpan={2}>Montage</TableHead>
        </TableRow>

        <TableRow className="bg-muted/30">
          <TableHead className="sticky z-30 bg-muted" style={{ left: 0, minWidth: '150px', width: '150px' }}>Projekt ID</TableHead>
          <TableHead className="sticky z-30 bg-muted" style={{ left: '150px', minWidth: '300px', width: '300px' }}>Projekt Navn/Emne</TableHead>
          <TableHead className="sticky z-30 bg-muted text-center" style={{ left: '450px', minWidth: '100px', width: '100px', boxShadow: '1px 0 0 0 hsl(var(--border))' }}>Ansvarlig</TableHead>

          <HeaderCell className="text-right border-r" tooltip="Samlet tilbudsbeløb fra e-regnskab tilbud (offer line items)">Tilbudsbeløb i alt</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Montagebeløb fra tilbud (offer lines med varenr. 'Montage')">Heraf Montage</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Underleverandørbeløb fra tilbud (offer lines med varenr. 'UE')">Heraf Underleverandør</HeaderCell>
          <HeaderCell className="text-right border-r bg-blue-50" tooltip="Manuel overstyring af montagebeløb. Bruges hvis montage ikke er registreret i tilbuddet. Redigerbar.">Manuel Montage</HeaderCell>
          <HeaderCell className="text-right border-r bg-blue-50" tooltip="Manuel overstyring af underleverandørbeløb. Bruges hvis UE ikke er registreret i tilbuddet. Redigerbar.">Manuel Underlev.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="(Tilbud − Montage − Underlev.) × Materialeandel%">Beregnet Materialebeløb</HeaderCell>

          <HeaderCell className="text-right border-r" tooltip="(Tilbud − Montage) × Projekteringsandel% / Projektering timepris">Est. timer - Proj.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="(Tilbud − Montage − Materialer − Underlev.) / Gns. timepris − Est. timer proj.">Est. timer - Prod.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="(Montage − Montage × Fragtandel%) / Montage timepris">Est. timer - Mont.</HeaderCell>

          <HeaderCell className="text-right border-r" tooltip="Timer registreret på projekteringsarbejdstyper i e-regnskab">Brugte timer - Proj.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Total timer − Brugte montage − Brugte projektering">Brugte timer - Prod.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Timer registreret på montagearbejdstyper i e-regnskab">Brugte timer - Mont.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Sum af alle registrerede timer på aftalen i e-regnskab">Total timer brugt</HeaderCell>

          <HeaderCell className="text-right border-r" tooltip="Est. timer proj. − Brugte timer proj.">Timer tilbage - Proj.</HeaderCell>

          <HeaderCell className="text-right border-r" tooltip="Est. timer prod. − Brugte timer prod.">Timer tilbage - Prod.</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Estimeret færdiggørelsesgrad lige nu. Redigerbar — opdaterer beregninger automatisk.">Færdig% (NU)</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Tidligere registreret færdiggørelsesgrad til sammenligning.">Færdig% (FØR)</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="Est. timer prod. × Færdig% (NU)">Est. timer ift. Færdig%</HeaderCell>
          <HeaderCell className="text-right border-r" tooltip="−Brugte timer prod. + Est. timer ift. Færdig%. Positivt = foran plan, negativt = bagud.">+/- Timer</HeaderCell>

          <HeaderCell className="text-right border-r" tooltip="Est. timer mont. − Brugte timer mont.">Timer tilbage - Mont.</HeaderCell>
          <HeaderCell className="text-right" tooltip="Fragtandel% × Montagebeløb">Afsat Fragt</HeaderCell>
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
};
