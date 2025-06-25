
import { useRef, useState, useCallback, useEffect } from 'react';

export const useHoldScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Debug function to check container scroll capabilities
  const debugContainer = useCallback(() => {
    if (!containerRef.current) {
      console.log('DEBUG: Container not found');
      return;
    }

    const container = containerRef.current;
    const canScrollHorizontally = container.scrollWidth > container.clientWidth;
    const canScrollVertically = container.scrollHeight > container.clientHeight;
    
    console.log('=== CONTAINER DEBUG INFO ===');
    console.log('Container dimensions:', {
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      scrollWidth: container.scrollWidth,
      scrollHeight: container.scrollHeight,
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight
    });
    console.log('Scroll capabilities:', {
      canScrollHorizontally,
      canScrollVertically,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      maxScrollLeft: container.scrollWidth - container.clientWidth,
      maxScrollTop: container.scrollHeight - container.clientHeight
    });
    console.log('Computed styles:', {
      overflow: getComputedStyle(container).overflow,
      overflowX: getComputedStyle(container).overflowX,
      overflowY: getComputedStyle(container).overflowY,
      width: getComputedStyle(container).width,
      height: getComputedStyle(container).height
    });
    console.log('=============================');
  }, []);

  // Manual scroll test function
  const testManualScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    console.log('Testing manual scroll...');
    const container = containerRef.current;
    const originalScrollLeft = container.scrollLeft;
    
    // Try to scroll 100px to the right
    container.scrollLeft = originalScrollLeft + 100;
    
    setTimeout(() => {
      console.log('Manual scroll test:', {
        originalScrollLeft,
        attemptedScrollLeft: originalScrollLeft + 100,
        actualScrollLeft: container.scrollLeft,
        scrollWorked: container.scrollLeft !== originalScrollLeft
      });
      // Reset scroll position
      container.scrollLeft = originalScrollLeft;
    }, 100);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only prevent dragging on specific interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      console.log('Ignoring drag on interactive element:', target.tagName);
      return;
    }

    if (e.button !== 0) return; // Only handle left mouse button
    
    console.log('Mouse down - starting drag');
    debugContainer(); // Debug on each drag start
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (containerRef.current) {
      setScrollStart({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
      console.log('Scroll start position:', {
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
    }
    
    // Prevent text selection while dragging
    e.preventDefault();
  }, [debugContainer]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;
    
    const newScrollLeft = scrollStart.x + deltaX;
    const newScrollTop = scrollStart.y + deltaY;
    
    // Apply bounds checking
    const maxScrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth;
    const maxScrollTop = containerRef.current.scrollHeight - containerRef.current.clientHeight;
    
    const boundedScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
    const boundedScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

    // Apply scroll
    containerRef.current.scrollLeft = boundedScrollLeft;
    containerRef.current.scrollTop = boundedScrollTop;
    
    console.log('Dragging:', {
      delta: { x: deltaX, y: deltaY },
      intended: { x: newScrollLeft, y: newScrollTop },
      bounded: { x: boundedScrollLeft, y: boundedScrollTop },
      actual: { 
        x: containerRef.current.scrollLeft, 
        y: containerRef.current.scrollTop 
      },
      maxScroll: { x: maxScrollLeft, y: maxScrollTop }
    });
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
    debugContainer,
    testManualScroll,
  };
};
