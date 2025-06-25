
import { useRef, useCallback, useState } from 'react';

interface DragScrollState {
  isDragging: boolean;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
}

export const useDragScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragScrollState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    // Only start drag if clicking on the container itself or table elements, not input elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) {
      return;
    }

    // Capture the pointer to ensure we get all move events
    container.setPointerCapture(e.pointerId);
    
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    });

    // Prevent text selection during drag
    e.preventDefault();
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.isDragging || !containerRef.current) return;

    e.preventDefault();
    
    const container = containerRef.current;
    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    
    container.scrollLeft = dragState.scrollLeft - deltaX;
    container.scrollTop = dragState.scrollTop - deltaY;
  }, [dragState]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    container.releasePointerCapture(e.pointerId);
    
    setDragState(prev => ({ ...prev, isDragging: false }));
    
    container.style.cursor = 'grab';
    container.style.userSelect = '';
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (dragState.isDragging && containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.userSelect = '';
      setDragState(prev => ({ ...prev, isDragging: false }));
    }
  }, [dragState.isDragging]);

  return {
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    isDragging: dragState.isDragging,
  };
};
