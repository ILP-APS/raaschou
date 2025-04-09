
import React from "react";
import { EditorProps } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";

interface EditableCellProps extends EditorProps<FokusarkRow> {}

const EditableCell: React.FC<EditableCellProps> = (props) => {
  return (
    <input
      value={props.row[props.column.key] as string}
      onChange={e => props.onRowChange({
        ...props.row,
        [props.column.key]: e.target.value
      })}
      className="w-full h-full px-2 bg-transparent"
    />
  );
};

export default EditableCell;
