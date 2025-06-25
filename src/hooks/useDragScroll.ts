
import { useState, useRef } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Start drag operation on any mouse down (no CTRL required)
    if (containerRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      const container = containerRef.current;
      setIsDragging(true);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startScrollLeft = container.scrollLeft;
      const startScrollTop = container.scrollTop;

      // Global mouse move handler
      const handleDocumentMouseMove = (event: MouseEvent) => {
        if (!containerRef.current) return;
        
        event.preventDefault();
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        
        const newScrollLeft = startScrollLeft - deltaX;
        const newScrollTop = startScrollTop - deltaY;
        
        containerRef.current.scrollLeft = newScrollLeft;
        containerRef.current.scrollTop = newScrollTop;
      };

      // Global mouse up handler
      const handleDocumentMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };

      // Attach global listeners
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }
  };

  return {
    containerRef,
    isDragging,
    handleMouseDown,
  };
};
