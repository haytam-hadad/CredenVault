import { useEffect } from 'react';  
  
// Calls `handler` on outside mousedown or Escape while `active` is true.  
export default function useClickOutside(ref, handler, active = true) {  
  useEffect(() => {  
    if (!active) return undefined;  
  
    const handleClickOutside = (event) => {  
      if (ref.current && !ref.current.contains(event.target)) handler();  
    };  
    const handleKeyDown = (event) => {  
      if (event.key === 'Escape') handler();  
    };  
  
    document.addEventListener('mousedown', handleClickOutside);  
    document.addEventListener('keydown', handleKeyDown);  
    return () => {  
      document.removeEventListener('mousedown', handleClickOutside);  
      document.removeEventListener('keydown', handleKeyDown);  
    };  
  }, [ref, handler, active]);  
}