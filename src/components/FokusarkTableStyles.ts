
// CSS styles for table container - focused on fixing the horizontal scroll
export const tableContainerStyles = `
  /* The parent container that holds the table */
  .table-scroll-container {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative; /* Create a stacking context */
    z-index: 1; /* Ensure proper stacking */
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
`;
