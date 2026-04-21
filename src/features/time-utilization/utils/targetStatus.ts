export type TargetStatus = "above" | "near" | "below";

const NEAR_MARGIN = 0.10;

export function getTargetStatus(utilization: number, target: number): TargetStatus {
  if (utilization >= target) return "above";
  if (utilization >= target - NEAR_MARGIN) return "near";
  return "below";
}

export function statusTextClass(status: TargetStatus): string {
  switch (status) {
    case "above": return "text-green-600";
    case "near": return "text-amber-600";
    case "below": return "text-red-600";
  }
}

export function formatDeviation(utilization: number, target: number): string {
  const diff = (utilization - target) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}%`;
}
