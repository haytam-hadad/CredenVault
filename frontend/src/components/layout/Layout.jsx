import { useEffect, useState } from 'react';  
import { Outlet } from 'react-router-dom';  
import Navbar from './Navbar';  
import Sidebar from './Sidebar';  
import { ReAuthProvider } from '../auth/ReAuthContext';  
import useNotificationStore from '../../store/notificationStore';  
  
export default function Layout() {  
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const startPolling = useNotificationStore((s) => s.startPolling);  
  const stopPolling = useNotificationStore((s) => s.stopPolling);  
  
  useEffect(() => {  
    startPolling();  
    return () => stopPolling();  
  }, [startPolling, stopPolling]);  
  
  return (  
    <div className="min-h-screen bg-slate-950 flex">  
      {/* Skip link for keyboard users */}  
      <a  
        href="#main-content"  
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-600 focus:text-white focus:shadow-lg"  
      >  
        Aller au contenu  
      </a>  
  
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />  
      <div className="flex-1 flex flex-col min-w-0">  
        <Navbar onMenuClick={() => setSidebarOpen(true)} />  
        <main  
          id="main-content"  
          aria-label="Contenu principal"  
          className="flex-1 p-4 lg:p-6 overflow-auto"  
        >  
          <ReAuthProvider>  
            <Outlet />  
          </ReAuthProvider>  
        </main>  
      </div>  
    </div>  
  );  
}