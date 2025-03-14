
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Task, TaskStatus, TaskType } from "@/types/task";
import { Trash2 } from "lucide-react";

interface TaskEditSheetProps {
  selectedTask: Task | null;
  editedTitle: string;
  editedStatus: TaskStatus;
  editedType: TaskType;
  setSelectedTask: (task: Task | null) => void;
  setEditedTitle: (title: string) => void;
  setEditedStatus: (status: TaskStatus) => void;
  setEditedType: (type: TaskType) => void;
  handleSaveTask: () => void;
  handleDeleteTask: () => void;
}

export const TaskEditSheet = ({
  selectedTask,
  editedTitle,
  editedStatus,
  editedType,
  setSelectedTask,
  setEditedTitle,
  setEditedStatus,
  setEditedType,
  handleSaveTask,
  handleDeleteTask
}: TaskEditSheetProps) => {
  if (!selectedTask) return null;

  return (
    <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>
            Make changes to your task. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-id">Task ID</Label>
            <Input
              id="task-id"
              value={selectedTask.task_id}
              readOnly
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Textarea 
              id="title" 
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="min-h-[80px] w-full"
              placeholder="Type your task name here."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editedStatus}
              onValueChange={(value) => setEditedStatus(value as TaskStatus)}
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
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Customer</Label>
            <Select
              value={editedType}
              onValueChange={(value) => setEditedType(value as TaskType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nordic Bilsyn">Nordic Bilsyn</SelectItem>
                <SelectItem value="Nordens Forsikringshus">Nordens Forsikringshus</SelectItem>
                <SelectItem value="AutoTorvet">AutoTorvet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="mt-auto">
          <Button 
            variant="secondary" 
            onClick={handleDeleteTask} 
            className="mr-auto gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button 
            type="submit" 
            variant="default" 
            onClick={handleSaveTask}
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
