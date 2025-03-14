
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Task } from "@/types/task";
import { TaskRow } from "./TaskRow";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskTableProps {
  tasks: Task[];
  openEditSheet: (task: Task) => void;
}

export const TaskTable = ({ tasks, openEditSheet }: TaskTableProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? "w-full min-w-[120px]" : "min-w-96"}>Title</TableHead>
            <TableHead className={isMobile ? "min-w-[80px]" : "min-w-48"}>Status</TableHead>
            {!isMobile && <TableHead className="min-w-48">Customer</TableHead>}
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow 
              key={task.id}
              task={task} 
              openEditSheet={openEditSheet}
              isMobile={isMobile}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
