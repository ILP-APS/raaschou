
import React from "react";

interface EditableCellProps {
  value?: string;
  onChange?: (value: string) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value = "", onChange }) => {
  return (
    <div className="p-2 border border-dashed border-muted-foreground rounded">
      <p className="text-sm text-muted-foreground">Editable cell (removed)</p>
    </div>
  );
};

export default EditableCell;
