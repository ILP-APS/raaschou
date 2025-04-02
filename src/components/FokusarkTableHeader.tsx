
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
      return { name: "Økonomi", colSpan: 3 }; // Group for Tilbud, Montage, Underleverandør
    }
    return null;
  };

  // Get column width based on index for proper alignment
  const getColumnWidth = (index: number): string => {
    if (index === 0) return "100px"; // Nr. column
    if (index === 1) return "200px"; // Navn column
    return "auto";
  };

  // Generate column groups for the first header row
  const renderColumnGroups = () => {
    const groups = [];
    let currentIndex = 0;
    let leftPosition = 0;

    while (currentIndex < columnCount) {
      const group = getColumnGroup(currentIndex);
      
      if (group) {
        // Calculate sticky positioning for the Aftale group
        let style: React.CSSProperties = {};
        if (currentIndex === 0) {
          style = { 
            position: 'sticky',
            left: 0,
            zIndex: 30,
            backgroundColor: 'white',
            width: '300px' // Explicitly set width to match Nr(100px) + Navn(200px) columns
          };
        }
        
        // Add a grouped header cell
        groups.push(
          <th 
            key={`group-${currentIndex}`} 
            colSpan={group.colSpan}
            className="px-4 py-2 text-center text-sm font-medium text-foreground uppercase tracking-wider whitespace-nowrap bg-muted/30 border-b"
            style={style}
          >
            {group.name}
          </th>
        );
        
        // Update for next iteration
        currentIndex += group.colSpan;
        leftPosition += group.colSpan * 100; // Approximate width calculation
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
        leftPosition += 100; // Approximate width
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
            style={{ minWidth: getColumnWidth(index) }}
          >
            {getColumnName(index)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default FokusarkTableHeader;
