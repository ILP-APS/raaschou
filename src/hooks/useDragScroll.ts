
import { useRef, useCallback, useEffect } from 'react';

export const useDragScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || e.button !== 0) return;

    stateRef.current.isDown = true;
    stateRef.current.isDragging = false;
    stateRef.current.startX = e.pageX - container.offsetLeft;
    stateRef.current.scrollLeft = container.scrollLeft;
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.isDown = false;
    stateRef.current.isDragging = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('grabbing');
    }
  }, []);

  // Global mouse move handler
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!stateRef.current.isDown || !containerRef.current) return;

    stateRef.current.isDragging = true;
    containerRef.current.classList.add('grabbing');

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - stateRef.current.startX) * 2;
    containerRef.current.scrollLeft = stateRef.current.scrollLeft - walk;
  }, []);

  // Global mouse up handler
  const handleGlobalMouseUp = useCallback(() => {
    const wasDragging = stateRef.current.isDragging;
    stateRef.current.isDown = false;
    stateRef.current.isDragging = false;

    if (containerRef.current) {
      containerRef.current.classList.remove('grabbing');
    }

    if (wasDragging) {
      setTimeout(() => {
        // Post-drag cleanup if needed
      }, 0);
    }
  }, []);

  // Effect to handle global mouse events
  useEffect(() => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  // Effect to handle click prevention after drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventClickAfterDrag = (e: MouseEvent) => {
      if (stateRef.current.isDragging) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    
    container.addEventListener('click', preventClickAfterDrag, true);

    return () => {
      container.removeEventListener('click', preventClickAfterDrag, true);
    };
  }, []);

  return {
    containerRef,
    handleMouseDown,
    handleMouseLeave,
  };
};
