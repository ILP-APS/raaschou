
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
          return;
        }
        
        // Convert shift+wheel to horizontal scroll
        if (e.shiftKey && e.deltaY !== 0) {
          e.preventDefault();
          scrollContainer.scrollLeft += e.deltaY;
        }
      }
    };
    
    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      
      // Update class based on scroll position
      if (scrollLeft > 0) {
        scrollContainer.classList.add('is-scrolling');
      } else {
        scrollContainer.classList.remove('is-scrolling');
      }

      // Apply scroll position to fixed header cells
      const fixedCols = scrollContainer.querySelectorAll('.fixed-column');
      fixedCols.forEach((col) => {
        (col as HTMLElement).style.left = `${scrollLeft}px`;
      });
    };
    
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('scroll', handleScroll);
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
