
import React from "react";

interface FokusarkTableHeaderProps {
  columnCount: number;
}

const FokusarkTableHeader: React.FC<FokusarkTableHeaderProps> = ({ columnCount }) => {
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
        return "Column 7";
      case 7:
        return "Column 8";
      case 8:
        return "Est 1";
      case 9:
        return "Est 2";
      case 10:
        return "Est 3";
      case 11:
        return "Est 4";
      case 12:
        return "Est 5";
      case 13:
        return "Real 1";
      case 14:
        return "Real 2";
      case 15:
        return "Real 3";
      case 16:
        return "Real 4";
      case 17:
        return "Real 5";
      case 18:
        return "Timer tilbage";
      case 19:
        return "Prod 1";
      case 20:
        return "Prod 2";
      case 21:
        return "Prod 3";
      case 22:
        return "Prod 4";
      case 23:
        return "Prod 5";
      case 24:
        return "Prod 6";
      case 25:
        return "Mont 1";
      case 26:
        return "Mont 2";
      default:
        return `Column ${index + 1}`;
    }
  };

  // Function to get column class based on index
  const getColumnClass = (index: number): string => {
    let classes = "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap sticky top-0 bg-background border-b";
    
    // Add sticky left positioning for first two columns only
    if (index === 0) {
      classes += " sticky left-0 z-20 bg-white"; // Solid white background
    } else if (index === 1) {
      classes += " sticky left-[100px] z-20 bg-white"; // Solid white background
    }
    
    return classes;
  };

  // Function to get column group information
  const getColumnGroup = (index: number): { name: string, colSpan: number } | null => {
    if (index === 0) {
      return { name: "Aftale", colSpan: 3 }; // Group for Nr, Navn, Ansvarlig
    } else if (index === 3) {
      return { name: "TILBUD", colSpan: 5 }; // Group for Tilbud, Montage, Underleverandør, Column 7, Column 8
    } else if (index === 8) {
      return { name: "Estimeret", colSpan: 5 }; // Group for Est 1-5
    } else if (index === 13) {
      return { name: "Realiseret", colSpan: 5 }; // Group for Real 1-5
    } else if (index === 18) {
      return { name: "Timer tilbage", colSpan: 1 }; // Group for Timer tilbage
    } else if (index === 19) {
      return { name: "Produktion", colSpan: 6 }; // Group for Prod 1-6
    } else if (index === 25) {
      return { name: "Montage", colSpan: 2 }; // Group for Mont 1-2
    }
    return null;
  };

  // Generate column groups for the first header row
  const renderColumnGroups = () => {
    const groups = [];
    let currentIndex = 0;

    while (currentIndex < columnCount) {
      const group = getColumnGroup(currentIndex);
      
      if (group) {
        // Add a grouped header cell
        groups.push(
          <th 
            key={`group-${currentIndex}`} 
            colSpan={group.colSpan}
            className={`px-4 py-2 text-center text-sm font-medium text-foreground uppercase tracking-wider whitespace-nowrap bg-muted/30 border-b 
              ${currentIndex === 0 ? 'sticky left-0 z-20 bg-white' : ''}`}
          >
            {group.name}
          </th>
        );
        currentIndex += group.colSpan;
      } else {
        // Add an empty header cell
        groups.push(
          <th 
            key={`group-${currentIndex}`} 
            className="px-4 py-2 bg-muted/30 border-b"
          >
            &nbsp;
          </th>
        );
        currentIndex += 1;
      }
    }
    
    return groups;
  };

  return (
    <thead className="bg-muted/50">
      {/* Column group row */}
      <tr>
        {renderColumnGroups()}
      </tr>
      {/* Regular header row */}
      <tr>
        {Array.from({ length: columnCount }, (_, index) => (
          <th 
            key={index} 
            className={getColumnClass(index)}
          >
            {getColumnName(index)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default FokusarkTableHeader;
