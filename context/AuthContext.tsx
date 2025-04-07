import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabase: SupabaseClient;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

if (!isValidUrl(supabaseUrl)) {
  throw new Error('Invalid Supabase URL format. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          return { success: false, error: 'Uživatel již existuje, prosím přihlašte se.' };
        }
        return { success: false, error: signUpError.message };
      }

      if (!newUser) {
        return { success: false, error: 'Nepodařilo se vytvořit účet' };
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: newUser.id,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Chyba při vytváření profilu', profileError);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password});

      if (signInError) {
        if(signInError.message.includes('Email not confirmed')) {
          setError('Email nebyl potvrzen. Zkontrolujte svou emailovou schránku a potvrďte svůj účet.');
          return false;
        } else 
        throw signInError;
      }
      
      return true;
    } catch (err) {
      setError('Neplatné přihlašovací údaje');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err) {
      setError('Nepodařilo se odhlásit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabase, signUp, signIn, signOut, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}