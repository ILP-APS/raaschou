
export type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Done" | "Canceled" | "Bugs";
export type TaskType = "Nordic Bilsyn" | "Nordens Forsikringshus" | "AutoTorvet" | "Generel";

export interface Task {
  id: string;
  task_id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
}
