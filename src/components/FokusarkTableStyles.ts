
// CSS styles for table container - focused on fixing the sticky header and columns
export const tableContainerStyles = `
  /* CSS Variables for table layout */
  :root {
    --frozen-col-0-width: 100px;
    --frozen-col-1-width: 250px;
  }
  
  /* Main container */
  .fokusark-table-scroll-container {
    position: relative;
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    max-height: calc(100vh - 220px);
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }
  
  /* Table container with frozen columns */
  .fokusark-table-wrapper {
    display: flex;
    position: relative;
    min-width: 100%;
  }
  
  /* Main table styling */
  .fokusark-table {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    width: 100%;
    margin-left: calc(var(--frozen-col-0-width) + var(--frozen-col-1-width));
  }
  
  /* Frozen columns container */
  .frozen-columns {
    position: sticky;
    left: 0;
    top: 0;
    width: calc(var(--frozen-col-0-width) + var(--frozen-col-1-width));
    z-index: 20;
    background-color: hsl(var(--background));
    height: 100%;
    overflow: hidden;
  }
  
  .frozen-columns.with-shadow {
    box-shadow: 6px 0 5px -5px rgba(0,0,0,0.15);
  }
  
  .dark .frozen-columns.with-shadow {
    box-shadow: 6px 0 5px -5px rgba(0,0,0,0.3);
  }
  
  /* Frozen table styling */
  .frozen-table {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    width: 100%;
  }
  
  /* Column widths */
  .col-0 {
    width: var(--frozen-col-0-width);
    min-width: var(--frozen-col-0-width);
    max-width: var(--frozen-col-0-width);
  }
  
  .col-1 {
    width: var(--frozen-col-1-width);
    min-width: var(--frozen-col-1-width);
    max-width: var(--frozen-col-1-width);
  }
  
  .col-scrollable {
    min-width: 120px;
  }
  
  /* Headers styling - ensure they stay fixed at the top */
  .fokusark-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: hsl(var(--background));
  }
  
  /* Frozen table headers need higher z-index and left position */
  .frozen-table thead th {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 30;
    background-color: hsl(var(--background));
  }
  
  /* Two-row header styling */
  .group-header {
    height: 41px; /* Fixed height for group header */
  }
  
  .column-header {
    height: 41px; /* Fixed height for column header */
  }
  
  /* Cell styling */
  .fokusark-table th,
  .fokusark-table td,
  .frozen-table th,
  .frozen-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid hsl(var(--border));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Row hover effect - synchronized between tables */
  .fokusark-table tbody tr:hover,
  .frozen-table tbody tr:hover {
    background-color: hsl(var(--muted)/50);
  }
  
  /* Ensure row heights match in both tables */
  .frozen-table tr,
  .fokusark-table tr {
    height: 48px; /* Fixed height for all rows */
  }
  
  /* Sub-appointment styling */
  [data-sub-appointment="true"] {
    background-color: hsl(var(--muted)/20);
  }
  
  [data-sub-appointment="true"] td:first-child {
    padding-left: 20px;
  }
  
  /* Fix Firefox scrollbar issues */
  @-moz-document url-prefix() {
    .fokusark-table-scroll-container {
      scrollbar-width: thin;
    }
  }
  
  /* Custom scrollbar styling for other browsers */
  .fokusark-table-scroll-container::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  
  .fokusark-table-scroll-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  .fokusark-table-scroll-container::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  /* Dark mode support */
  .dark .frozen-columns {
    background-color: hsl(var(--background));
  }
  
  .dark .fokusark-table thead th,
  .dark .frozen-table thead th {
    background-color: hsl(var(--background));
  }
  
  .dark .fokusark-table-scroll-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .dark .fokusark-table-scroll-container::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;
