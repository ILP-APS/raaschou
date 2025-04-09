
import { useRef, useEffect, ReactNode } from "react";

interface FokusarkTableScrollProps {
  children: ReactNode;
}

const FokusarkTableScroll: React.FC<FokusarkTableScrollProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      // Get the scroll position
      const scrollLeft = scrollContainer.scrollLeft;
      
      // Find the frozen columns container and apply shadow based on scroll position
      const frozenColumns = document.querySelector('.frozen-columns') as HTMLElement;
      if (frozenColumns) {
        if (scrollLeft > 0) {
          frozenColumns.classList.add('with-shadow');
        } else {
          frozenColumns.classList.remove('with-shadow');
        }
      }
    };
    
    // Listen for scroll events
    scrollContainer.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="fokusark-table-scroll-container"
    >
      {children}
    </div>
  );
};

export default FokusarkTableScroll;
