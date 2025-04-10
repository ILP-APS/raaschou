
import React, { useState } from "react";
import { formatDanishCurrency } from "@/utils/formatUtils";
import { parseNumber } from "@/utils/numberFormatUtils";

interface EditableCellProps {
  value?: string;
  onChange?: (value: string) => void;
  isCurrency?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value = "", 
  onChange,
  isCurrency = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    if (onChange && editValue !== value) {
      onChange(editValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (onChange && editValue !== value) {
        onChange(editValue);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  };
  
  // Format display value if it's a currency
  const displayValue = isCurrency && value ? 
    `${formatDanishCurrency(parseNumber(value))} DKK` : 
    value;
  
  return (
    <div className="relative p-1 w-full h-full min-h-[36px]">
      {isEditing ? (
        <input
          autoFocus
          className="w-full p-1 border border-primary rounded focus:outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div 
          className="w-full h-full p-1 cursor-pointer" 
          onDoubleClick={handleDoubleClick}
        >
          {displayValue}
        </div>
      )}
    </div>
  );
};

export default EditableCell;
