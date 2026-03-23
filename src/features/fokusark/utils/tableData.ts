
// Generate table data for the Fokusark table
export const generateTableData = (rowCount?: number) => {
  const numRows = rowCount || Math.floor(Math.random() * 16) + 10;
  console.log(`Generating sample table data with ${numRows} rows`);
  
  const rows = [];
  for (let i = 1; i <= numRows; i++) {
    const row = [];
    row.push(`${24480 + i}`);
    
    const projectTypes = [
      'Renovation', 'Construction', 'Installation', 'Repair', 
      'Maintenance', 'Upgrade', 'Remodel', 'Replacement'
    ];
    const subjectTypes = [
      'af badeværelse', 'af køkken', 'af tag', 'af vinduer', 
      'af gulv', 'i lejlighed', 'i villa', 'af udestue'
    ];
    
    const projectType = projectTypes[i % projectTypes.length];
    const subjectType = subjectTypes[Math.floor(Math.random() * subjectTypes.length)];
    row.push(`${projectType} ${subjectType}`);
    
    const users = ['John', 'Anna', 'Peter', 'Maria', 'Thomas', 'Sofie', 'Lars', 'Mette'];
    row.push(`${users[i % users.length]}`);
    
    for (let j = 3; j <= 25; j++) {
      const baseValue = Math.random() * (j % 3 === 0 ? 5000 : 1000);
      if (j >= 14 && j <= 18) {
        const percentage = Math.floor(Math.random() * 100);
        row.push(`${percentage}%`);
      } else {
        row.push(`${baseValue.toFixed(2)}`);
      }
    }
    
    row.push(i % 3 === 0 ? 'sub-appointment' : 'parent-appointment');
    rows.push(row);
  }
  
  console.log(`Generated ${rows.length} sample rows`);
  return rows;
};
