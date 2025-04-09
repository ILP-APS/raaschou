
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
      // Update the scroll position of the fixed columns header
      const scrollLeft = scrollContainer.scrollLeft;
      document.documentElement.style.setProperty('--table-scroll-position', `${scrollLeft}px`);
      
      // Add/remove scrolling class for shadow effects
      if (scrollLeft > 0) {
        scrollContainer.classList.add('is-scrolling');
      } else {
        scrollContainer.classList.remove('is-scrolling');
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
