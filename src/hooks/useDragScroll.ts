
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
      
      const container = containerRef.current;
      
      // Enhanced debugging
      console.log('=== DRAG INITIATED ===');
      console.log('Container scroll dimensions:', {
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
        canScrollHorizontally: container.scrollWidth > container.clientWidth,
        canScrollVertically: container.scrollHeight > container.clientHeight
      });
      console.log('Mouse position:', { x: e.clientX, y: e.clientY });
      
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
        
        console.log('Dragging - deltaX:', deltaX, 'deltaY:', deltaY, 'newScrollLeft:', newScrollLeft, 'actualScrollLeft:', containerRef.current.scrollLeft);
      };

      // Global mouse up handler
      const handleDocumentMouseUp = () => {
        console.log('=== DRAG ENDED ===');
        console.log('Final scroll position:', {
          scrollLeft: containerRef.current?.scrollLeft,
          scrollTop: containerRef.current?.scrollTop
        });
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
