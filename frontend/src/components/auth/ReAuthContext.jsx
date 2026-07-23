import { createContext, useCallback, useContext, useRef, useState } from 'react';  
import ReAuthModal from './ReAuthModal';  
  
// After a successful re-auth, subsequent sensitive actions are allowed for a  
// short "sudo mode" window so the user is not prompted on every click.  
const GRACE_PERIOD_MS = 3 * 60 * 1000;  
  
const ReAuthContext = createContext(null);  
  
export function ReAuthProvider({ children }) {  
  const [request, setRequest] = useState(null);  
  const verifiedUntil = useRef(0);  
  const pendingAction = useRef(null);  
  
  // Gate a sensitive action behind re-authentication. If the user verified  
  // recently, `onSuccess` runs immediately; otherwise the modal is shown.  
  // `onSuccess` receives the freshly-entered password when the modal is used,  
  // or `undefined` when the grace-period shortcut is taken.  
  const requireReauth = useCallback((onSuccess, options = {}) => {  
    if (Date.now() < verifiedUntil.current) {  
      onSuccess();  
      return;  
    }  
    pendingAction.current = onSuccess;  
    setRequest(options);  
  }, []);  
  
  const closeModal = () => {  
    pendingAction.current = null;  
    setRequest(null);  
  };  
  
  const handleSuccess = (password) => {  
    verifiedUntil.current = Date.now() + GRACE_PERIOD_MS;  
    const action = pendingAction.current;  
    pendingAction.current = null;  
    setRequest(null);  
    if (action) action(password);  
  };  
  
  return (  
    <ReAuthContext.Provider value={{ requireReauth }}>  
      {children}  
      <ReAuthModal  
        isOpen={Boolean(request)}  
        onClose={closeModal}  
        onSuccess={handleSuccess}  
        title={request?.title}  
        description={request?.description}  
        actionLabel={request?.actionLabel}  
      />  
    </ReAuthContext.Provider>  
  );  
}  
  
export function useReauth() {  
  const ctx = useContext(ReAuthContext);  
  if (!ctx) {  
    throw new Error('useReauth must be used within a ReAuthProvider');  
  }  
  return ctx;  
}