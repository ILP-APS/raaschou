
import React from "react";
import { Column } from "react-data-grid";
import { FokusarkRow } from "../utils/dataGridUtils";
import EditableCell from "./EditableCell";

/**
 * Get all column definitions with editors configured
 */
export function getColumns(): Column<FokusarkRow, unknown>[] {
  const baseColumns = [
    { 
      key: "nr", 
      name: "Nr.", 
      frozen: true, 
      width: 80,
      headerCellClass: "bg-muted font-medium"
    },
    { 
      key: "navn", 
      name: "Navn", 
      frozen: true, 
      width: 250,
      headerCellClass: "bg-muted font-medium"
    },
    { key: "ansvarlig", name: "Ansvarlig", width: 120 },
    { key: "tilbud", name: "Tilbud", width: 120 },
    { key: "montage", name: "Montage", width: 120 },
    { key: "underleverandor", name: "Underleverandør", width: 120 },
    
    // Editable columns with custom editors
    { 
      key: "montage2", 
      name: "Montage 2", 
      width: 120, 
      editor: EditableCell,
      cellClass: "editable-cell"
    },
    { 
      key: "underleverandor2", 
      name: "Underleverandør 2", 
      width: 120,
      editor: EditableCell,
      cellClass: "editable-cell"
    },
    
    // Continue with non-editable columns
    { key: "materialer", name: "Materialer", width: 120 },
    { key: "projektering", name: "Projektering", width: 120 },
    { key: "produktion", name: "Produktion", width: 120 },
    { key: "montage_3", name: "Montage", width: 120 },
    { key: "projektering_2", name: "Projektering", width: 120 },
    { key: "produktion_realized", name: "Produktion", width: 120 },
    { key: "montage_3_realized", name: "Montage", width: 120 },
    { key: "total", name: "Total", width: 120 },
    { key: "timer_tilbage_1", name: "Projektering", width: 120 },
    { key: "timer_tilbage_2", name: "Timer tilbage", width: 120 },
    
    // More editable columns with custom editors
    { 
      key: "faerdig_pct_ex_montage_nu", 
      name: "Færdig % ex montage nu", 
      width: 160,
      editor: EditableCell,
      cellClass: "editable-cell"
    },
    { 
      key: "faerdig_pct_ex_montage_foer", 
      name: "Færdig % ex montage før", 
      width: 160,
      editor: EditableCell,
      cellClass: "editable-cell"
    },
    
    // Finish with non-editable columns
    { key: "est_timer_ift_faerdig_pct", name: "Est timer ift færdig %", width: 150 },
    { key: "plus_minus_timer", name: "+/- timer", width: 120 },
    { key: "afsat_fragt", name: "Afsat fragt", width: 120 }
  ];
  
  return baseColumns;
}
