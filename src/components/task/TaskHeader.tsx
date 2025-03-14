
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskHeaderProps {
  openCreateSheet: () => void;
}

export const TaskHeader = ({ openCreateSheet }: TaskHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
      </div>
      <Button 
        onClick={openCreateSheet}
        variant="default"
        size="default"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </Button>
    </div>
  );
};
