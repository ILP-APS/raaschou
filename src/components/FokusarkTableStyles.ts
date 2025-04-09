
// CSS styles for table container - focused on fixing the sticky header
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
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
  }
  
  /* Make thead sticky at the top */
  table thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
  }
  
  /* First header row - make sticky at top: 0 */
  table thead tr:first-child th {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
    border-bottom: 1px solid hsl(var(--border));
  }
  
  /* Second header row - make sticky right below first row */
  table thead tr:nth-child(2) th {
    position: sticky;
    top: 41px; /* Height of the first row */
    z-index: 2;
    background-color: white;
    border-bottom: 1px solid hsl(var(--border));
  }
  
  /* Sticky left columns */
  table th:first-child,
  table td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: white;
  }
  
  table th:nth-child(2),
  table td:nth-child(2) {
    position: sticky;
    left: 100px; /* Width of first column */
    z-index: 1;
    background-color: white;
  }
  
  /* Corner cells - need highest z-index */
  table thead tr:first-child th:first-child,
  table thead tr:first-child th:nth-child(2),
  table thead tr:nth-child(2) th:first-child,
  table thead tr:nth-child(2) th:nth-child(2) {
    z-index: 3;
  }
  
  /* Firefox-specific fixes */
  @-moz-document url-prefix() {
    table thead tr:first-child th {
      top: 0;
      position: sticky;
    }
    table thead tr:nth-child(2) th {
      top: 41px;
      position: sticky;
    }
  }
  
  /* Column width adjustments */
  table th:nth-child(1), 
  table td:nth-child(1) {
    min-width: 100px;
    width: 100px;
  }
  
  table th:nth-child(2),
  table td:nth-child(2) {
    min-width: 200px;
    width: 200px;
  }
  
  table th:nth-child(n+3),
  table td:nth-child(n+3) {
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
  }
  
  /* Add shadow to sticky columns */
  table th:nth-child(2)::after,
  table td:nth-child(2)::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    pointer-events: none;
    background: linear-gradient(to right, rgba(0,0,0,0.05), transparent);
  }
  
  /* Row hover effect */
  table tbody tr:hover {
    background-color: hsl(var(--muted)/50);
  }
  
  /* Sub-appointment styling */
  table tbody tr[data-sub-appointment="true"] {
    background-color: hsl(var(--muted)/20);
  }
  
  table tbody tr[data-sub-appointment="true"] td:first-child {
    padding-left: 20px;
  }
`;
