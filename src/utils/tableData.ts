
// Generate table data for the Fokusark table
export const generateTableData = () => {
  const rows = [];
  for (let i = 1; i <= 50; i++) {
    const row = [];
    for (let j = 1; j <= 22; j++) { // Changed from 23 to 22 (removed extra blank column)
      row.push(`R${i}C${j}`);
    }
    rows.push(row);
  }
  return rows;
};
