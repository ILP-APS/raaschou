
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
      "sticky z-20",
      rowBgColor,
      isSubProject && "pl-8"
    )}
    style={{ left: '150px', minWidth: '300px', width: '300px' }}
  >
    <span className={cn(
      isParent && hasChildren && "font-semibold",
      isSubProject && "text-muted-foreground"
    )}>
      {projectName || "-"}
    </span>
  </TableCell>
);
