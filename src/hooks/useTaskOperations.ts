import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Task, TaskStatus, TaskType } from "@/types/task";
import { createTask, updateTask, deleteTask } from "@/api/taskApi";
import { toast } from "sonner";

export const useTaskOperations = () => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedStatus, setEditedStatus] = useState<TaskStatus>("Todo");
  const [editedType, setEditedType] = useState<TaskType>("Nordic Bilsyn");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("Todo");
  const [newTaskType, setNewTaskType] = useState<TaskType>("Nordic Bilsyn");
  
  const createMutation = useMutation({
    mutationFn: async (newTask: { task_id: string, title: string, status: TaskStatus, type: TaskType }) => {
      return createTask(newTask);
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
      return updateTask(id, task);
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
      return deleteTask(id);
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

  return {
    selectedTask,
    setSelectedTask,
    editedTitle,
    setEditedTitle,
    editedStatus,
    setEditedStatus,
    editedType,
    setEditedType,
    isCreateOpen,
    setIsCreateOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskStatus,
    setNewTaskStatus,
    newTaskType,
    setNewTaskType,
    openEditSheet,
    handleSaveTask,
    handleDeleteTask,
    handleCreateTask
  };
};
