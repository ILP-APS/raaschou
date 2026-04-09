import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type AccountFilterValue = "alle" | "inventar" | "byg";

interface AccountFilterProps {
  value: AccountFilterValue;
  onChange: (value: AccountFilterValue) => void;
}

const AccountFilter: React.FC<AccountFilterProps> = ({ value, onChange }) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as AccountFilterValue);
      }}
      size="sm"
    >
      <ToggleGroupItem value="alle" aria-label="Alle">Alle</ToggleGroupItem>
      <ToggleGroupItem value="inventar" aria-label="Inventar">Inventar</ToggleGroupItem>
      <ToggleGroupItem value="byg" aria-label="Byg">Byg</ToggleGroupItem>
    </ToggleGroup>
  );
};

export default AccountFilter;
