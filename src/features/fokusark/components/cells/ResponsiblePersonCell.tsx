
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
        "sticky z-20 text-center transition-colors",
        rowBgColor,
        "group-hover:bg-green-50"
      )}
    style={{ 
      left: '450px', 
      minWidth: '100px', 
      width: '100px',
      boxShadow: '2px 0 0 0 hsl(var(--border))'
    }}
  >
    {extractInitials(responsiblePersonInitials)}
  </TableCell>
);
