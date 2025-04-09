
import React from "react";
import { EditorProps } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";

const EditableCell: React.FC<EditorProps<FokusarkRow, unknown>> = ({
  row,
  column,
  onRowChange
}) => {
  return (
    <input
      value={row[column.key] as string}
      onChange={e => onRowChange({
        ...row,
        [column.key]: e.target.value
      })}
      className="w-full h-full px-2 bg-transparent focus:ring-1 focus:ring-primary"
      autoFocus
    />
  );
};

export default EditableCell;
