
// Generate table data for the Fokusark table
export const generateTableData = () => {
  console.log("Generating sample table data");
  const rows = [];
  for (let i = 1; i <= 10; i++) {
    const row = [];
    // First column (index 0) should be the actual appointment number (no A- prefix)
    // Use the format shown in the API (like "9598")
    row.push(`${9590 + i}`); // Using realistic appointment numbers like 9591, 9592, etc.
    
    // For the second column (index 1), add descriptive project names/subjects
    row.push(`${i % 3 === 0 ? 'Renovation' : i % 2 === 0 ? 'Construction' : 'Installation'} Project ${9590 + i}`);
    
    // For "ansvarlig" column (index 2)
    row.push(`User ${i}`);
    
    // For numeric columns, add some sample values
    for (let j = 3; j <= 15; j++) {
      row.push(`${(Math.random() * 1000).toFixed(2)}`);
    }
    
    // Add remaining columns
    for (let j = 16; j <= 22; j++) {
      row.push(`R${i}C${j}`);
    }
    
    // Add row type flag (every third row is a sub-appointment)
    row.push(i % 3 === 0 ? 'sub-appointment' : 'parent-appointment');
    
    rows.push(row);
  }
  console.log("Generated", rows.length, "sample rows");
  return rows;
};
