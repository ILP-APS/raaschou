
// Generate table data for the Fokusark table
export const generateTableData = () => {
  const rows = [];
  for (let i = 1; i <= 50; i++) {
    const row = [];
    for (let j = 1; j <= 23; j++) { // Changed from 24 to 23 (removed Prod 6)
      row.push(`R${i}C${j}`);
    }
    rows.push(row);
  }
  return rows;
};
