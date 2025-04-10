import { ChevronRight, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { Package } from 'lucide-react';
import { AdminOrder } from '../../lib/types';
import 'jspdf-autotable';

interface OrderListProps {
  orders: AdminOrder[];
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  formatDate: (date: string) => string;
}

export function OrderList({ 
  orders, 
  expandedOrder, 
  setExpandedOrder, 
  updateOrderStatus,
  formatDate 
}: OrderListProps) {

  const downloadOrderPDF = async (order: AdminOrder) => {
    const res = await fetch('/api/export-order-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `objednavka_${order.order_number}.pdf`;
    link.click();
  };  

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Žádné objednávky"
        description="Zatím nebyly vytvořeny žádné objednávky."
      />
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <Card.Body>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Objednávka #{order.order_number}</p>
                  <p className="font-medium">
                    {order.customer_name || 'Zákazník'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vytvořeno</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cena celkem</p>
                  <p className="font-medium">{order.total_amount.toFixed(2)} Kč</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-5">
                <Select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  options={[
                    { value: 'pending', label: 'Čeká na vyřízení' },
                    { value: 'awaiting_payment', label: 'Čeká na platbu' },
                    { value: 'ready_for_pickup', label: 'Připraveno k vyzvednutí' },
                    { value: 'paid', label: 'Zaplaceno' },
                    { value: 'processing', label: 'Zpracovává se' },
                    { value: 'shipped', label: 'Odesláno' },
                    { value: 'delivered', label: 'Doručeno' },
                    { value: 'cancelled', label: 'Zrušeno' }
                  ]}
                  className="min-w-[140px]"
                />
                <button
                  onClick={() => downloadOrderPDF(order)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Download 
                    className={`h-6 w-6`}
                  />
                </button>
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
                  <h3 className="font-medium mb-2">Doručovací údaje</h3>
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
  );
}