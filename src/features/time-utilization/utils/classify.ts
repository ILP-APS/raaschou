import type { Registration, Settings } from "../hooks/useTimeUtilization";

export type Bucket = "fakturerbar" | "intern" | "fravaer";

export function classify(reg: Registration, settings: Settings): Bucket {
  if (reg.category === "sickness" || reg.category === "vacation" || reg.category === "private") {
    return "fravaer";
  }
  if (reg.category === "internal") return "intern";
  if (reg.hn_appointment_category_id != null
      && settings.intern_appointment_category_ids.includes(reg.hn_appointment_category_id)) {
    return "intern";
  }
  if (reg.hn_work_type_id != null
      && settings.intern_work_type_ids.includes(reg.hn_work_type_id)) {
    return "intern";
  }
  return "fakturerbar";
}

export interface EmployeeSummary {
  hn_user_id: number;
  employee_name: string;
  fakturerbar: number;
  intern: number;
  fravaer: number;
  total: number;
  utilization: number;
}

export function summarize(
  registrations: Registration[],
  employees: { hn_user_id: number; employee_name: string }[],
  settings: Settings
): EmployeeSummary[] {
  const byUser = new Map<number, EmployeeSummary>();
  for (const emp of employees) {
    byUser.set(emp.hn_user_id, {
      hn_user_id: emp.hn_user_id,
      employee_name: emp.employee_name,
      fakturerbar: 0,
      intern: 0,
      fravaer: 0,
      total: 0,
      utilization: 0,
    });
  }
  for (const reg of registrations) {
    const row = byUser.get(reg.hn_user_id);
    if (!row) continue;
    const bucket = classify(reg, settings);
    row[bucket] += Number(reg.duration);
    row.total += Number(reg.duration);
  }
  for (const row of byUser.values()) {
    row.utilization = row.total > 0 ? row.fakturerbar / row.total : 0;
  }
  return Array.from(byUser.values());
}
