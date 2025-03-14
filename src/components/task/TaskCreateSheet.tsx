
import React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TaskStatus, TaskType } from "@/types/task";

interface TaskCreateSheetProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (isOpen: boolean) => void;
  newTaskTitle: string;
  newTaskStatus: TaskStatus;
  newTaskType: TaskType;
  setNewTaskTitle: (title: string) => void;
  setNewTaskStatus: (status: TaskStatus) => void;
  setNewTaskType: (type: TaskType) => void;
  handleCreateTask: () => void;
}

export const TaskCreateSheet = ({
  isCreateOpen,
  setIsCreateOpen,
  newTaskTitle,
  newTaskStatus,
  newTaskType,
  setNewTaskTitle,
  setNewTaskStatus,
  setNewTaskType,
  handleCreateTask
}: TaskCreateSheetProps) => {
  return (
    <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Task</SheetTitle>
          <SheetDescription>
            Create a new task for your project.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-title">Title</Label>
            <Textarea 
              id="new-title" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="min-h-[80px] w-full"
              placeholder="Type your task name here."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-status">Status</Label>
            <Select
              value={newTaskStatus}
              onValueChange={(value) => setNewTaskStatus(value as TaskStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Backlog">Backlog</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
                <SelectItem value="Bugs">Bugs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-type">Customer</Label>
            <Select
              value={newTaskType}
              onValueChange={(value) => setNewTaskType(value as TaskType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nordic Bilsyn">Nordic Bilsyn</SelectItem>
                <SelectItem value="Nordens Forsikringshus">Nordens Forsikringshus</SelectItem>
                <SelectItem value="AutoTorvet">AutoTorvet</SelectItem>
                <SelectItem value="Generel">Generel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button 
            type="submit" 
            variant="default" 
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
