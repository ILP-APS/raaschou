import React from "react";
import { cn } from "@/lib/utils";
import { getDayCellStatus, type DayCellStatus } from "../utils/weekUtils";
import CategoryIcon from "./CategoryIcon";

const statusClasses: Record<DayCellStatus, string> = {
  ok: "bg-green-100 text-green-800",
  missing: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-800",
  "no-work": "bg-muted text-muted-foreground",
  absence: "bg-blue-100 text-blue-700",
};

interface Props {
  registered: number;
  expected: number;
  categories: string[];
  hasAbsence: boolean;
}

const ABSENCE_CATS = new Set(["sickness", "vacation", "private"]);

const DayCell: React.FC<Props> = ({ registered, expected, categories, hasAbsence }) => {
  const status = getDayCellStatus(registered, expected, hasAbsence);

  const uniqueNonWork = categories.filter((c) => c !== "work" && !ABSENCE_CATS.has(c) || ABSENCE_CATS.has(c));
  // Show primary category icon
  const primaryCat = hasAbsence
    ? categories.find((c) => ABSENCE_CATS.has(c))
    : categories.find((c) => c === "internal");
  const extraCount = new Set(categories).size - (primaryCat ? 1 : 0) - (categories.includes("work") ? 1 : 0);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 rounded px-2 py-1 text-sm font-medium min-w-[60px]",
        statusClasses[status]
      )}
    >
      {primaryCat && <CategoryIcon category={primaryCat} />}
      {registered > 0 ? registered.toFixed(1) : "—"}
      {extraCount > 0 && (
        <span className="text-[10px] opacity-70">+{extraCount}</span>
      )}
    </div>
  );
};

export default DayCell;
