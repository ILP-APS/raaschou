
// Generate table data for the Fokusark table
export const generateTableData = () => {
  const rows = [];
  for (let i = 1; i <= 50; i++) {
    const row = [];
    for (let j = 1; j <= 23; j++) { // Changed from 22 to 23 (added Mont 2 back)
      row.push(`R${i}C${j}`);
    }
    rows.push(row);
  }
  return rows;
};
