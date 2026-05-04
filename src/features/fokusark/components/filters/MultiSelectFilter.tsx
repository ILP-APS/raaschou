import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface MultiSelectFilterProps<T extends string | number> {
  label: string;
  options: MultiSelectOption<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  width?: number;
}

export function MultiSelectFilter<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder = "Søg...",
  emptyText = "Ingen resultater.",
  width = 240,
}: MultiSelectFilterProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) onChange(selected.filter(v => v !== value));
    else onChange([...selected, value]);
  };

  const triggerLabel = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 gap-2", selected.length > 0 && "border-primary text-primary")}
        >
          {triggerLabel}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width }}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map(opt => {
                const isSelected = selected.includes(opt.value);
                return (
                  <CommandItem
                    key={String(opt.value)}
                    value={`${opt.label} ${opt.sublabel ?? ""}`}
                    onSelect={() => toggle(opt.value)}
                  >
                    <Checkbox checked={isSelected} className="mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-xs text-muted-foreground truncate">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 ml-2 opacity-70" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
