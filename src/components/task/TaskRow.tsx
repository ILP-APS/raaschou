
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Task } from "@/types/task";
import { StatusIcon } from "./StatusIcon";

interface TaskRowProps {
  task: Task;
  openEditSheet: (task: Task) => void;
  isMobile: boolean;
}

export const TaskRow = ({ task, openEditSheet, isMobile }: TaskRowProps) => {
  return (
    <TableRow 
      key={task.id} 
      className="cursor-pointer"
      onClick={() => openEditSheet(task)}
    >
      <TableCell>
        <div className="flex flex-col">
          <span className="line-clamp-1 font-medium">{task.title}</span>
          {isMobile && <span className="text-xs text-muted-foreground mt-1">{task.type}</span>}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon status={task.status} />
          <span>{task.status}</span>
        </div>
      </TableCell>
      {!isMobile && (
        <TableCell>
          <span>{task.type}</span>
        </TableCell>
      )}
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
