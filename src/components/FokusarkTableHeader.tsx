
import React from "react";

interface FokusarkTableHeaderProps {
  columnCount: number;
  isFrozen?: boolean;
}

const FokusarkTableHeader: React.FC<FokusarkTableHeaderProps> = ({ columnCount, isFrozen = false }) => {
  // Function to get column name based on index
  const getColumnName = (index: number): string => {
    switch (index) {
      case 0:
        return "Nr.";
      case 1:
        return "Navn";
      case 2:
        return "Ansvarlig";
      case 3:
        return "Tilbud";
      case 4:
        return "Montage";
      case 5:
        return "Underleverandør";
      case 6:
        return "Montage 2";
      case 7:
        return "Underleverandør 2";
      case 8:
        return "Materialer";
      case 9:
        return "Projektering";
      case 10:
        return "Produktion";
      case 11:
        return "Montage";
      case 12:
        return "Projektering";
      case 13:
        return "Produktion";
      case 14:
        return "Montage";
      case 15:
        return "Total";
      case 16:
        return "Projektering"; 
      case 17:
        return "Timer tilbage"; 
      case 18:
        return "Færdig % ex montage nu"; 
      case 19:
        return "Færdig % ex montage før"; 
      case 20:
        return "Est timer ift færdig %"; 
      case 21:
        return "+/- timer"; 
      case 22:
        return "Afsat fragt";
      default:
        return `Column ${index + 1}`;
    }
  };

  // Function to get column group information
  const getColumnGroup = (index: number): { name: string, colSpan: number } | null => {
    if (index === 0) {
      return { name: "Aftale", colSpan: 2 }; // Covers Nr and Navn
    } else if (index === 2) {
      return { name: "Ansvarlig", colSpan: 1 }; // Separate group for Ansvarlig
    } else if (index === 3) {
      return { name: "TILBUD", colSpan: 5 }; // Group for Tilbud, Montage, Underleverandør, Montage 2, Underleverandør 2
    } else if (index === 8) {
      return { name: "Estimeret", colSpan: 4 }; // 4 columns
    } else if (index === 12) {
      return { name: "Realiseret", colSpan: 4 }; // 4 columns: Projektering, Produktion, Montage, Total
    } else if (index === 16) {
      return { name: "Timer tilbage", colSpan: 1 }; // Just one column: Projektering
    } else if (index === 17) {
      return { name: "Produktion", colSpan: 5 }; // Timer tilbage + the 4 metrics in new order
    } else if (index === 22) {
      return { name: "Transport", colSpan: 1 }; // Transport group
    }
    return null;
  };

  // Get the appropriate CSS class for the column
  const getColumnClass = (index: number): string => {
    if (index === 0) return "col-0";
    if (index === 1) return "col-1";
    return "col-scrollable";
  };

  // Generate column groups for the first header row
  const renderColumnGroups = () => {
    if (isFrozen) {
      // For frozen columns, just render the first group
      return [
        <th 
          key="group-frozen" 
          colSpan={2}
          className="group-header"
        >
          Aftale
        </th>
      ];
    } else {
      // For the main table, render all groups except the first one
      const groups = [];
      let currentIndex = 2; // Start from the third column (index 2)
      
      while (currentIndex < columnCount + 2) { // +2 because we're skipping the first two columns
        const group = getColumnGroup(currentIndex);
        
        if (group) {
          groups.push(
            <th 
              key={`group-${currentIndex}`} 
              colSpan={group.colSpan}
              className="group-header"
            >
              {group.name}
            </th>
          );
          currentIndex += group.colSpan;
        } else {
          groups.push(
            <th 
              key={`group-${currentIndex}`}
              className="group-header"
            >
              &nbsp;
            </th>
          );
          currentIndex += 1;
        }
      }
      
      return groups;
    }
  };

  // Render the column headers
  const renderColumnHeaders = () => {
    if (isFrozen) {
      // For the frozen section, only render the first two columns
      return [0, 1].map(index => (
        <th key={index} className={`${getColumnClass(index)} column-header`}>
          {getColumnName(index)}
        </th>
      ));
    } else {
      // For the main table, render all columns except the first two
      const headers = [];
      for (let i = 2; i < columnCount + 2; i++) {
        headers.push(
          <th key={i} className={`${getColumnClass(i)} column-header`}>
            {getColumnName(i)}
          </th>
        );
      }
      return headers;
    }
  };

  return (
    <thead>
      {/* Column group row */}
      <tr>
        {renderColumnGroups()}
      </tr>
      {/* Regular header row */}
      <tr>
        {renderColumnHeaders()}
      </tr>
    </thead>
  );
};

export default FokusarkTableHeader;
