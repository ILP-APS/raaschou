import type { Registration, Settings, AppointmentCategory, AppointmentWorktype } from "../hooks/useTimeUtilization";
import { classify } from "./classify";

export interface BillableRow {
  hn_appointment_id: number | null;
  subject: string;
  category_name: string | null;
  duration: number;
}

export interface InternalRow {
  hn_appointment_id: number | null;
  subject: string;
  reason: string;
  duration: number;
}

export interface AbsenceRow {
  label: string;
  duration: number;
}

export interface Breakdown {
  billable: BillableRow[];
  internal: InternalRow[];
  absence: AbsenceRow[];
  totals: { billable: number; internal: number; absence: number; total: number };
}

export function buildBreakdown(
  registrations: Registration[],
  settings: Settings,
  categories: AppointmentCategory[],
  worktypes: AppointmentWorktype[],
): Breakdown {
  const catById = new Map(categories.map((c) => [c.hn_appointment_category_id, c.name]));
  const wtById = new Map(worktypes.map((w) => [w.hn_work_type_id, w.name]));

  const billableMap = new Map<number | string, BillableRow>();
  const internalMap = new Map<number | string, InternalRow>();
  const absence: Record<string, number> = { sickness: 0, vacation: 0, private: 0 };

  for (const reg of registrations) {
    const bucket = classify(reg, settings);

    if (bucket === "fravaer") {
      absence[reg.category] = (absence[reg.category] || 0) + Number(reg.duration);
      continue;
    }

    const key = reg.hn_appointment_id ?? `no-appt-${reg.category}`;
    const subject = reg.appointment_subject ?? "(uden aftale)";

    if (bucket === "fakturerbar") {
      const existing = billableMap.get(key);
      if (existing) {
        existing.duration += Number(reg.duration);
      } else {
        billableMap.set(key, {
          hn_appointment_id: reg.hn_appointment_id,
          subject,
          category_name: reg.hn_appointment_category_id != null ? (catById.get(reg.hn_appointment_category_id) ?? null) : null,
          duration: Number(reg.duration),
        });
      }
    } else {
      const reason = getInternalReason(reg, settings, catById, wtById);
      const existing = internalMap.get(key);
      if (existing) {
        existing.duration += Number(reg.duration);
      } else {
        internalMap.set(key, {
          hn_appointment_id: reg.hn_appointment_id,
          subject,
          reason,
          duration: Number(reg.duration),
        });
      }
    }
  }

  const billable = Array.from(billableMap.values()).sort((a, b) => b.duration - a.duration);
  const internal = Array.from(internalMap.values()).sort((a, b) => b.duration - a.duration);
  const absenceRows: AbsenceRow[] = [
    { label: "Sygdom", duration: absence.sickness || 0 },
    { label: "Ferie", duration: absence.vacation || 0 },
    { label: "Fri", duration: absence.private || 0 },
  ];

  const billableTotal = billable.reduce((s, r) => s + r.duration, 0);
  const internalTotal = internal.reduce((s, r) => s + r.duration, 0);
  const absenceTotal = absenceRows.reduce((s, r) => s + r.duration, 0);

  return {
    billable,
    internal,
    absence: absenceRows,
    totals: {
      billable: billableTotal,
      internal: internalTotal,
      absence: absenceTotal,
      total: billableTotal + internalTotal + absenceTotal,
    },
  };
}

function getInternalReason(
  reg: Registration,
  settings: Settings,
  catById: Map<number, string>,
  wtById: Map<number, string>,
): string {
  if (reg.category === "internal") return "Intern aftale";
  if (reg.hn_appointment_category_id != null
      && settings.intern_appointment_category_ids.includes(reg.hn_appointment_category_id)) {
    const name = catById.get(reg.hn_appointment_category_id) ?? `ID ${reg.hn_appointment_category_id}`;
    return `Aftalekategori: ${name}`;
  }
  if (reg.hn_work_type_id != null
      && settings.intern_work_type_ids.includes(reg.hn_work_type_id)) {
    const name = wtById.get(reg.hn_work_type_id) ?? `ID ${reg.hn_work_type_id}`;
    return `Worktype: ${name}`;
  }
  return "Ukendt grund";
}
