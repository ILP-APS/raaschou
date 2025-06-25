
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatDanishCurrency } from "@/utils/formatUtils";

interface EditableCurrencyCellProps {
  value: number | null;
  projectId: string;
  onUpdate: (projectId: string, value: number) => void;
  fieldType: 'assembly' | 'subcontractor';
}

export const EditableCurrencyCell: React.FC<EditableCurrencyCellProps> = ({
  value,
  projectId,
  onUpdate,
  fieldType,
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
    const numValue = parseFloat(editValue.replace(/[^\d.-]/g, '')); // Remove non-numeric characters except digits, dots, and minus
    if (!isNaN(numValue) && numValue >= 0) {
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
        className="w-full text-right bg-blue-50"
        autoFocus
        type="text"
        placeholder="0"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded text-right bg-blue-50"
      title={`Manual override for ${fieldType === 'assembly' ? 'assembly' : 'subcontractor'} amount`}
    >
      {value !== null ? formatDanishCurrency(value) : "-"}
    </div>
  );
};
