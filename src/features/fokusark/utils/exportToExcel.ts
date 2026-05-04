import ExcelJS from "exceljs";
import { Project } from "../types/project";
import { parseProjectHierarchy, flattenHierarchy } from "./projectHierarchy";
import { extractInitials } from "./formatUtils";

type GroupKey = "aftale" | "tilbud" | "estimeret" | "realiseret" | "design" | "produktion" | "montage";

interface ColumnDef {
  header: string;
  key: keyof Project | "responsible_initials";
  width: number;
  format?: "currency" | "number" | "percent";
  group: GroupKey;
  manual?: boolean;
  conditional?: "fremdrift";
  groupEnd?: boolean; // thick right border = end of group
}

const COLUMNS: ColumnDef[] = [
  { header: "Projekt ID", key: "id", width: 12, group: "aftale" },
  { header: "Projekt Navn/Emne", key: "name", width: 32, group: "aftale" },
  { header: "Ansvarlig", key: "responsible_initials", width: 10, group: "aftale", groupEnd: true },

  // Tilbud
  { header: "Tilbudsbeløb i alt", key: "offer_amount", width: 16, format: "currency", group: "tilbud" },
  { header: "Heraf Montage", key: "assembly_amount", width: 14, format: "currency", group: "tilbud" },
  { header: "Heraf Underlev.", key: "subcontractor_amount", width: 14, format: "currency", group: "tilbud" },
  { header: "Manuel Montage", key: "manual_assembly_amount", width: 14, format: "currency", group: "tilbud", manual: true },
  { header: "Manuel Underlev.", key: "manual_subcontractor_amount", width: 14, format: "currency", group: "tilbud", manual: true },
  { header: "Beregnet Materiale", key: "materials_amount", width: 16, format: "currency", group: "tilbud", groupEnd: true },

  // Estimeret
  { header: "Est. timer Design", key: "hours_estimated_projecting", width: 12, format: "number", group: "estimeret" },
  { header: "Est. timer Prod", key: "hours_estimated_production", width: 12, format: "number", group: "estimeret" },
  { header: "Est. timer Mont.", key: "hours_estimated_assembly", width: 12, format: "number", group: "estimeret", groupEnd: true },

  // Realiseret
  { header: "Brugte timer Design", key: "hours_used_projecting", width: 13, format: "number", group: "realiseret" },
  { header: "Brugte timer Prod", key: "hours_used_production", width: 13, format: "number", group: "realiseret" },
  { header: "Brugte timer Mont.", key: "hours_used_assembly", width: 13, format: "number", group: "realiseret" },
  { header: "Total timer brugt", key: "hours_used_total", width: 13, format: "number", group: "realiseret", groupEnd: true },

  // Design
  { header: "Timer tilbage Design", key: "hours_remaining_projecting", width: 14, format: "number", group: "design", groupEnd: true },

  // Produktions stadie
  { header: "Færdig% (NU)", key: "completion_percentage_manual", width: 12, format: "percent", group: "produktion" },
  { header: "Færdig% (FØR)", key: "completion_percentage_previous", width: 12, format: "percent", group: "produktion" },
  { header: "Est. timer ift. Færdig%", key: "hours_estimated_by_completion", width: 16, format: "number", group: "produktion" },
  { header: "Fremdrift", key: "plus_minus_hours", width: 12, format: "number", group: "produktion", conditional: "fremdrift" },
  { header: "Timer tilbage Prod", key: "hours_remaining_production", width: 14, format: "number", group: "produktion", groupEnd: true },

  // Montage
  { header: "Timer tilbage Mont.", key: "hours_remaining_assembly", width: 14, format: "number", group: "montage" },
  { header: "Afsat Fragt", key: "allocated_freight_amount", width: 14, format: "currency", group: "montage", groupEnd: true },
];

const FORMAT_MAP: Record<string, string> = {
  currency: '#,##0" kr"',
  number: '#,##0.0',
  percent: '0%',
};

// Group display labels and pastel ARGB fills (matching UI tokens)
const GROUP_META: Record<GroupKey, { label: string; fill: string; subFill: string }> = {
  aftale:     { label: "Aftale",            fill: "FFE5E7EB", subFill: "FFF3F4F6" }, // muted
  tilbud:     { label: "Tilbud",            fill: "FFF1F5F9", subFill: "FFF8FAFC" }, // slate
  estimeret:  { label: "Estimeret",         fill: "FFFEF3C7", subFill: "FFFEF9E7" }, // amber
  realiseret: { label: "Realiseret",        fill: "FFD1FAE5", subFill: "FFECFDF5" }, // emerald
  design:     { label: "Design",            fill: "FFE0E7FF", subFill: "FFEEF2FF" }, // indigo
  produktion: { label: "Produktions stadie", fill: "FFEDE9FE", subFill: "FFF5F3FF" }, // violet
  montage:    { label: "Montage",           fill: "FFE0F2FE", subFill: "FFF0F9FF" }, // sky
};

