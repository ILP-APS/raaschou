
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
    stateRef.current.isDragging = false; // Reset dragging state on new mousedown
    stateRef.current.startX = e.pageX - container.offsetLeft;
    stateRef.current.scrollLeft = container.scrollLeft;

    // We don't preventDefault here, to allow for clicks to register
  }, []);

  const handleMouseLeave = useCallback(() => {
    // If the mouse leaves the container, we stop the drag process
    stateRef.current.isDown = false;
    stateRef.current.isDragging = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('grabbing');
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDown = false;
    // Set isDragging to false on mouse up
    const wasDragging = stateRef.current.isDragging;
    stateRef.current.isDragging = false;

    if (containerRef.current) {
      containerRef.current.classList.remove('grabbing');
    }
    
    // This timeout prevents the 'click' event from firing on an editable cell
    // immediately after a drag has finished.
    if(wasDragging) {
      setTimeout(() => {
        // any post-drag cleanup if needed
      }, 0);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!stateRef.current.isDown) return;

    // Start dragging only after the mouse has moved a bit
    stateRef.current.isDragging = true;

    if (containerRef.current) {
      containerRef.current.classList.add('grabbing');
    }

    e.preventDefault(); // Prevent text selection
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - stateRef.current.startX) * 2; // The '2' is a scroll speed multiplier
    if (containerRef.current) {
      containerRef.current.scrollLeft = stateRef.current.scrollLeft - walk;
    }
  }, []);

  // Effect to handle potential clicks on editable cells after a drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventClickAfterDrag = (e: MouseEvent) => {
      if (stateRef.current.isDragging) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    
    container.addEventListener('click', preventClickAfterDrag, true); // Use capture phase

    return () => {
      container.removeEventListener('click', preventClickAfterDrag, true);
    };
  }, []);

  return {
    containerRef,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
  };
};
