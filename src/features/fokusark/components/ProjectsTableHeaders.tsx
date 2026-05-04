
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
  width?: number;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ children, tooltip, className, style, width }) => (
  <TableHead
    className={cn("px-2 py-2 align-middle leading-tight whitespace-normal", className)}
    style={{
      ...style,
      width: width ? `${width}px` : undefined,
      minWidth: width ? `${width}px` : undefined,
      maxWidth: width ? `${width}px` : undefined,
    }}
  >
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
        <TableRow>
          <TableHead 
            className="sticky z-30 bg-muted text-center font-semibold" 
            colSpan={4}
            style={{ left: 0, boxShadow: '1px 0 0 0 hsl(var(--border))' }}
          >
            Aftale
          </TableHead>
          <TableHead className="bg-slate-100 text-center font-semibold border-r-4 border-r-border" colSpan={6}>Tilbud</TableHead>
          <TableHead className="bg-amber-50 text-center font-semibold border-r-4 border-r-border" colSpan={3}>Estimeret</TableHead>
          <TableHead className="bg-emerald-50 text-center font-semibold border-r-4 border-r-border" colSpan={4}>Realiseret</TableHead>
          <TableHead className="bg-indigo-50 text-center font-semibold border-r-4 border-r-border" colSpan={1}>Design</TableHead>
          <TableHead className="bg-violet-50 text-center font-semibold border-r-4 border-r-border" colSpan={5}>Produktions stadie</TableHead>
          <TableHead className="bg-sky-50 text-center font-semibold" colSpan={2}>Montage</TableHead>
        </TableRow>

        <TableRow>
          <TableHead className="sticky z-30 bg-muted px-2 py-2 leading-tight whitespace-normal align-middle" style={{ left: 0, minWidth: '130px', width: '130px', maxWidth: '130px' }}>Projekt ID</TableHead>
          <TableHead className="sticky z-30 bg-muted px-2 py-2 leading-tight whitespace-normal align-middle" style={{ left: '130px', minWidth: '220px', width: '220px', maxWidth: '220px' }}>Projekt Navn/Emne</TableHead>
          <TableHead className="sticky z-30 bg-muted text-center px-2 py-2 leading-tight whitespace-normal align-middle" style={{ left: '350px', minWidth: '80px', width: '80px', maxWidth: '80px', boxShadow: '1px 0 0 0 hsl(var(--border))' }}>Ansvarlig</TableHead>

          <HeaderCell width={110} className="bg-slate-50 text-right border-r" tooltip="Samlet tilbudsbeløb fra e-regnskab tilbud (offer line items)">Tilbudsbeløb i alt</HeaderCell>
          <HeaderCell width={100} className="bg-slate-50 text-right border-r" tooltip="Montagebeløb fra tilbud (offer lines med varenr. 'Montage')">Heraf Montage</HeaderCell>
          <HeaderCell width={110} className="bg-slate-50 text-right border-r" tooltip="Underleverandørbeløb fra tilbud (offer lines med varenr. 'UE')">Heraf Underlev.</HeaderCell>
          <HeaderCell width={100} className="text-right border-r bg-blue-50" tooltip="Manuelt tillæg til montagebeløb. Lægges oven i 'Heraf Montage' fra tilbuddet (additiv). Brug til ekstra montage der ikke er på tilbuddet. Redigerbar.">Manuel Montage</HeaderCell>
          <HeaderCell width={100} className="text-right border-r bg-blue-50" tooltip="Manuelt tillæg til underleverandørbeløb. Lægges oven i 'Heraf Underlev.' fra tilbuddet (additiv). Brug til ekstra UE der ikke er på tilbuddet. Redigerbar.">Manuel Underlev.</HeaderCell>
          <HeaderCell width={110} className="bg-slate-50 text-right border-r-4 border-r-border" tooltip="(Tilbud − Montage − Underlev.) × Materialeandel%">Beregnet Materiale</HeaderCell>

          <HeaderCell width={90} className="bg-amber-50/50 text-right border-r" tooltip="(Tilbud − Montage − Underlev.) × Projekteringsandel% / Projektering timepris">Est. timer Design</HeaderCell>
          <HeaderCell width={90} className="bg-amber-50/50 text-right border-r" tooltip="(Tilbud − Montage − Materialer − Underlev.) / Gns. timepris − Est. timer design">Est. timer Prod</HeaderCell>
          <HeaderCell width={90} className="bg-amber-50/50 text-right border-r-4 border-r-border" tooltip="(Montage − Montage × Fragtandel%) / Montage timepris">Est. timer Mont.</HeaderCell>

          <HeaderCell width={95} className="bg-emerald-50/50 text-right border-r" tooltip="Timer registreret på projekteringsarbejdstyper i e-regnskab">Brugte timer Design</HeaderCell>
          <HeaderCell width={95} className="bg-emerald-50/50 text-right border-r" tooltip="Total timer − Brugte montage − Brugte projektering">Brugte timer Prod</HeaderCell>
          <HeaderCell width={95} className="bg-emerald-50/50 text-right border-r" tooltip="Timer registreret på montagearbejdstyper i e-regnskab">Brugte timer Mont.</HeaderCell>
          <HeaderCell width={95} className="bg-emerald-50/50 text-right border-r-4 border-r-border" tooltip="Sum af alle registrerede timer på aftalen i e-regnskab">Total timer brugt</HeaderCell>

          <HeaderCell width={95} className="bg-indigo-50/50 text-right border-r-4 border-r-border" tooltip="Est. timer design − Brugte timer design">Timer tilbage Design</HeaderCell>

          <HeaderCell width={85} className="bg-violet-50/50 text-right border-r" tooltip="Estimeret færdiggørelsesgrad lige nu. Redigerbar — opdaterer beregninger automatisk.">Færdig% (NU)</HeaderCell>
          <HeaderCell width={85} className="bg-violet-50/50 text-right border-r" tooltip="Tidligere registreret færdiggørelsesgrad til sammenligning.">Færdig% (FØR)</HeaderCell>
          <HeaderCell width={100} className="bg-violet-50/50 text-right border-r" tooltip="Est. timer prod × Færdig% (NU)">Est. timer ift. Færdig%</HeaderCell>
          <HeaderCell width={85} className="bg-violet-50/50 text-right border-r" tooltip="Est. timer ift. Færdig% − Brugte timer prod. Hvor mange produktionstimer der reelt er tilbage baseret på nuværende færdiggørelsesgrad. Positivt = foran plan (grøn), negativt = bagud (rød).">Fremdrift</HeaderCell>
          <HeaderCell width={95} className="bg-violet-50/50 text-right border-r-4 border-r-border" tooltip="Est. timer prod − Brugte timer prod. Viser hvor meget af det oprindelige tids-budget der ikke er brugt endnu (uden færdighedsjustering).">Timer tilbage Prod</HeaderCell>

          <HeaderCell width={95} className="bg-sky-50/50 text-right border-r" tooltip="Est. timer mont. − Brugte timer mont.">Timer tilbage Mont.</HeaderCell>
          <HeaderCell width={100} className="bg-sky-50/50 text-right" tooltip="Fragtandel% × Montagebeløb">Afsat Fragt</HeaderCell>
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
};
