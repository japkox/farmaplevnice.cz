import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronRight } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusTranslations } from '../lib/types';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
    unit: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  order_number: number;
  order_items: OrderItem[];
}

const statusTranslations: StatusTranslations = {
  pending: 'Čeká na vyřízení',
  awaiting_payment: 'Čeká na platbu',
  paid: 'Zaplaceno',
  processing: 'Zpracovává se',
  shipped: 'Odesláno',
  delivered: 'Doručeno',
  cancelled: 'Zrušeno',
};

export default function Orders() {
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                name,
                unit
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Nepodařilo se načíst objednávky:', err);
        setError('Nepodařilo se načíst objednávky');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [user, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'awaiting_payment':
        return 'warning';
      case 'paid':
        return 'success';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <PageHeader title="Historie objednávek" />
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <PageHeader title="Historie objednávek" />
          <Card>
            <Card.Body>
              <div className="text-red-600">{error}</div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <PageHeader title="Historie objednávek" />
          <EmptyState
            icon={Package}
            title="Nemáte žádné objednávky"
            description="Po vytvoření objednávky se zde zobrazí její historie."
            action={{
              label: "Začít nakupovat",
              onClick: () => window.location.href = '/shop'
            }}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader title="Historie objednávek" />
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <Card.Body>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Vytvořeno</p>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cena</p>
                      <p className="font-medium">{order.total_amount.toFixed(2)} Kč</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-500">Číslo objednávky</p>
                      <p className="font-medium text-center">{order.order_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <Badge variant={getStatusVariant(order.status)}>
                      {statusTranslations[order.status] || order.status}
                    </Badge>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ChevronRight
                        className={`h-6 w-6 transform transition-transform ${
                          expandedOrder === order.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="mt-6 border-t pt-6">
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Doručení</h3>
                      <p className="text-gray-600">
                        {order.delivery_method === 'pickup' ? (
                          'Osobní odběr'
                        ) : (
                          <>
                            {order.shipping_address}<br />
                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                          </>
                        )}
                      </p>
                    </div>

                    <h3 className="font-medium mb-4">Položky objednávky</h3>
                    <div className="space-y-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              Počet: {item.quantity} {item.product.unit}
                            </p>
                          </div>
                          <p className="font-medium">
                            {(item.quantity * item.unit_price).toFixed(2)} Kč
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}