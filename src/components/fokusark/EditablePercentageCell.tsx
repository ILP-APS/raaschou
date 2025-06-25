
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatDanishNumber } from "@/utils/formatUtils";

interface EditablePercentageCellProps {
  value: number | null;
  projectId: string;
  onUpdate: (projectId: string, value: number) => void;
}

export const EditablePercentageCell: React.FC<EditablePercentageCellProps> = ({
  value,
  projectId,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag scrolling when clicking on editable cell
    e.preventDefault(); // Prevent any default behavior
    setIsEditing(true);
    setEditValue(value?.toString() || "");
  };

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onUpdate(projectId, numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value?.toString() || "");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drag when interacting with input elements
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        className="w-full text-right"
        autoFocus
        type="number"
        min="0"
        max="100"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded text-right"
    >
      {value !== null ? formatDanishNumber(value) : "-"}
    </div>
  );
};
