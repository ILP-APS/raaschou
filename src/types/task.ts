
export type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Done" | "Canceled";
export type TaskType = "Nordic Bilsyn" | "Nordens Forsikringshus" | "AutoTorvet";

export interface Task {
  id: string;
  task_id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
}
