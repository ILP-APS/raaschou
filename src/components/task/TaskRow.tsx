
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Task } from "@/types/task";
import { StatusIcon } from "./StatusIcon";

interface TaskRowProps {
  task: Task;
  openEditSheet: (task: Task) => void;
}

export const TaskRow = ({ task, openEditSheet }: TaskRowProps) => {
  return (
    <TableRow 
      key={task.id} 
      className="cursor-pointer"
      onClick={() => openEditSheet(task)}
    >
      <TableCell>
        <span className="line-clamp-1">{task.title}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon status={task.status} />
          <span>{task.status}</span>
        </div>
      </TableCell>
      <TableCell>
        <span>{task.type}</span>
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            openEditSheet(task);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
