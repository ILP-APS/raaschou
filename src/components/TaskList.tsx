
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Clock, 
  HelpCircle, 
  Circle, 
  CheckCircle, 
  Ban,
  MoreVertical 
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// Define types for our task data
type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Done" | "Canceled";
type TaskType = "Documentation" | "Bug" | "Feature";

interface Task {
  id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
}

// Sample task data based on the image
const initialTasks: Task[] = [
  {
    id: "TASK-8782",
    type: "Documentation",
    title: "You can't compress the program without quantifying the open-source SSD...",
    status: "In Progress"
  },
  {
    id: "TASK-7878",
    type: "Documentation",
    title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "Backlog"
  },
  {
    id: "TASK-7839",
    type: "Bug",
    title: "We need to bypass the neural TCP card!",
    status: "Todo"
  },
  {
    id: "TASK-5562",
    type: "Feature",
    title: "The SAS interface is down, bypass the open-source pixel so we can back ...",
    status: "Backlog"
  },
  {
    id: "TASK-8686",
    type: "Feature",
    title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
    status: "Canceled"
  },
  {
    id: "TASK-1280",
    type: "Bug",
    title: "Use the digital TLS panel, then you can transmit the haptic system!",
    status: "Done"
  },
  {
    id: "TASK-7262",
    type: "Feature",
    title: "The UTF8 application is down, parse the neural bandwidth so we can back...",
    status: "Done"
  },
  {
    id: "TASK-1138",
    type: "Feature",
    title: "Generating the driver won't do anything, we need to quantify the 1080p S...",
    status: "In Progress"
  },
  {
    id: "TASK-7184",
    type: "Feature",
    title: "We need to program the back-end THX pixel!",
    status: "Todo"
  }
];

// Helper function to render status icon
const StatusIcon = ({ status }: { status: TaskStatus }) => {
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

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStatus, setEditedStatus] = useState<TaskStatus>("Todo");
  
  const openEditSheet = (task: Task) => {
    setSelectedTask(task);
    setEditedTitle(task.title);
    setEditedStatus(task.status);
  };
  
  const handleSaveTask = () => {
    if (!selectedTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === selectedTask.id 
        ? { ...task, title: editedTitle, status: editedStatus } 
        : task
    );
    
    setTasks(updatedTasks);
    setSelectedTask(null);
    
    toast("Task updated successfully", {
      description: `Task ${selectedTask.id} has been updated.`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-96">Title</TableHead>
              <TableHead className="min-w-48">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Task Sheet */}
      {selectedTask && (
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Task {selectedTask.id}</SheetTitle>
              <SheetDescription>
                Make changes to your task here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value as TaskStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Backlog">Backlog</option>
                  <option value="Done">Done</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={selectedTask.type}
                  readOnly
                  disabled
                  className="w-full"
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" onClick={handleSaveTask}>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
