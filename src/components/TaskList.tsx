
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  HelpCircle, 
  Circle, 
  CheckCircle, 
  Ban,
  ArrowUp, 
  ArrowRight, 
  ArrowDown,
  MoreVertical 
} from "lucide-react";
import { Button } from "./ui/button";

// Define types for our task data
type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Done" | "Canceled";
type TaskPriority = "High" | "Medium" | "Low";
type TaskType = "Documentation" | "Bug" | "Feature";

interface Task {
  id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

// Sample task data based on the image
const tasks: Task[] = [
  {
    id: "TASK-8782",
    type: "Documentation",
    title: "You can't compress the program without quantifying the open-source SSD...",
    status: "In Progress",
    priority: "Medium"
  },
  {
    id: "TASK-7878",
    type: "Documentation",
    title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "Backlog",
    priority: "Medium"
  },
  {
    id: "TASK-7839",
    type: "Bug",
    title: "We need to bypass the neural TCP card!",
    status: "Todo",
    priority: "High"
  },
  {
    id: "TASK-5562",
    type: "Feature",
    title: "The SAS interface is down, bypass the open-source pixel so we can back ...",
    status: "Backlog",
    priority: "Medium"
  },
  {
    id: "TASK-8686",
    type: "Feature",
    title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
    status: "Canceled",
    priority: "Medium"
  },
  {
    id: "TASK-1280",
    type: "Bug",
    title: "Use the digital TLS panel, then you can transmit the haptic system!",
    status: "Done",
    priority: "High"
  },
  {
    id: "TASK-7262",
    type: "Feature",
    title: "The UTF8 application is down, parse the neural bandwidth so we can back...",
    status: "Done",
    priority: "High"
  },
  {
    id: "TASK-1138",
    type: "Feature",
    title: "Generating the driver won't do anything, we need to quantify the 1080p S...",
    status: "In Progress",
    priority: "Medium"
  },
  {
    id: "TASK-7184",
    type: "Feature",
    title: "We need to program the back-end THX pixel!",
    status: "Todo",
    priority: "Low"
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

// Helper function to render priority icon
const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  switch (priority) {
    case "High":
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    case "Medium":
      return <ArrowRight className="h-4 w-4 text-gray-500" />;
    case "Low":
      return <ArrowDown className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

// Helper function to get task type badge
const TypeBadge = ({ type }: { type: TaskType }) => {
  const styles = {
    Documentation: "bg-purple-100 text-purple-800",
    Bug: "bg-red-100 text-red-800",
    Feature: "bg-blue-100 text-blue-800"
  };

  return (
    <Badge 
      variant="outline" 
      className={`font-normal ${styles[type]}`}
    >
      {type}
    </Badge>
  );
};

export function TaskList() {
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
              <TableHead className="w-12 px-2">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-48">
                <div className="flex items-center">
                  Task
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="min-w-96">
                <div className="flex items-center">
                  Title
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="min-w-48">
                <div className="flex items-center">
                  Status
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="min-w-48">
                <div className="flex items-center">
                  Priority
                  <Button variant="ghost" size="icon" className="ml-1 h-5 w-5">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="px-2">
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{task.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <TypeBadge type={task.type} />
                    <span className="line-clamp-1">{task.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={task.status} />
                    <span>{task.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PriorityIcon priority={task.priority} />
                    <span>{task.priority}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
