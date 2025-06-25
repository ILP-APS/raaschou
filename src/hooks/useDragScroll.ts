
import { useState, useEffect, useRef, useCallback } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Document-level mouse move handler for dragging
  const handleDocumentMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      containerRef.current.scrollLeft = scrollStart.left - deltaX;
      containerRef.current.scrollTop = scrollStart.top - deltaY;
      
      console.log('Dragging - deltaX:', deltaX, 'deltaY:', deltaY);
    }
  }, [isDragging, dragStart, scrollStart]);

  // Document-level mouse up handler for dragging
  const handleDocumentMouseUp = useCallback(() => {
    if (isDragging) {
      console.log('Drag ended');
      setIsDragging(false);
    }
  }, [isDragging]);

  // Drag scrolling handlers - now works with any child element
  const handleMouseDown = (e: React.MouseEvent, editingCell: string | null) => {
    // Only start drag if CTRL is pressed and no cell is being edited
    if (isCtrlPressed && !editingCell) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Starting drag from element:', e.target);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      if (containerRef.current) {
        setScrollStart({
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // This is now handled by document event listener during drag
    // Keep this for compatibility but it won't be the primary handler
    if (isDragging && containerRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      containerRef.current.scrollLeft = scrollStart.left - deltaX;
      containerRef.current.scrollTop = scrollStart.top - deltaY;
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      console.log('Mouse up on container');
      setIsDragging(false);
    }
  };

  const handleMouseLeave = () => {
    // Don't stop dragging on mouse leave - let document handler take over
    console.log('Mouse left container, continuing drag if active');
  };

  // Set up document-level event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      console.log('Adding document event listeners for drag');
      document.addEventListener('mousemove', handleDocumentMouseMove, { capture: true });
      document.addEventListener('mouseup', handleDocumentMouseUp, { capture: true });
      
      return () => {
        console.log('Removing document event listeners for drag');
        document.removeEventListener('mousemove', handleDocumentMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleDocumentMouseUp, { capture: true });
      };
    }
  }, [isDragging, handleDocumentMouseMove, handleDocumentMouseUp]);

  // Keyboard event handlers for CTRL key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        console.log('CTRL pressed');
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        console.log('CTRL released');
        setIsCtrlPressed(false);
        setIsDragging(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    containerRef,
    isDragging,
    isCtrlPressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
