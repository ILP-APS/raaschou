
// Generate table data for the Fokusark table
export const generateTableData = () => {
  console.log("Generating sample table data");
  const rows = [];
  for (let i = 1; i <= 10; i++) {
    const row = [];
    for (let j = 1; j <= 23; j++) {
      // For the first column (index 0), use 'A-123' format
      if (j === 1) {
        row.push(`A-${100 + i}`);
      } 
      // For the second column (index 1), add some sample text
      else if (j === 2) {
        row.push(`Sample Project ${i}`);
      }
      // For "ansvarlig" column (index 2)
      else if (j === 3) {
        row.push(`User ${i}`);
      }
      // For numeric columns, add some sample values
      else if ([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(j)) {
        row.push(`${(Math.random() * 1000).toFixed(2)}`);
      } 
      else {
        row.push(`R${i}C${j}`);
      }
    }
    
    // Add row type flag (every third row is a sub-appointment)
    row.push(i % 3 === 0 ? 'sub-appointment' : 'parent-appointment');
    
    rows.push(row);
  }
  console.log("Generated", rows.length, "sample rows");
  return rows;
};