const MANUAL_FILL = "FFDBEAFE"; // blue-100-ish (matches bg-blue-50 family)

const thinBorder = { style: "thin" as const, color: { argb: "FFD1D5DB" } };
const thickBorder = { style: "medium" as const, color: { argb: "FF6B7280" } };

export const exportFokusarkToExcel = async (
  projects: Project[]
): Promise<void> => {
  const hierarchies = parseProjectHierarchy(projects).map((h) => ({
    ...h,
    isExpanded: true,
  }));
  const rows = flattenHierarchy(hierarchies);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Fokusark", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 2 }],
  });

  // Set column widths
  worksheet.columns = COLUMNS.map((c) => ({ key: c.key, width: c.width }));

  // ===== Row 1: Group headers =====
  const groupRow = worksheet.getRow(1);
  let colIdx = 1;
  // Build group ranges
  const groupRanges: { group: GroupKey; start: number; end: number }[] = [];
  COLUMNS.forEach((c, i) => {
    const last = groupRanges[groupRanges.length - 1];
    if (last && last.group === c.group) {
      last.end = i + 1;
    } else {
      groupRanges.push({ group: c.group, start: i + 1, end: i + 1 });
    }
  });
  groupRanges.forEach((g) => {
    const cell = groupRow.getCell(g.start);
    cell.value = GROUP_META[g.group].label;
    cell.font = { bold: true, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_META[g.group].fill } };
    if (g.end > g.start) {
      worksheet.mergeCells(1, g.start, 1, g.end);
    }
    // Borders for the merged range
    for (let c = g.start; c <= g.end; c++) {
      const ce = groupRow.getCell(c);
      ce.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GROUP_META[g.group].fill } };
      ce.border = {
        top: thinBorder,
        bottom: thinBorder,
        left: c === g.start ? thickBorder : thinBorder,
        right: c === g.end ? thickBorder : thinBorder,
      };
    }
  });
  groupRow.height = 22;

  // ===== Row 2: Column headers =====
  const headerRow = worksheet.getRow(2);
  COLUMNS.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: c.manual ? MANUAL_FILL : GROUP_META[c.group].subFill },
    };
    cell.border = {
      top: thinBorder,
      bottom: thickBorder,
      left: thinBorder,
      right: c.groupEnd ? thickBorder : thinBorder,
    };
  });
  headerRow.height = 36;

  // ===== Data rows =====
  rows.forEach((project) => {
    const row = worksheet.addRow({});
    COLUMNS.forEach((c, idx) => {
      const cell = row.getCell(idx + 1);
      let value: any;
      if (c.key === "responsible_initials") {
        value = extractInitials(project.responsible_person_initials);
      } else if (c.key === "id" || c.key === "name") {
        value = (project as any)[c.key] ?? "";
      } else {
        const v = (project as any)[c.key];
        if (v === null || v === undefined) {
          value = null;
        } else {
          // Convert percent values stored as 0-100 into Excel-native 0-1
          value = c.format === "percent" ? Number(v) / 100 : Number(v);
        }
      }
      cell.value = value;

      if (c.format) {
        cell.numFmt = FORMAT_MAP[c.format];
      }

      // Alignment
      if (c.key === "id" || c.key === "name") {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else if (c.key === "responsible_initials") {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }

      // Background: manual columns blue, otherwise none for data rows
      if (c.manual) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: MANUAL_FILL } };
      }

      // Conditional formatting on Fremdrift
      if (c.conditional === "fremdrift" && typeof value === "number" && !isNaN(value)) {
        let bg: string | null = null;
        if (value > 15) bg = "FFD1FAE5"; // green-100
        else if (value >= -10 && value <= 15) bg = "FFFEF3C7"; // yellow-100
        else if (value < -10) bg = "FFFEE2E2"; // red-100
        if (bg) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        }
      }

      cell.border = {
        top: thinBorder,
        bottom: thinBorder,
        left: thinBorder,
        right: c.groupEnd ? thickBorder : thinBorder,
      };
    });
  });

  // Auto-filter on header row
  worksheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: COLUMNS.length },
  };

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Fokusark-${dateStr}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};
