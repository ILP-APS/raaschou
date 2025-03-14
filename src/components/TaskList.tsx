
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/api/taskApi";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { TaskHeader } from "./task/TaskHeader";
import { TaskTable } from "./task/TaskTable";
import { TaskEditSheet } from "./task/TaskEditSheet";
import { TaskCreateSheet } from "./task/TaskCreateSheet";

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
  
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });
  
  if (isLoading) {
    return <div>Loading tasks...</div>;
  }
  
  if (error) {
    return <div>Error loading tasks: {(error as Error).message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <TaskHeader openCreateSheet={() => setIsCreateOpen(true)} />
      
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
