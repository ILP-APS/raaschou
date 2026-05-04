
import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { extractInitials } from "../../utils/formatUtils";

interface ResponsiblePersonCellProps {
  responsiblePersonInitials: string | null;
  rowBgColor: string;
}

export const ResponsiblePersonCell: React.FC<ResponsiblePersonCellProps> = ({
  responsiblePersonInitials,
  rowBgColor,
}) => (
  <TableCell 
      className={cn(
        "sticky z-20 text-center transition-colors px-2 py-2",
        rowBgColor,
        "group-hover:bg-green-50"
      )}
    style={{ 
      left: '350px', 
      minWidth: '80px', 
      width: '80px',
      maxWidth: '80px',
    }}
  >
    {extractInitials(responsiblePersonInitials)}
  </TableCell>
);
