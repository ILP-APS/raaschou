import React from "react";
import { Building, Thermometer, Palmtree, Lock } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  internal: <Building className="h-3 w-3 text-blue-600" />,
  sickness: <Thermometer className="h-3 w-3 text-red-500" />,
  vacation: <Palmtree className="h-3 w-3 text-green-600" />,
  private: <Lock className="h-3 w-3 text-purple-500" />,
};

interface Props {
  category: string;
}

const CategoryIcon: React.FC<Props> = ({ category }) => {
  return iconMap[category] ?? null;
};

export default CategoryIcon;
