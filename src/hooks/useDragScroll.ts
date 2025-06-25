
import { useState, useRef, useCallback } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track initial positions and movement
  const startPositionRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const hasMovedRef = useRef(false);
  
  // Movement threshold to distinguish click from drag (in pixels)
  const DRAG_THRESHOLD = 5;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (containerRef.current && e.button === 0) { // Only handle left mouse button
      const container = containerRef.current;
      
      // Record initial positions
      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop
      };
      
      setIsMouseDown(true);
      hasMovedRef.current = false;
      
      // Change cursor to indicate potential drag
      container.style.cursor = 'grabbing';

      // Global mouse move handler
      const handleDocumentMouseMove = (event: MouseEvent) => {
        if (!containerRef.current || !isMouseDown) return;
        
        const deltaX = event.clientX - startPositionRef.current.x;
        const deltaY = event.clientY - startPositionRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Check if movement exceeds threshold
        if (distance > DRAG_THRESHOLD && !hasMovedRef.current) {
          hasMovedRef.current = true;
          setIsDragging(true);
          
          // Prevent text selection during drag
          document.body.style.userSelect = 'none';
          document.body.style.webkitUserSelect = 'none';
        }
        
        // Only scroll if we've determined this is a drag
        if (hasMovedRef.current) {
          event.preventDefault();
          
          const newScrollLeft = startPositionRef.current.scrollLeft - deltaX;
          const newScrollTop = startPositionRef.current.scrollTop - deltaY;
          
          containerRef.current.scrollLeft = newScrollLeft;
          containerRef.current.scrollTop = newScrollTop;
        }
      };

      // Global mouse up handler
      const handleDocumentMouseUp = (event: MouseEvent) => {
        setIsMouseDown(false);
        setIsDragging(false);
        
        // Restore cursor and text selection
        if (containerRef.current) {
          containerRef.current.style.cursor = '';
        }
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        // If no significant movement occurred, allow the click to propagate
        if (!hasMovedRef.current) {
          // This was a click, not a drag - let it bubble up normally
          // The original event will have already propagated
        }
        
        // Clean up listeners
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        
        // Reset tracking
        hasMovedRef.current = false;
      };

      // Attach global listeners
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      
      // Only prevent default and stop propagation if we determine this is a drag
      // For now, let the event continue and we'll handle prevention in mousemove
    }
  }, [isMouseDown]);

  // Handle mouse leave to reset state if user drags outside container
  const handleMouseLeave = useCallback(() => {
    if (isMouseDown) {
      setIsMouseDown(false);
      setIsDragging(false);
      hasMovedRef.current = false;
      
      // Restore styles
      if (containerRef.current) {
        containerRef.current.style.cursor = '';
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  }, [isMouseDown]);

  return {
    containerRef,
    isDragging,
    isMouseDown,
    handleMouseDown,
    handleMouseLeave,
  };
};
