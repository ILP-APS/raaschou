
// Generate table data for the Fokusark table
export const generateTableData = (rowCount?: number) => {
  // Allow specifying the number of rows, default to a random number between 10 and 25
  // Increased the min rows to ensure we have a reasonable number of rows by default
  const numRows = rowCount || Math.floor(Math.random() * 16) + 10;
  console.log(`Generating sample table data with ${numRows} rows`);
  
  const rows = [];
  for (let i = 1; i <= numRows; i++) {
    const row = [];
    // First column (index 0) should be the actual appointment number (no A- prefix)
    // Use the format shown in the API (like "9598")
    row.push(`${24480 + i}`); // Using realistic appointment numbers
    
    // For the second column (index 1), add descriptive project names/subjects
    const projectTypes = [
      'Renovation', 'Construction', 'Installation', 'Repair', 
      'Maintenance', 'Upgrade', 'Remodel', 'Replacement'
    ];
    
    const subjectTypes = [
      'af badeværelse', 'af køkken', 'af tag', 'af vinduer', 
      'af gulv', 'i lejlighed', 'i villa', 'af udestue'
    ];
    
    // Create more varied and realistic subjects
    const projectType = projectTypes[i % projectTypes.length];
    const subjectType = subjectTypes[Math.floor(Math.random() * subjectTypes.length)];
    row.push(`${projectType} ${subjectType}`);
    
    // For "ansvarlig" column (index 2)
    const users = ['John', 'Anna', 'Peter', 'Maria', 'Thomas', 'Sofie', 'Lars', 'Mette'];
    row.push(`${users[i % users.length]}`);
    
    // Generate more columns for the expanded Budget Group D (need at least 22 columns in total)
    for (let j = 3; j <= 25; j++) {
      // Make some values larger to test cell formatting
      const baseValue = Math.random() * (j % 3 === 0 ? 5000 : 1000);
      
      // For columns representing Group D, use percentage format
      if (j >= 14 && j <= 18) {
        // Generate percentages for Group D columns
        const percentage = Math.floor(Math.random() * 100);
        row.push(`${percentage}%`);
      } else {
        row.push(`${baseValue.toFixed(2)}`);
      }
    }
    
    // Add row type flag (every third row is a sub-appointment)
    row.push(i % 3 === 0 ? 'sub-appointment' : 'parent-appointment');
    
    rows.push(row);
  }
  
  console.log(`Generated ${rows.length} sample rows`);
  return rows;
};
