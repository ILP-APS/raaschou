import ExcelJS from "exceljs";
import { Project } from "../types/project";
import { parseProjectHierarchy, flattenHierarchy } from "./projectHierarchy";
import { extractInitials } from "./formatUtils";

interface ColumnDef {
  header: string;
  key: keyof Project | "responsible_initials";
  width: number;
  format?: "currency" | "number" | "percent";
}

const COLUMNS: ColumnDef[] = [
  { header: "Projekt ID", key: "id", width: 12 },
  { header: "Projekt Navn/Emne", key: "name", width: 32 },
  { header: "Ansvarlig", key: "responsible_initials", width: 10 },

  // Tilbud
  { header: "Tilbudsbeløb i alt", key: "offer_amount", width: 16, format: "currency" },
  { header: "Heraf Montage", key: "assembly_amount", width: 14, format: "currency" },
  { header: "Heraf Underlev.", key: "subcontractor_amount", width: 14, format: "currency" },
  { header: "Manuel Montage", key: "manual_assembly_amount", width: 14, format: "currency" },
  { header: "Manuel Underlev.", key: "manual_subcontractor_amount", width: 14, format: "currency" },
  { header: "Beregnet Materiale", key: "materials_amount", width: 16, format: "currency" },

  // Estimeret
  { header: "Est. timer Design", key: "hours_estimated_projecting", width: 12, format: "number" },
  { header: "Est. timer Prod", key: "hours_estimated_production", width: 12, format: "number" },
  { header: "Est. timer Mont.", key: "hours_estimated_assembly", width: 12, format: "number" },

  // Realiseret
  { header: "Brugte timer Design", key: "hours_used_projecting", width: 13, format: "number" },
  { header: "Brugte timer Prod", key: "hours_used_production", width: 13, format: "number" },
  { header: "Brugte timer Mont.", key: "hours_used_assembly", width: 13, format: "number" },
  { header: "Total timer brugt", key: "hours_used_total", width: 13, format: "number" },

  // Design
  { header: "Timer tilbage Design", key: "hours_remaining_projecting", width: 14, format: "number" },

  // Produktions stadie
  { header: "Færdig% (NU)", key: "completion_percentage_manual", width: 12, format: "percent" },
  { header: "Færdig% (FØR)", key: "completion_percentage_previous", width: 12, format: "percent" },
  { header: "Est. timer ift. Færdig%", key: "hours_estimated_by_completion", width: 16, format: "number" },
  { header: "Fremdrift", key: "plus_minus_hours", width: 12, format: "number" },
  { header: "Timer tilbage Prod", key: "hours_remaining_production", width: 14, format: "number" },

  // Montage
  { header: "Timer tilbage Mont.", key: "hours_remaining_assembly", width: 14, format: "number" },
  { header: "Afsat Fragt", key: "allocated_freight_amount", width: 14, format: "currency" },
];

const FORMAT_MAP: Record<string, string> = {
  currency: '#,##0" kr"',
  number: '#,##0.0',
  percent: '0"%"',
};

export const exportFokusarkToExcel = async (
  projects: Project[],
  minOfferAmount: number
): Promise<void> => {
  const hierarchies = parseProjectHierarchy(projects, minOfferAmount).map((h) => ({
    ...h,
    isExpanded: true,
  }));
  const rows = flattenHierarchy(hierarchies);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Fokusark", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 1 }],
  });

  worksheet.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" },
  };
  headerRow.alignment = { vertical: "middle", wrapText: true };
  headerRow.height = 30;
  for (let col = 1; col <= COLUMNS.length; col++) {
    headerRow.getCell(col).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }

  rows.forEach((project) => {
    const rowData: Record<string, any> = {};
    COLUMNS.forEach((c) => {
      if (c.key === "responsible_initials") {
        rowData[c.key] = extractInitials(project.responsible_person_initials);
      } else if (c.key === "id" || c.key === "name") {
        rowData[c.key] = (project as any)[c.key] ?? "";
      } else {
        const v = (project as any)[c.key];
        rowData[c.key] = v === null || v === undefined ? null : Number(v);
      }
    });
    const row = worksheet.addRow(rowData);

    COLUMNS.forEach((c, idx) => {
      const cell = row.getCell(idx + 1);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (c.format) {
        cell.numFmt = FORMAT_MAP[c.format];
      }
    });
  });

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
