import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FokusarkSettings } from "../hooks/useSettings";

interface SettingsPanelProps {
  settings: FokusarkSettings;
  onUpdateSetting: (key: string, value: number) => Promise<void>;
}

const SETTING_LABELS: Record<keyof FokusarkSettings, { label: string; suffix: string; isPercentage: boolean }> = {
  material_share:         { label: "Materialeandel",        suffix: "%",  isPercentage: true },
  average_hourly_rate:    { label: "Gennemsnit timepris",   suffix: "kr", isPercentage: false },
  assembly_hourly_rate:   { label: "Montage timepris",      suffix: "kr", isPercentage: false },
  projecting_share:       { label: "Projekteringsandel",    suffix: "%",  isPercentage: true },
  projecting_hourly_rate: { label: "Projektering timepris", suffix: "kr", isPercentage: false },
  freight_share:          { label: "Fragtandel",            suffix: "%",  isPercentage: true },
  min_offer_amount:       { label: "Vis kun tilbud over",   suffix: "kr", isPercentage: false },
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSetting }) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const vals: Record<string, string> = {};
    Object.entries(settings).forEach(([key, value]) => {
      const config = SETTING_LABELS[key as keyof FokusarkSettings];
      vals[key] = config.isPercentage ? String(value * 100) : String(value);
    });
    setLocalValues(vals);
  }, [settings]);

  const handleBlur = (key: string) => {
    const config = SETTING_LABELS[key as keyof FokusarkSettings];
    const parsed = parseFloat(localValues[key]);
    if (isNaN(parsed)) return;
    const dbValue = config.isPercentage ? parsed / 100 : parsed;
    if (dbValue !== settings[key as keyof FokusarkSettings]) {
      onUpdateSetting(key, dbValue);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Indstillinger
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Fokusark indstillinger</SheetTitle>
          <SheetDescription>
            Konstanter brugt til beregning af estimerede timer og materialer.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          {Object.entries(SETTING_LABELS).map(([key, config]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={key}>{config.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={key}
                  type="number"
                  value={localValues[key] || ""}
                  onChange={(e) => setLocalValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  onBlur={() => handleBlur(key)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{config.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
