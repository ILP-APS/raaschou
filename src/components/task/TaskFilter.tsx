import * as React from "react";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaskStatus, TaskType } from "@/types/task";

interface FilterOption {
  value: string;
  label: string;
}

const statusOptions: FilterOption[] = [{
  value: "all",
  label: "All Statuses"
}, {
  value: "In Progress",
  label: "In Progress"
}, {
  value: "Backlog",
  label: "Backlog"
}, {
  value: "Todo",
  label: "Todo"
}, {
  value: "Done",
  label: "Done"
}, {
  value: "Canceled",
  label: "Canceled"
}];

const typeOptions: FilterOption[] = [{
  value: "all",
  label: "All Customers"
}, {
  value: "Nordic Bilsyn",
  label: "Nordic Bilsyn"
}, {
  value: "Nordens Forsikringshus",
  label: "Nordens Forsikringshus"
}, {
  value: "AutoTorvet",
  label: "AutoTorvet"
}, {
  value: "Generel",
  label: "Generel"
}];

interface TaskFilterProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

export function TaskFilter({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter
}: TaskFilterProps) {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [typeOpen, setTypeOpen] = React.useState(false);
  return <div className="flex gap-2 items-center mb-4">
      

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={statusOpen} className="w-[160px] justify-between">
            {statusFilter !== "all" ? statusOptions.find(option => option.value === statusFilter)?.label : "Status"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[160px] p-0">
          <Command>
            <CommandInput placeholder="Search status..." className="h-9" />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                {statusOptions.map(option => <CommandItem key={option.value} value={option.value} onSelect={currentValue => {
                setStatusFilter(currentValue);
                setStatusOpen(false);
              }}>
                    {option.label}
                    <Check className={cn("ml-auto h-4 w-4", statusFilter === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={typeOpen} className="w-[220px] justify-between">
            {typeFilter !== "all" ? typeOptions.find(option => option.value === typeFilter)?.label : "Customer"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandInput placeholder="Search customer..." className="h-9" />
            <CommandList>
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                {typeOptions.map(option => <CommandItem key={option.value} value={option.value} onSelect={currentValue => {
                setTypeFilter(currentValue);
                setTypeOpen(false);
              }}>
                    {option.label}
                    <Check className={cn("ml-auto h-4 w-4", typeFilter === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      
    </div>;
}
