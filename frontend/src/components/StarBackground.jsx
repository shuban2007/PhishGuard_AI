import React, { useEffect, useState } from 'react';
import './StarBackground.css';

const StarBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-[-50] bg-[#0b1021] overflow-hidden pointer-events-none">
      <div 
        className="stars-pattern absolute inset-[-100%]" 
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      ></div>
    </div>
  );
};

export default StarBackground;
