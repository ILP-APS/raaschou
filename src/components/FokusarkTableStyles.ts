
export const tableContainerStyles = `
  .fokusark-table-scroll-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px);
  }

  .fokusark-table-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .frozen-columns {
    position: sticky;
    left: 0;
    z-index: 20;
    background: hsl(var(--background));
    border-right: 1px solid hsl(var(--border));
    min-width: fit-content;
    overflow: hidden;
  }

  .frozen-columns.with-shadow {
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  .frozen-table {
    min-width: fit-content;
  }

  .fokusark-table {
    flex: 1;
    min-width: 0;
  }

  .col-0 {
    width: 60px;
    min-width: 60px;
    max-width: 60px;
  }

  .col-1 {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  .col-scrollable {
    width: 150px;
    min-width: 150px;
    max-width: 150px;
  }

  .sticky-first-row {
    position: sticky;
    top: 0;
    z-index: 10;
    background: hsl(var(--background));
  }
`;
