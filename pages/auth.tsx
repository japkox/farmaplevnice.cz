import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router'

interface ValidationErrors {
  email?: string;
  password?: string[];
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { signIn, signUp, error } = useAuth();

  const router = useRouter()
  const from = (router.query.from as string) || '/'

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email je povinný';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Neplatný formát emailu';
    }
    return undefined;
  };

  const validatePassword = (pass: string) => {
    const errors: string[] = [];
    
    if (!pass) {
      return ['Heslo je povinné'];
    }

    if (isSignUp) {
      if (pass.length < 8) {
        errors.push('Alespoň 8 znaků');
      }
      if (!/[A-Z]/.test(pass)) {
        errors.push('Jedno velké písmeno');
      }
      if (!/[a-z]/.test(pass)) {
        errors.push('Jedno malé písmeno');
      }
      if (!/\d/.test(pass)) {
        errors.push('Jedno číslo');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        errors.push('Jeden speciální znak');
      }
    }

    return errors.length > 0 ? errors : undefined;
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = emailError;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors) {
      errors.password = passwordErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isSignUp && cooldown > 0) {
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { success, error } = await signUp(email, password);
        if (success) {
          setCooldown(5);
          toast.success('Registrace byla úspěšná, můžete se přihlásit.', {
            icon: '✓'
          });
          setIsSignUp(false);
        } else if (error) {
          toast.error(error);
        }
      } else {
        const success = await signIn(email, password);
        if (success) {
          toast.success('Vítejte zpět!');
          router.replace(from);
        }
      }
    } catch (err) {
      console.error('Chyba při autorizaci:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container className="max-w-md">
        <Card>
          <Card.Body>
            <h2 className="text-2xl font-bold text-center mb-8">
              {isSignUp ? 'Vytvořit účet' : 'Přihlásit se'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                error={validationErrors.email}
                placeholder="Zadejte svůj email"
                autoComplete="email"
              />

              <Input
                label="Heslo"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder={isSignUp ? 'Vyberte silné heslo' : 'Zadejte své heslo'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />

              {isSignUp && validationErrors.password && validationErrors.password.length > 0 && (
                <div className="rounded-lg bg-yellow-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Heslo musí splňovat následující kritéria:
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors.password.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={isLoading}
                disabled={isSignUp && cooldown > 0}
                className="w-full"
              >
                {isSignUp ? (
                  cooldown > 0 ? `Prosím, počkejte ${cooldown} sekund` : 'Vytvořit účet'
                ) : (
                  'Přihlásit se'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('');
                  setPassword('');
                  setValidationErrors({});
                }}
              >
                {isSignUp
                  ? 'Už máte účet? Přihlaste se'
                  : "Nemáte účet? Vytvořte si ho"}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}