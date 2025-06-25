
import { useState, useRef } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Master Event Controller Logic
    if (e.ctrlKey && containerRef.current) {
      // CTRL is pressed - initiate drag and prevent event propagation
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Starting drag operation with CTRL');
      setIsDragging(true);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startScrollLeft = containerRef.current.scrollLeft;
      const startScrollTop = containerRef.current.scrollTop;

      // Global mouse move handler
      const handleDocumentMouseMove = (event: MouseEvent) => {
        if (!containerRef.current) return;
        
        event.preventDefault();
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        
        containerRef.current.scrollLeft = startScrollLeft - deltaX;
        containerRef.current.scrollTop = startScrollTop - deltaY;
        
        console.log('Dragging - deltaX:', deltaX, 'deltaY:', deltaY);
      };

      // Global mouse up handler
      const handleDocumentMouseUp = () => {
        console.log('Drag ended');
        setIsDragging(false);
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };

      // Attach global listeners
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }
    // If CTRL is not pressed, do nothing - let the event propagate to child handlers
  };

  return {
    containerRef,
    isDragging,
    handleMouseDown,
  };
};
