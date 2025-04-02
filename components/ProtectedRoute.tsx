import { ReactNode,useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace({
        pathname: '/auth',
        query: { from: router.asPath },
      })
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}