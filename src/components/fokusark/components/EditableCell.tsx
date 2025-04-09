
import React from "react";
import { EditorProps } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";

// Define a proper type alias that explicitly includes all the properties we need
type EditableCellProps<R> = EditorProps<R, unknown>;

const EditableCell: React.FC<EditableCellProps<FokusarkRow>> = ({
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
      className="w-full h-full px-2 bg-transparent"
    />
  );
};

export default EditableCell;
