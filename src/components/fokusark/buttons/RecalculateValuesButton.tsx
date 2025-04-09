
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useRecalculateValues } from "@/hooks/useRecalculateValues";

interface RecalculateValuesButtonProps {
  tableData: string[][];
}

const RecalculateValuesButton: React.FC<RecalculateValuesButtonProps> = ({ tableData }) => {
  const { recalculateValues, isRecalculating } = useRecalculateValues();
  
  const handleRecalculateValues = async () => {
    await recalculateValues(tableData);
  };

  return (
    <Button 
      onClick={handleRecalculateValues} 
      className="gap-2"
      variant="outline"
      disabled={isRecalculating}
    >
      <Calculator className="h-4 w-4" />
      Recalculate Values
    </Button>
  );
};

export default RecalculateValuesButton;
