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
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <ReAuthProvider>
            <Outlet />
          </ReAuthProvider>
        </main>
      </div>
    </div>
  );
}