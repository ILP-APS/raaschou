
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatDanishNumber, formatDanishCurrency } from "../../utils/formatUtils";

interface BasicValueCellProps {
  value: number | null;
  isNumber?: boolean;
  className?: string;
  suffix?: string;
}

export const BasicValueCell: React.FC<BasicValueCellProps> = ({
  value,
  isNumber = false,
  className = "text-right border-r px-2 py-2",
  suffix = "",
}) => {
  const formatValue = (value: number | null, isNumber = false): string => {
    if (value === null || value === undefined) return "-";
    const formatted = isNumber ? formatDanishNumber(value) : formatDanishCurrency(value);
    return formatted + suffix;
  };

  return (
    <TableCell className={className}>
      {formatValue(value, isNumber)}
    </TableCell>
  );
};
