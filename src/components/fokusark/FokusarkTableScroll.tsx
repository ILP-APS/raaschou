
import { useRef, useEffect, ReactNode } from "react";

interface FokusarkTableScrollProps {
  children: ReactNode;
}

const FokusarkTableScroll: React.FC<FokusarkTableScrollProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainer.contains(e.target as Node)) {
        // Let horizontal scrolling work naturally
        if (e.deltaX !== 0) {
          e.stopPropagation();
          return;
        }
        
        // Convert shift+wheel to horizontal scroll
        if (e.shiftKey && e.deltaY !== 0) {
          e.preventDefault();
          scrollContainer.scrollLeft += e.deltaY;
        }
      }
    };
    
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="fokusark-table-container"
    >
      {children}
    </div>
  );
};

export default FokusarkTableScroll;
