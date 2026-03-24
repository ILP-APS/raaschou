import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  expected: number;
}

const DeviationBadge: React.FC<Props> = ({ total, expected }) => {
  const diff = total - expected;
  
  if (expected === 0 && total === 0) return <span className="text-muted-foreground">—</span>;

  if (Math.abs(diff) < 0.01) {
    return <span className="text-green-700 font-medium">✓</span>;
  }
  if (diff < 0) {
    return <span className="text-red-600 font-semibold">{diff.toFixed(1)}</span>;
  }
  return <span className="text-amber-600 font-medium">+{diff.toFixed(1)}</span>;
};

export default DeviationBadge;
