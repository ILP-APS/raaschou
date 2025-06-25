
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatDanishNumber } from "@/utils/formatUtils";
import { EditablePercentageCell } from "../EditablePercentageCell";

interface EditableCompletionPercentageCellProps {
  value: number | null;
  projectId: string;
  isSubProject: boolean;
  onUpdate: (projectId: string, value: number) => void;
}

export const EditableCompletionPercentageCell: React.FC<EditableCompletionPercentageCellProps> = ({
  value,
  projectId,
  isSubProject,
  onUpdate,
}) => (
  <TableCell className="text-right border-r">
    {isSubProject ? (
      <div className="p-2 -m-2 text-right">
        {value !== null ? formatDanishNumber(value) + '%' : "-"}
      </div>
    ) : (
      <EditablePercentageCell
        value={value}
        projectId={projectId}
        onUpdate={onUpdate}
      />
    )}
  </TableCell>
);
