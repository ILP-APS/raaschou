
// CSS styles for table container - focused on fixing the sticky header and columns
export const tableContainerStyles = `
  /* Main table container */
  .fokusark-table-container {
    position: relative;
    width: 100%;
    overflow: auto;
    max-height: calc(100vh - 220px);
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }
  
  /* Custom scrollbar styling */
  .fokusark-table-container::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  
  .fokusark-table-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  .fokusark-table-container::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  /* Table styling */
  table {
    border-collapse: collapse;
    width: max-content;
    min-width: 100%;
    table-layout: fixed;
  }
  
  /* Make headers sticky at the top */
  table thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  /* First header row - make sticky at top: 0 */
  table thead tr:first-child th {
    position: sticky;
    top: 0;
    z-index: 12;
    background-color: white;
    border-bottom: 1px solid hsl(var(--border));
  }
  
  /* Second header row - make sticky right below first row */
  table thead tr:nth-child(2) th {
    position: sticky;
    top: 41px; /* Height of the first row */
    z-index: 12;
    background-color: white;
    border-bottom: 1px solid hsl(var(--border));
  }

  /* Column width and positioning */
  /* First column - Nr. */
  .fokusark-col-0 {
    position: sticky;
    left: 0;
    min-width: 100px;
    width: 100px;
    z-index: 11;
    background-color: white;
    box-shadow: 1px 0 1px rgba(0,0,0,0.07);
  }
  
  /* Second column - Navn */
  .fokusark-col-1 {
    position: sticky;
    left: 100px;
    min-width: 200px;
    width: 200px;
    z-index: 11;
    background-color: white;
  }
  
  /* Add box shadow to second column when scrolling */
  .is-scrolling .fokusark-col-1::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    pointer-events: none;
    background: linear-gradient(to right, rgba(0,0,0,0.05), transparent);
  }
  
  /* Z-index boost for sticky intersections (corners) */
  thead tr:first-child .fokusark-col-0,
  thead tr:first-child .fokusark-col-1,
  thead tr:nth-child(2) .fokusark-col-0,
  thead tr:nth-child(2) .fokusark-col-1 {
    z-index: 13;
  }
  
  /* Other columns */
  .fokusark-col-n {
    min-width: 120px;
  }
  
  /* Cell styling */
  table th,
  table td {
    padding: 12px;
    text-align: left;
    border-right: none;
    border-bottom: 1px solid hsl(var(--border));
    background-clip: padding-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Row hover effect */
  table tbody tr:hover {
    background-color: hsl(var(--muted)/50);
  }
  
  /* Sub-appointment styling */
  table tbody tr[data-sub-appointment="true"] {
    background-color: hsl(var(--muted)/20);
  }
  
  table tbody tr[data-sub-appointment="true"] td.fokusark-col-0 {
    padding-left: 20px;
  }
  
  /* Dark mode support */
  .dark table thead tr th,
  .dark .fokusark-col-0,
  .dark .fokusark-col-1 {
    background-color: hsl(var(--background));
  }
  
  /* Add visual borders to clearly delineate fixed regions */
  .fokusark-col-1 {
    border-right: 1px solid hsl(var(--border));
  }
  
  table thead tr:nth-child(2) th {
    border-bottom: 2px solid hsl(var(--border));
  }
  
  /* Firefox-specific fixes */
  @-moz-document url-prefix() {
    table thead tr:first-child th {
      top: 0;
    }
    
    table thead tr:nth-child(2) th {
      top: 41px;
    }
    
    thead tr:first-child .fokusark-col-0,
    thead tr:first-child .fokusark-col-1,
    thead tr:nth-child(2) .fokusark-col-0,
    thead tr:nth-child(2) .fokusark-col-1 {
      z-index: 13;
    }
  }
`;
