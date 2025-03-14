
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/api/taskApi";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { TaskHeader } from "./task/TaskHeader";
import { TaskTable } from "./task/TaskTable";
import { TaskEditSheet } from "./task/TaskEditSheet";
import { TaskCreateSheet } from "./task/TaskCreateSheet";
import { TaskFilter } from "./task/TaskFilter";
import { Task } from "@/types/task";
import { useIsMobile } from "@/hooks/use-mobile";

export function TaskList() {
  const {
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
  } = useTaskOperations();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  
  const { data: allTasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });
  
  // Apply filters
  const tasks = allTasks.filter((task: Task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    return matchesStatus && matchesType;
  });
  
  if (isLoading) {
    return <div className="flex justify-center p-4">Loading tasks...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center p-4 text-destructive">Error loading tasks: {(error as Error).message}</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <TaskHeader openCreateSheet={() => setIsCreateOpen(true)} />
      
      <TaskFilter 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />
      
      <TaskTable tasks={tasks} openEditSheet={openEditSheet} />
      
      <TaskEditSheet
        selectedTask={selectedTask}
        editedTitle={editedTitle}
        editedStatus={editedStatus}
        editedType={editedType}
        setSelectedTask={setSelectedTask}
        setEditedTitle={setEditedTitle}
        setEditedStatus={setEditedStatus}
        setEditedType={setEditedType}
        handleSaveTask={handleSaveTask}
        handleDeleteTask={handleDeleteTask}
      />
      
      <TaskCreateSheet
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        newTaskTitle={newTaskTitle}
        newTaskStatus={newTaskStatus}
        newTaskType={newTaskType}
        setNewTaskTitle={setNewTaskTitle}
        setNewTaskStatus={setNewTaskStatus}
        setNewTaskType={setNewTaskType}
        handleCreateTask={handleCreateTask}
      />
    </div>
  );
}
