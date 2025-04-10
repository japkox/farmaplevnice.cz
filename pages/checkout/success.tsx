import { CheckCircle, Package, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Container } from '../../components/layout/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutSuccess() {

  const { user, supabase, loading } = useAuth();

  const router = useRouter()

  useEffect(() => {
    if(loading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }
  }, [user, supabase, loading]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container className="max-w-3xl">
        <Card>
          <Card.Body className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4">
                  <div className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter bg-gradient-to-r from-green-400 to-green-600" />
                </div>
                <CheckCircle className="relative h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Objednávka přijata!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vaše objednávka byla úspěšně zpracována a potvrzena. Stav objednávky můžete sledovat v sekci historie objednávek.
            </p>

            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-5 w-5" />
                <span>Potvrzení objednávky s informacemi o platbě vám bude co nejdříve posláno na email.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                as={Link}
                to="/orders"
                variant="secondary"
                icon={<Package className="h-5 w-5" />}
                className="w-full"
              >
                Zobrazit historii objednávek
              </Button>
              <Button
                as={Link}
                to="/shop"
                icon={<ShoppingBag className="h-5 w-5" />}
                className="w-full"
              >
                Pokračovat v nákupu
              </Button>
            </div>
          </Card.Body>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět domů
          </Link>
        </div>
      </Container>
    </div>
  );
}