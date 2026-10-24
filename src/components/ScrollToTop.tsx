import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-navy-800 to-green-600 hover:from-navy-700 hover:to-green-500 text-white p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-125 hover:-translate-y-2 z-50 group animate-glow"
        >
          <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;