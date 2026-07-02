import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, fetchUser, user } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (isAuthenticated && !user) {
        await fetchUser();
      }
      setChecking(false);
    };
    check();
  }, [isAuthenticated, user, fetchUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
