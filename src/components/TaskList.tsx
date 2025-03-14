
import React from "react";
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
const tasks: Task[] = [
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
              <TableRow key={task.id}>
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
