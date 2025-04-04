import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useRouter } from 'next/router';

export default function Cart() {
  const { state, updateQuantity, removeFromCart } = useCart();

  const router = useRouter()

  const DEFAULT_PRODUCT_IMAGE = "/dummy.jpg";

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <PageHeader title="Košík" />
          <EmptyState
            icon={ShoppingBag}
            title="Máte prázdný košík"
            description="Přidejte produkty do košíku pro pokračování v nákupu."
            action={{
              label: "Pokračovat v nákupu",
              onClick: () => router.replace('/shop')
            }}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader title="Košík" />

        <Card>
          <div className="divide-y divide-gray-200">
            {state.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                      <img
                        src={item.image_url || DEFAULT_PRODUCT_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                      <p className="text-gray-600">{item.price.toFixed(2)} Kč/{item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        icon={<Minus className="h-4 w-4" />}
                        className="p-1"
                        disabled={item.quantity <= 1}
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border rounded-md h-10"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        icon={<Plus className="h-4 w-4" />}
                        className="p-1"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold whitespace-nowrap">
                          {(item.price * item.quantity).toFixed(2)} Kč
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => removeFromCart(item.id)}
                        icon={<Trash2 className="h-5 w-5" />}
                        className="p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card.Footer>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-lg font-semibold">Celkem:</span>
                <span className="text-2xl font-bold ml-2">{state.total.toFixed(2)} Kč</span>
              </div>
              <div className="flex gap-4 justify-center sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => router.replace('/shop')}
                >
                  Pokračovat v nákupu
                </Button>
                <Button
                  onClick={() => router.replace('/checkout')}
                >
                  Pokračovat v objednávce
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
}