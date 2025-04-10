
import React, { useState, useEffect, useRef } from "react";
import { formatDanishCurrency } from "@/utils/formatUtils";
import { parseNumber } from "@/utils/numberFormatUtils";

interface EditableCellProps {
  value?: string;
  onChange?: (value: string) => void;
  isCurrency?: boolean;
  onlyUpdateOnBlurOrEnter?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value = "", 
  onChange,
  isCurrency = false,
  onlyUpdateOnBlurOrEnter = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);
  const hasUpdatedRef = useRef(false);
  
  // Update internal state when prop value changes (but not during editing)
  useEffect(() => {
    if (!isEditing && value !== prevValueRef.current) {
      setEditValue(value);
      prevValueRef.current = value;
    }
  }, [value, isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
    hasUpdatedRef.current = false;
    
    // For currency values, remove formatting when starting to edit
    if (isCurrency && value) {
      try {
        const numValue = parseNumber(value);
        if (!isNaN(numValue)) {
          setEditValue(String(numValue).replace('.', ','));
        } else {
          setEditValue(value.replace(/ DKK$/, ''));
        }
      } catch (e) {
        setEditValue(value.replace(/ DKK$/, ''));
      }
    } else {
      setEditValue(value);
    }
  };
  
  const handleBlur = () => {
    if (isEditing) {
      finishEditing();
    }
  };
  
  const finishEditing = () => {
    setIsEditing(false);
    // Only trigger onChange if the value has actually changed
    if (onChange && editValue !== prevValueRef.current && !hasUpdatedRef.current) {
      hasUpdatedRef.current = true;
      onChange(editValue);
      prevValueRef.current = editValue;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(prevValueRef.current);
      hasUpdatedRef.current = true; // Prevent update on blur after escape
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // For currency, only allow numbers, commas, and periods
    if (isCurrency) {
      // Allow empty string, or digits with optional comma/period
      if (newValue === '' || /^[0-9]*[,.]?[0-9]*$/.test(newValue)) {
        setEditValue(newValue);
      }
    } else {
      setEditValue(newValue);
    }
    
    // Only update immediately if onlyUpdateOnBlurOrEnter is false
    if (!onlyUpdateOnBlurOrEnter && onChange) {
      onChange(newValue);
      prevValueRef.current = newValue;
    }
  };
  
  // Format display value if it's a currency
  const displayValue = isCurrency && value ? 
    `${formatDanishCurrency(parseNumber(value))}` : 
    value;
  
  return (
    <div className="relative p-1 w-full h-full min-h-[36px]">
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          className="w-full p-1 border border-primary rounded focus:outline-none"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          // Prevent unwanted form submissions
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
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
