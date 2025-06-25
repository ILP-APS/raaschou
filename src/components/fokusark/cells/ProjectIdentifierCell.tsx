
import React from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ProjectIdentifierCellProps {
  projectId: string;
  isSubProject: boolean;
  isParent: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  rowBgColor: string;
  onToggleCollapse?: () => void;
}

export const ProjectIdentifierCell: React.FC<ProjectIdentifierCellProps> = ({
  projectId,
  isSubProject,
  isParent,
  hasChildren,
  isExpanded,
  rowBgColor,
  onToggleCollapse,
}) => {
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <TableCell 
      className={cn(
        "sticky z-20 font-medium",
        rowBgColor,
        isSubProject && "pl-8"
      )}
      style={{ left: 0, minWidth: '150px', width: '150px' }}
    >
      <div className="flex items-center gap-2">
        {isParent && hasChildren && (
          <button
            onClick={handleToggleClick}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <span className={cn(
          isParent && hasChildren && "font-semibold",
          isSubProject && "text-muted-foreground"
        )}>
          {projectId}
        </span>
      </div>
    </TableCell>
  );
};
