import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekLabel, type WeekRange } from "../utils/weekUtils";

interface Props {
  weekRange: WeekRange;
  onPrev: () => void;
  onNext: () => void;
}

const WeekSelector: React.FC<Props> = ({ weekRange, onPrev, onNext }) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[260px] text-center">
        {formatWeekLabel(weekRange)}
      </span>
      <Button variant="outline" size="icon" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekSelector;
