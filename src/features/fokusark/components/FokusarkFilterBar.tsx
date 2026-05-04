import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { MultiSelectFilter } from "./filters/MultiSelectFilter";
import { FokusarkFilters, FremdriftBucket, OfferAmountBucket, isFilterActive } from "../types/filters";
import { Project } from "../types/project";

interface FokusarkFilterBarProps {
  projects: Project[];
  categories: Map<number, string>;
  filters: FokusarkFilters;
  onUpdate: <K extends keyof FokusarkFilters>(key: K, value: FokusarkFilters[K]) => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
}

const FREMDRIFT_OPTIONS: { value: FremdriftBucket; label: string }[] = [
  { value: "behind", label: "Bagud" },
  { value: "on_track", label: "På sporet" },
  { value: "ahead", label: "Foran plan" },
];

const OFFER_AMOUNT_OPTIONS: { value: OfferAmountBucket; label: string }[] = [
  { value: "25_50k", label: "25k – 50k" },
  { value: "50_100k", label: "50k – 100k" },
  { value: "100_250k", label: "100k – 250k" },
  { value: "250_500k", label: "250k – 500k" },
  { value: "500k_1m", label: "500k – 1M" },
  { value: "1m_plus", label: "≥ 1M" },
];

export const FokusarkFilterBar: React.FC<FokusarkFilterBarProps> = ({
  projects,
  categories,
  filters,
  onUpdate,
  onClearAll,
  filteredCount,
  totalCount,
}) => {
  const responsibleOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.id.includes("-")) continue;
      if (p.responsible_person_initials) set.add(p.responsible_person_initials);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, "da"))
      .map(v => ({ value: v, label: v }));
  }, [projects]);

  const categoryOptions = useMemo(() => {
    const usedIds = new Set<number>();
    for (const p of projects) {
      if (p.id.includes("-")) continue;
      if (p.hn_appointment_category_id) usedIds.add(p.hn_appointment_category_id);
    }
    return Array.from(usedIds)
      .map(id => ({ id, name: categories.get(id) ?? `Kategori ${id}` }))
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/^(\d+)\./)?.[1] ?? "9999", 10);
        const numB = parseInt(b.name.match(/^(\d+)\./)?.[1] ?? "9999", 10);
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name, "da");
      })
      .map(c => ({ value: c.id, label: c.name }));
  }, [projects, categories]);

  const active = isFilterActive(filters);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-y border-border/60">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => onUpdate("search", e.target.value)}
          placeholder="Søg på ID eller navn..."
          className="h-9 pl-8 w-[240px]"
        />
        {filters.search && (
          <button
            onClick={() => onUpdate("search", "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Ryd søgning"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <MultiSelectFilter
        label="Ansvarlig"
        options={responsibleOptions}
        selected={filters.responsible}
        onChange={(next) => onUpdate("responsible", next)}
        searchPlaceholder="Søg ansvarlig..."
        width={240}
      />

      <MultiSelectFilter
        label="Status"
        options={categoryOptions}
        selected={filters.categoryIds}
        onChange={(next) => onUpdate("categoryIds", next as number[])}
        searchPlaceholder="Søg status..."
        width={320}
      />

      <MultiSelectFilter
        label="Fremdrift"
        options={FREMDRIFT_OPTIONS}
        selected={filters.fremdrift}
        onChange={(next) => onUpdate("fremdrift", next as FremdriftBucket[])}
        width={200}
      />

      {active && (
        <>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Ryd alle
          </Button>
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredCount} af {totalCount} projekter
          </span>
        </>
      )}
    </div>
  );
};
