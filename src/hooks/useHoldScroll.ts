
import { useRef, useState, useCallback, useEffect } from 'react';

export const useHoldScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only prevent dragging on specific interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return;
    }

    if (e.button !== 0) return; // Only handle left mouse button
    
    console.log('Mouse down - starting drag');
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (containerRef.current) {
      setScrollStart({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
      console.log('Scroll start:', containerRef.current.scrollLeft, containerRef.current.scrollTop);
    }
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;

    // Apply scroll
    containerRef.current.scrollLeft = scrollStart.x + deltaX;
    containerRef.current.scrollTop = scrollStart.y + deltaY;
    
    console.log('Dragging - delta:', deltaX, deltaY, 'new scroll:', containerRef.current.scrollLeft);
  }, [isDragging, dragStart, scrollStart]);

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up - ending drag');
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
