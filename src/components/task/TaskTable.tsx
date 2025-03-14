
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

interface TaskTableProps {
  tasks: Task[];
  openEditSheet: (task: Task) => void;
}

export const TaskTable = ({ tasks, openEditSheet }: TaskTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-96">Title</TableHead>
            <TableHead className="min-w-48">Status</TableHead>
            <TableHead className="min-w-48">Type</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow 
              key={task.id}
              task={task} 
              openEditSheet={openEditSheet} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
