import { useEffect, useState } from 'react';  
import { securityService } from '../services';  
  
// Debounced password-strength lookup shared by Register and Settings.  
export default function usePasswordStrength(password, delay = 300) {  
  const [strength, setStrength] = useState(null);  
  
  useEffect(() => {  
    const timer = setTimeout(async () => {  
      if (password && password.length > 0) {  
        try {  
          const res = await securityService.checkStrength(password);  
          setStrength(res.data.strength);  
        } catch {  
          setStrength(null);  
        }  
      } else {  
        setStrength(null);  
      }  
    }, delay);  
    return () => clearTimeout(timer);  
  }, [password, delay]);  
  
  return strength;  
}