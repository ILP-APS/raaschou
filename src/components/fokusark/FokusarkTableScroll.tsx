
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
    
    // For touch devices, sync the positions of sticky elements
    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollLeft = scrollContainer.scrollLeft;
      
      // Force repaint sticky elements by setting a small transform
      const headers = scrollContainer.querySelectorAll('thead th');
      const stickyColumns = scrollContainer.querySelectorAll('.fokusark-col-0, .fokusark-col-1');
      
      // Apply a minimal transform to force a repaint, which helps with rendering issues
      [...headers, ...stickyColumns].forEach((el) => {
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
    };
    
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="fokusark-table-container relative z-0"
    >
      {children}
    </div>
  );
};

export default FokusarkTableScroll;
