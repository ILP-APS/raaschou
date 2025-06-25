
import { useRef, useCallback, useEffect } from 'react';

export const useDragScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, scrollLeft: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start on left-click
    if (e.button !== 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Start the drag process
    isDraggingRef.current = true;
    container.classList.add('grabbing');
    startPosRef.current = {
      x: e.clientX,
      scrollLeft: container.scrollLeft,
    };

    // Prevent default behavior like text selection
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('grabbing');
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    // Prevent default browser drag behavior
    e.preventDefault();

    const dx = e.clientX - startPosRef.current.x;
    containerRef.current.scrollLeft = startPosRef.current.scrollLeft - dx;
  }, []);

  // Attach global listeners to handle mouse moves and releases
  // that happen outside the component.
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  return { containerRef, handleMouseDown };
};
