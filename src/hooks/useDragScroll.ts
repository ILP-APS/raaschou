
import { useState, useEffect, useRef } from "react";

export const useDragScroll = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag scrolling handlers
  const handleMouseDown = (e: React.MouseEvent, editingCell: string | null) => {
    if (isCtrlPressed && !editingCell) {
      e.preventDefault();
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
    if (isDragging && containerRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      containerRef.current.scrollLeft = scrollStart.left - deltaX;
      containerRef.current.scrollTop = scrollStart.top - deltaY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Keyboard event handlers for CTRL key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        setIsCtrlPressed(false);
        setIsDragging(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
