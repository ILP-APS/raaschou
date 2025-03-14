
import React, { useState, useEffect } from "react";
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
  MoreVertical,
  Plus
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Done" | "Canceled";
type TaskType = "Documentation" | "Bug" | "Feature";

interface Task {
  id: string;
  task_id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
}

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

async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  return data as Task[];
}

export function TaskList() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStatus, setEditedStatus] = useState<TaskStatus>("Todo");
  const [editedType, setEditedType] = useState<TaskType>("Bug");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("Todo");
  const [newTaskType, setNewTaskType] = useState<TaskType>("Bug");
  
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });
  
  const createMutation = useMutation({
    mutationFn: async (newTask: { task_id: string, title: string, status: TaskStatus, type: TaskType }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateOpen(false);
      setNewTaskTitle("");
      toast("Task created successfully");
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast("Error creating task", {
        description: error.message,
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, task }: { id: string, task: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
      toast("Task updated successfully");
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast("Error updating task", {
        description: error.message,
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
      toast("Task deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast("Error deleting task", {
        description: error.message,
      });
    }
  });
  
  const openEditSheet = (task: Task) => {
    setSelectedTask(task);
    setEditedTitle(task.title);
    setEditedStatus(task.status);
    setEditedType(task.type);
  };
  
  const handleSaveTask = () => {
    if (!selectedTask) return;
    
    updateMutation.mutate({
      id: selectedTask.id,
      task: {
        title: editedTitle,
        status: editedStatus,
        type: editedType
      }
    });
  };
  
  const handleDeleteTask = () => {
    if (!selectedTask) return;
    deleteMutation.mutate(selectedTask.id);
  };
  
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast("Task title is required");
      return;
    }
    
    // Generate a new task ID
    const taskPrefix = 'TASK-';
    const taskNumber = Math.floor(1000 + Math.random() * 9000);
    const newTaskId = `${taskPrefix}${taskNumber}`;
    
    createMutation.mutate({
      task_id: newTaskId,
      title: newTaskTitle,
      status: newTaskStatus,
      type: newTaskType
    });
  };
  
  if (isLoading) {
    return <div>Loading tasks...</div>;
  }
  
  if (error) {
    return <div>Error loading tasks: {(error as Error).message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
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
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Task Sheet */}
      {selectedTask && (
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
                <Label htmlFor="type">Type</Label>
                <Select
                  value={editedType}
                  onValueChange={(value) => setEditedType(value as TaskType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-auto">
              <Button variant="destructive" onClick={handleDeleteTask} className="mr-auto">
                Delete
              </Button>
              <Button type="submit" onClick={handleSaveTask}>
                Save changes
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Create Task Sheet */}
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
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-type">Type</Label>
              <Select
                value={newTaskType}
                onValueChange={(value) => setNewTaskType(value as TaskType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" onClick={handleCreateTask}>
              Create Task
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
