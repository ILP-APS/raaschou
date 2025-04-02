
// CSS styles for table container - focused on fixing the horizontal scroll
export const tableContainerStyles = `
  /* The parent container that holds the table */
  .table-scroll-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative; /* Create a stacking context */
    z-index: 1; /* Ensure proper stacking */
    border-radius: 0 0 0.5rem 0.5rem; /* Match the bottom corners with the container */
  }

  /* Hide scrollbar when not hovering */
  .table-scroll-container:not(:hover)::-webkit-scrollbar {
    height: 0;
    display: none;
  }
  
  .table-scroll-container:not(:hover) {
    scrollbar-width: none;
  }
  
  /* Show scrollbar on hover */
  .table-scroll-container:hover::-webkit-scrollbar {
    display: block;
    height: 6px;
  }
  
  .table-scroll-container:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  /* Ensure vertical scroll container works correctly */
  .table-vertical-scroll {
    height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }

  /* Main content styles - hard block horizontal scrolling outside the table */
  .main-content {
    overflow-x: hidden !important;
    width: 100%;
    position: relative;
  }
  
  /* Headers and other content should absolutely never scroll horizontally */
  .content-wrapper {
    overflow-x: hidden !important;
    max-width: 100%;
  }
  
  /* Prevent any horizontal scrolling at the page level */
  .page-container {
    overflow-x: hidden !important;
    max-width: 100vw;
  }
  
  /* Ensure sticky columns work correctly with appropriate shadows */
  tr:hover td.sticky {
    background-color: white !important;
  }
  
  /* Add shadow to the right of sticky columns */
  td.sticky:after,
  th.sticky:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(90deg, rgba(0,0,0,0.1), transparent);
    pointer-events: none;
  }
  
  /* Adjust the column widths to ensure proper display */
  table th:nth-child(1) {
    min-width: 100px; /* Width for Nr. column */
  }
  
  table th:nth-child(2) {
    min-width: 200px; /* Width for Navn column */
  }
  
  /* Standard column width for data columns */
  table th:nth-child(n+3) {
    min-width: 120px;
  }
  
  /* Make sure column groups are properly aligned with their columns */
  thead tr:first-child th {
    border-bottom: 1px solid hsl(var(--border));
    text-align: left;
  }
  
  /* Remove vertical borders in header rows */
  thead th {
    border-right: none !important;
  }
  
  /* Remove the vertical separator lines between header groups */
  thead tr:first-child th:not(:first-child)::before {
    display: none;
  }
  
  /* Ensure the grouped headers stay fixed when scrolling */
  thead tr:first-child th[colspan="2"]:first-child {
    position: sticky;
    left: 0;
    z-index: 30;
    background-color: white;
    width: 300px; /* Combined width of Nr. and Navn columns */
  }
  
  /* Fix the table end appearance */
  .table-scroll-container table {
    border-collapse: collapse;
    border-spacing: 0;
    width: max-content;
    min-width: 100%;
  }
  
  /* Ensure the table has proper right border - remove the extra space */
  .table-scroll-container {
    border-right: 1px solid hsl(var(--border));
  }
  
  /* Make the bottom border of the last row visible */
  tbody tr:last-child td {
    border-bottom: 1px solid hsl(var(--border));
  }
  
  /* Add right border to the last cell in each row */
  tr td:last-child,
  tr th:last-child {
    border-right: 1px solid hsl(var(--border));
  }
  
  /* Specifically target the Mont 2 column to ensure no space after it */
  table th:last-child, 
  table td:last-child {
    border-right: 1px solid hsl(var(--border));
  }
  
  /* Fix potential table width issues */
  .table-scroll-container table {
    table-layout: fixed;
    width: fit-content !important;
  }
`;

