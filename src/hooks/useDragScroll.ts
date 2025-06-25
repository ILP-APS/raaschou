
import { useState, useEffect, useRef, useCallback } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if CTRL is pressed
    if (!isCtrlPressed || !containerRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Starting drag operation');
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    });

    // Add document event listeners immediately
    const handleDocumentMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      event.preventDefault();
      const deltaX = event.clientX - e.clientX;
      const deltaY = event.clientY - e.clientY;
      
      containerRef.current.scrollLeft = scrollStart.left - deltaX;
      containerRef.current.scrollTop = scrollStart.top - deltaY;
      
      console.log('Dragging - deltaX:', deltaX, 'deltaY:', deltaY);
    };

    const handleDocumentMouseUp = () => {
      console.log('Drag ended');
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDocumentMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleDocumentMouseUp, { capture: true });
    };

    document.addEventListener('mousemove', handleDocumentMouseMove, { capture: true });
    document.addEventListener('mouseup', handleDocumentMouseUp, { capture: true });
  };

  // Keyboard event handlers for CTRL key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !isCtrlPressed) {
        console.log('CTRL pressed');
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && isCtrlPressed) {
        console.log('CTRL released');
        setIsCtrlPressed(false);
        setIsDragging(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCtrlPressed]);

  return {
    containerRef,
    isDragging,
    isCtrlPressed,
    handleMouseDown,
  };
};
