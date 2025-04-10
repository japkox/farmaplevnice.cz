import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

export default function Profile() {
  const { user, supabase, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      if(loading) return;

      if (!user) {
        router.replace('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Nepodařilo se načíst profil:', err);
        setError('Nepodařilo se načíst profil');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user, supabase, loading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profil byl úspěšně aktualizován');
    } catch (err) {
      console.error('Při aktualizování profilu došlo k chybě:', err);
      setError('Při aktualizování profilu došlo k chybě');
      toast.error('Při aktualizování profilu došlo k chybě');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <PageHeader title="Nastavení profilu" />
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader title="Nastavení profilu" />
        
        <Card>
          <Card.Body>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Kontaktní údaje</h2>
                <p className="text-gray-600">Aktualizujte své kontaktní údaje</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Jméno"
                  name="first_name"
                  value={profile?.first_name || ''}
                  onChange={handleChange}
                  placeholder="Zadejte jméno"
                />

                <Input
                  label="Příjmení"
                  name="last_name"
                  value={profile?.last_name || ''}
                  onChange={handleChange}
                  placeholder="Zadejte příjmení"
                />
              </div>

              <Input
                label="Telefonní číslo"
                name="phone"
                type="tel"
                value={profile?.phone || ''}
                onChange={handleChange}
                placeholder="Zadejte telefonní číslo"
              />

              <Input
                label="Adresa"
                name="address"
                value={profile?.address || ''}
                onChange={handleChange}
                placeholder="Zadejte adresu"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Město"
                  name="city"
                  value={profile?.city || ''}
                  onChange={handleChange}
                  placeholder="Zadejte město"
                />

                <Input
                  label="Stát"
                  name="state"
                  value={profile?.state || ''}
                  onChange={handleChange}
                  placeholder="Zadejte stát"
                />

                <Input
                  label="PSČ"
                  name="zip_code"
                  value={profile?.zip_code || ''}
                  onChange={handleChange}
                  placeholder="Zadejte PSČ"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isSaving}
                >
                  Uložit změny
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}