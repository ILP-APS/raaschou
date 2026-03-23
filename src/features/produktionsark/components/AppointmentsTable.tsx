import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAppointments } from "../hooks/useAppointments";
import { formatWeekDay, getCategoryType, getCategoryRowColor } from "../utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check, Download, RefreshCw } from "lucide-react";
import ExcelJS from "exceljs";

const getCategoryExcelColor = (categoryId: number | null): string | null => {
  if (!categoryId) return null;
  if (categoryId === 1896 || categoryId === 1897) return "FEF3C7";
  if (categoryId === 1920 || categoryId === 1918) return "D1FAE5";
  if (categoryId === 1916) return "FEE2E2";
  return null;
};

const getCategoryPriority = (categoryId: number | null): number => {
  if (!categoryId) return 4;
  if (categoryId === 1896 || categoryId === 1897) return 1;
  if (categoryId === 1920 || categoryId === 1918) return 2;
  if (categoryId === 1916) return 3;
  return 4;
};

const sortAppointments = (appointments: any[]) => {
  return [...appointments].sort((a, b) => {
    const priorityA = getCategoryPriority(a.hnAppointmentCategoryID);
    const priorityB = getCategoryPriority(b.hnAppointmentCategoryID);
    if (priorityA !== priorityB) return priorityA - priorityB;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
};

export function AppointmentsTable() {
  const { data: appointments, isLoading, error, refetch, isFetching } = useAppointments();

  const handleDownloadExcel = async () => {
    if (!appointments) return;
    const sortedAppointments = sortAppointments(appointments);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Aftaler");

    worksheet.columns = [
      { header: "Aftalenr.", key: "appointmentNumber", width: 10 },
      { header: "Kunde", key: "subject", width: 25 },
      { header: "Afl. Værksted", key: "startDate", width: 12 },
      { header: "Sav", key: "sav", width: 8 },
      { header: "CNC", key: "cnc", width: 8 },
      { header: "Nesting", key: "nesting", width: 8 },
      { header: "Kant/Massiv", key: "kantMassiv", width: 12 },
      { header: "Dyvel", key: "dyvel", width: 8 },
      { header: "Finer/Presser", key: "finerPresser", width: 12 },
      { header: "Puds", key: "puds", width: 8 },
      { header: "Lakhal", key: "lakhal", width: 8 },
      { header: "Samle", key: "samle", width: 8 },
      { header: "Ansvar", key: "ansvar", width: 10 },
      { header: "Mont. i byen", key: "category", width: 12 },
      { header: "Uge", key: "endDate", width: 8 },
      { header: "Fast lev. dato", key: "fastLevering", width: 12 },
      { header: "Kommentar", key: "kommentar", width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    for (let col = 1; col <= 17; col++) {
      headerRow.getCell(col).border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" },
      };
    }

    sortedAppointments.forEach((appointment) => {
      const row = worksheet.addRow({
        appointmentNumber: appointment.appointmentNumber,
        subject: appointment.subject,
        startDate: formatWeekDay(appointment.startDate),
        sav: "", cnc: "", nesting: "", kantMassiv: "", dyvel: "",
        finerPresser: "", puds: "", lakhal: "", samle: "", ansvar: "",
        category: getCategoryType(appointment.hnAppointmentCategoryID),
        endDate: formatWeekDay(appointment.endDate),
        fastLevering: appointment.tags?.some((t: string) => t.toLowerCase() === '#fastlevering') ? "✓ FAST" : "",
        kommentar: "",
      });

      const bgColor = getCategoryExcelColor(appointment.hnAppointmentCategoryID);
      for (let col = 1; col <= 17; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: "thin" }, left: { style: "thin" },
          bottom: { style: "thin" }, right: { style: "thin" },
        };
        if (bgColor) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${bgColor}` } };
        }
      }
    });

    for (let col = 18; col <= 26; col++) {
      worksheet.getColumn(col).hidden = true;
    }

    worksheet.pageSetup = {
      paperSize: 8 as unknown as ExcelJS.PaperSize,
      orientation: "landscape",
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      printArea: `A1:Q${sortedAppointments.length + 1}`,
    };

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aftaler-${dateStr}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4 rounded-md bg-destructive/10">
        Fejl ved hentning af aftaler: {error.message}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return <div className="text-muted-foreground p-4 text-center">Ingen åbne aftaler fundet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start gap-2">
        <Button onClick={() => refetch()} variant="outline" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Opdaterer...' : 'Opdater data'}
        </Button>
        <Button onClick={handleDownloadExcel} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download som Excel
        </Button>
      </div>
      <div className="rounded-md border overflow-auto max-h-[80vh]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>Aftalenr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Afl. Værksted</TableHead>
              <TableHead>Sav</TableHead>
              <TableHead>CNC</TableHead>
              <TableHead>Nesting</TableHead>
              <TableHead>Kant/Massiv</TableHead>
              <TableHead>Dyvel</TableHead>
              <TableHead>Finer/Presser</TableHead>
              <TableHead>Puds</TableHead>
              <TableHead>Lakhal</TableHead>
              <TableHead>Samle</TableHead>
              <TableHead>Ansvar</TableHead>
              <TableHead>Mont. i byen</TableHead>
              <TableHead>Uge</TableHead>
              <TableHead>Fast lev. dato</TableHead>
              <TableHead>Kommentar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortAppointments(appointments).map((appointment) => {
              const hasFastLevering = appointment.tags?.some((t: string) => t.toLowerCase() === '#fastlevering');
              const rowColor = getCategoryRowColor(appointment.hnAppointmentCategoryID);
              return (
                <TableRow key={appointment.hnAppointmentID} className={rowColor}>
                  <TableCell className="font-medium">{appointment.appointmentNumber}</TableCell>
                  <TableCell>{appointment.subject}</TableCell>
                  <TableCell>{formatWeekDay(appointment.startDate)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{getCategoryType(appointment.hnAppointmentCategoryID)}</TableCell>
                  <TableCell>{formatWeekDay(appointment.endDate)}</TableCell>
                  <TableCell>
                    {hasFastLevering && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="h-4 w-4" />
                        FAST
                      </span>
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
