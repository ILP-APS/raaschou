
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatDanishCurrency } from "@/utils/formatUtils";
import { EditableCurrencyCell } from "../EditableCurrencyCell";

interface EditableManualAmountCellProps {
  value: number | null;
  projectId: string;
  fieldType: 'assembly' | 'subcontractor';
  isSubProject: boolean;
  onUpdate: (projectId: string, value: number) => void;
}

export const EditableManualAmountCell: React.FC<EditableManualAmountCellProps> = ({
  value,
  projectId,
  fieldType,
  isSubProject,
  onUpdate,
}) => (
  <TableCell className="text-right border-r">
    {isSubProject ? (
      <div className="p-2 -m-2 text-right bg-blue-50 rounded">
        {value !== null ? formatDanishCurrency(value) : "-"}
      </div>
    ) : (
      <EditableCurrencyCell
        value={value}
        projectId={projectId}
        onUpdate={onUpdate}
        fieldType={fieldType}
      />
    )}
  </TableCell>
);
