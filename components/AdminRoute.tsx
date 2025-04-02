import { useAuth } from '../context/AuthContext';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, supabase, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace({ pathname: '/auth', query: { from: router.asPath } })
      } else if (!isAdmin) {
        router.replace('/')
      }
    }
  }, [user, isAdmin, loading, router])

  if (!user || !isAdmin || loading) return null

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(!!data?.is_admin);
      } catch (err) {
        console.error('Chyba při získávání admin statusu:', err);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAdminStatus();
  }, [user, supabase]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}