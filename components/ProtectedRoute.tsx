'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isDemo, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !isDemo && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isDemo, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081425] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isDemo && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
