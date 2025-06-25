
import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDanishNumber } from "@/utils/formatUtils";

interface ConditionalValueCellProps {
  value: number | null;
  className?: string;
}

export const ConditionalValueCell: React.FC<ConditionalValueCellProps> = ({
  value,
  className,
}) => {
  const getConditionalCellClass = (value: number | null): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "";
    }
    
    if (value > 15) {
      return "bg-green-100";
    } else if (value >= -10 && value <= 15) {
      return "bg-yellow-100";
    } else if (value < -10) {
      return "bg-red-100";
    }
    
    return "";
  };

  return (
    <TableCell className={cn("text-right border-r", getConditionalCellClass(value), className)}>
      {value !== null && value !== undefined ? formatDanishNumber(value) : "-"}
    </TableCell>
  );
};
