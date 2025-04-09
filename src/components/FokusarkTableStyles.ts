
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
  .fokusark-table-container table {
    border-collapse: separate;
    border-spacing: 0;
    width: max-content;
    min-width: 100%;
  }
  
  /* Headers styling */
  .fokusark-table-container thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .fokusark-table-container thead tr:first-child th {
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: white;
  }
  
  .fokusark-table-container thead tr:nth-child(2) th {
    position: sticky;
    top: 41px; /* Height of the first row */
    z-index: 20;
    background-color: white;
  }

  /* First column - fixed */
  .fokusark-col-0 {
    position: sticky !important;
    left: 0;
    z-index: 15;
    background-color: white;
    width: 100px;
    min-width: 100px;
  }
  
  /* Second column - fixed */
  .fokusark-col-1 {
    position: sticky !important;
    left: 100px; /* Width of first column */
    z-index: 15;
    background-color: white;
    width: 200px;
    min-width: 200px;
  }
  
  /* Fixed column styling for header intersection */
  thead tr:first-child th.fokusark-col-0,
  thead tr:first-child th.fokusark-col-1 {
    z-index: 30;
  }
  
  thead tr:nth-child(2) th.fokusark-col-0,
  thead tr:nth-child(2) th.fokusark-col-1 {
    z-index: 30;
  }
  
  /* Shadow effect for scrolling state */
  .is-scrolling .fokusark-col-1::after {
    content: '';
    position: absolute;
    top: 0;
    right: -5px;
    bottom: 0;
    width: 5px;
    pointer-events: none;
    box-shadow: 2px 0 5px rgba(0,0,0,0.15);
  }
  
  /* Other columns */
  .fokusark-col-n {
    min-width: 120px;
  }
  
  /* Cell styling */
  .fokusark-table-container th,
  .fokusark-table-container td {
    padding: 12px;
    text-align: left;
    border-right: 1px solid transparent;
    border-bottom: 1px solid hsl(var(--border));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Row hover effect */
  .fokusark-table-container tbody tr:hover {
    background-color: hsl(var(--muted)/50);
  }
  
  /* Sub-appointment styling */
  .fokusark-table-container tbody tr[data-sub-appointment="true"] {
    background-color: hsl(var(--muted)/20);
  }
  
  .fokusark-table-container tbody tr[data-sub-appointment="true"] td.fokusark-col-0 {
    padding-left: 20px;
  }
  
  /* Add visual borders to clearly delineate fixed regions */
  .fokusark-col-1 {
    border-right: 1px solid hsl(var(--border));
  }
  
  /* Dark mode support */
  .dark .fokusark-table-container thead tr th,
  .dark .fokusark-table-container .fokusark-col-0,
  .dark .fokusark-table-container .fokusark-col-1 {
    background-color: hsl(var(--background));
  }
  
  /* Firefox-specific fixes */
  @-moz-document url-prefix() {
    .fokusark-table-container thead tr:first-child th {
      top: 0;
    }
    
    .fokusark-table-container thead tr:nth-child(2) th {
      top: 41px;
    }
  }
`;
