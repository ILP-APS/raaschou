
import { useRef, useState, useCallback, useEffect } from 'react';

export const useHoldScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start dragging if clicking on input elements or editable content
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.contentEditable === 'true' || target.closest('[contenteditable="true"]')) {
      return;
    }

    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (containerRef.current) {
      setScrollStart({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
    }
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;

    // Apply scroll with sensitivity multiplier
    const sensitivity = 1;
    containerRef.current.scrollLeft = scrollStart.x + (deltaX * sensitivity);
    containerRef.current.scrollTop = scrollStart.y + (deltaY * sensitivity);
  }, [isDragging, dragStart, scrollStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
      
      // Change cursor to grabbing
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      
      // Reset cursor and user select
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    containerRef,
    isDragging,
    handleMouseDown,
  };
};
