import { useEffect, useState } from 'react';

const AnimatedNumber = ({ value, duration = 2, suffix = '', decimals = 0, startOnView = false, isVisible }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startOnView || (startOnView && isVisible)) {
      let start = 0;
      const increment = value / (duration * 60); // 60 FPS
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 1000/60);
      
      return () => clearInterval(timer);
    }
  }, [value, duration, isVisible, startOnView]);

  return (
    <span className="stat-number">
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  );
};

export default AnimatedNumber;