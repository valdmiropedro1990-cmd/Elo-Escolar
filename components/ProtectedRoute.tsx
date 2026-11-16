'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isDemo, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = 
    pathname === '/login' || 
    pathname === '/' ||
    pathname.startsWith('/verify') || 
    pathname.startsWith('/validar');

  useEffect(() => {
    if (!loading && !user && !isDemo && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isDemo, loading, router, pathname, isPublicRoute]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isDemo && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
