import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusCellProps {
  categoryId: number | null;
  categoryName: string | null | undefined;
  rowBgColor: string;
}

export const StatusCell: React.FC<StatusCellProps> = ({ categoryId, categoryName, rowBgColor }) => {
  const display = categoryName ?? (categoryId != null ? `Kategori ${categoryId}` : null);

  return (
    <TableCell
      className={cn(
        "sticky z-20 transition-colors px-2 py-2",
        rowBgColor,
        "group-hover:bg-green-50"
      )}
      style={{
        left: '430px',
        minWidth: '180px',
        width: '180px',
        maxWidth: '180px',
        boxShadow: '2px 0 0 0 hsl(var(--border))',
      }}
    >
      {display ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate text-sm cursor-default">
                {display}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-sm">
              {display}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  );
};
