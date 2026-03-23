import { getISOWeek, getISODay } from "date-fns";

export function formatWeekDay(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return `${getISOWeek(date)}-${getISODay(date)}`;
}

export function getCategoryType(categoryId: number): "Afhent" | "Mont." | "" {
  if (categoryId === 1896) return "Afhent";
  if ([1897, 1920, 1918].includes(categoryId)) return "Mont.";
  return "";
}

export function getCategoryRowColor(categoryId: number): string {
  if (categoryId === 1896 || categoryId === 1897) return "bg-yellow-100";
  if (categoryId === 1920 || categoryId === 1918) return "bg-green-100";
  if (categoryId === 1916) return "bg-red-100";
  return "";
}
