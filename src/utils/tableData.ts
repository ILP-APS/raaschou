
/**
 * Generate sample table data for development and testing
 */
export function generateTableData(rows = 10): string[][] {
  console.log(`Generating sample table data with ${rows} rows`);
  
  const data: string[][] = [];
  
  // Generate rows
  for (let i = 0; i < rows; i++) {
    const appointmentNumber = (24481 + i).toString();
    
    // Sample project names
    const projectNames = [
      "Vandskade i køkken",
      "Renovering af badeværelse",
      "Installation af gulvvarme",
      "Udskiftning af vinduer",
      "Nye døre i lejlighed",
      "Reparation af tag",
      "Opsætning af gipsvægge",
      "Isolering af loft",
      "El-installation i køkken",
      "Maling af vægge",
      "Montering af køkkenelementer",
      "Kloakrenovering",
      "Etablering af udestue",
      "Ombygning af erhvervslokale",
      "Nyt badeværelse"
    ];
    
    const projectName = projectNames[i % projectNames.length];
    const userName = `User ${(i % 5) + 1}`;
    
    // Generate a row with random values for demo purposes
    const row: string[] = [
      appointmentNumber,
      projectName,
      userName,
    ];
    
    // Add monetary values (columns 3-5)
    for (let j = 0; j < 3; j++) {
      row.push((Math.random() * 1000).toFixed(2));
    }
    
    // Add more columns with numeric values (columns 6-15)
    for (let j = 0; j < 10; j++) {
      row.push((Math.random() * 1000).toFixed(2));
    }
    
    // Add placeholder values for remaining columns
    for (let j = 16; j < 23; j++) {
      row.push(`R${i+1}C${j+1}`);
    }
    
    // Add row type (parent or sub appointment)
    const isSubAppointment = i % 4 === 0 && i > 0; // Every 4th row (except first) is a sub-appointment
    row.push(isSubAppointment ? 'sub-appointment' : 'parent-appointment');
    
    data.push(row);
  }
  
  console.log(`Generated ${data.length} sample rows`);
  return data;
}
