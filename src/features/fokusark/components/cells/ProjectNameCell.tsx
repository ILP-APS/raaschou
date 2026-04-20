
import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ProjectNameCellProps {
  projectName: string | null;
  isSubProject: boolean;
  isParent: boolean;
  hasChildren: boolean;
  rowBgColor: string;
}

export const ProjectNameCell: React.FC<ProjectNameCellProps> = ({
  projectName,
  isSubProject,
  isParent,
  hasChildren,
  rowBgColor,
}) => (
  <TableCell 
      className={cn(
        "sticky z-20 transition-colors px-2 py-2",
        rowBgColor,
        "group-hover:bg-green-50",
        isSubProject && "pl-8"
      )}
    style={{ left: '130px', minWidth: '220px', width: '220px', maxWidth: '220px' }}
  >
    <span className={cn(
      isParent && hasChildren && "font-semibold",
      isSubProject && "text-muted-foreground"
    )}>
      {projectName || "-"}
    </span>
  </TableCell>
);
