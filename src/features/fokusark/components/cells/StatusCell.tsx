import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusCellProps {
  categoryId: number | null;
  categoryName: string | null | undefined;
  rowBgColor: string;
}

export const StatusCell: React.FC<StatusCellProps> = ({ categoryId, categoryName, rowBgColor }) => {
  // Extract leading number prefix (e.g. "15. Produktion på værksted" -> "15")
  let prefix: string | null = null;
  if (categoryName) {
    const m = categoryName.match(/^\s*(\d+)/);
    if (m) prefix = m[1];
  }
  const display = prefix ?? (categoryId != null ? String(categoryId) : null);

  return (
    <TableCell
      className={cn(
        "sticky z-20 text-center transition-colors px-2 py-2",
        rowBgColor,
        "group-hover:bg-green-50"
      )}
      style={{
        left: '430px',
        minWidth: '70px',
        width: '70px',
        maxWidth: '70px',
        boxShadow: '2px 0 0 0 hsl(var(--border))',
      }}
    >
      {display ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="cursor-help font-mono">
                {display}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-sm">
              {categoryName || `Kategori ${categoryId}`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  );
};
