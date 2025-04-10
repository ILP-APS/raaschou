
// Generate table data for the Fokusark table
export const generateTableData = () => {
  console.log("Generating sample table data");
  const rows = [];
  
  // Sample subjects for more realistic data
  const sampleSubjects = [
    "Vandskade i køkken",
    "Renovering af badeværelse",
    "Installation af gulvvarme",
    "Udskiftning af vinduer",
    "Nye døre i lejlighed",
    "Reparation af tag",
    "Opsætning af gipsvægge",
    "Isolering af loft",
    "El-installation i køkken",
    "Maling af vægge"
  ];
  
  for (let i = 1; i <= 10; i++) {
    const row = [];
    // First column (index 0) should be the actual appointment number (no A- prefix)
    // Use the format shown in the API (like "24482")
    row.push(`${24480 + i}`); // Using realistic appointment numbers like 24481, 24482, etc.
    
    // For the second column (index 1), add descriptive project names/subjects from the sample list
    row.push(sampleSubjects[i - 1]);
    
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
