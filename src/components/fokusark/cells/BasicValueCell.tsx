
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatDanishNumber, formatDanishCurrency } from "@/utils/formatUtils";

interface BasicValueCellProps {
  value: number | null;
  isNumber?: boolean;
  className?: string;
}

export const BasicValueCell: React.FC<BasicValueCellProps> = ({
  value,
  isNumber = false,
  className = "text-right border-r",
}) => {
  const formatValue = (value: number | null, isNumber = false): string => {
    if (value === null || value === undefined) return "-";
    return isNumber ? formatDanishNumber(value) : formatDanishCurrency(value);
  };

  return (
    <TableCell className={className}>
      {formatValue(value, isNumber)}
    </TableCell>
  );
};
