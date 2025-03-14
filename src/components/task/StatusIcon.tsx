
import React from "react";
import { Clock, HelpCircle, Circle, CheckCircle, Ban } from "lucide-react";
import { TaskStatus } from "@/types/task";

export const StatusIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case "In Progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "Backlog":
      return <HelpCircle className="h-4 w-4 text-gray-500" />;
    case "Todo":
      return <Circle className="h-4 w-4 text-gray-400" />;
    case "Done":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "Canceled":
      return <Ban className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};
