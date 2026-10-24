import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on homepage
    if (location.pathname === '/') {
      setIsVisible(true);
      
      const handleScroll = () => {
        if (window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname]);

  const scrollToContent = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <button
        onClick={scrollToContent}
        className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white p-4 rounded-full shadow-2xl hover:bg-opacity-30 transition-all duration-500 animate-bounce hover:scale-125 hover:shadow-2xl"
        aria-label="Scroll to content"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ScrollIndicator;