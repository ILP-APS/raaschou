// CSS styles for table container - simplified as we're now using a better implementation
export const tableContainerStyles = `
  /* CSS Variables for table layout */
  :root {
    --frozen-col-0-width: 100px;
    --frozen-col-1-width: 250px;
  }
  
  /* Basic table styles */
  .fokusark-table-scroll-container {
    position: relative;
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    max-height: calc(100vh - 220px);
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }
`;
