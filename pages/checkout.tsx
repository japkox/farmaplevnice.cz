import { useState, useEffect, FormEvent, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Truck, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryMethod: 'pickup' | 'dpd';
}

const initialShippingDetails: ShippingDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  deliveryMethod: 'dpd',
};

const DELIVERY_COST = 99;

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>(initialShippingDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state: cartState, clearCart } = useCart();
  const { user, supabase } = useAuth();
  const router = useRouter()
  const skipRedirectRef = useRef(false)

  useEffect(() => {
    if (cartState.items.length === 0 && !skipRedirectRef.current) {
      router.replace('/cart')
    }
  }, [cartState.items.length, router])
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setShippingDetails({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: user.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            deliveryMethod: 'dpd',
          });
        }
      } catch (err) {
        console.error('Chyba při načítání profilu:', err);
        toast.error('Chyba při načítání profilu');
      }
    }

    loadUserProfile();
  }, [user, supabase]);

  const validateShippingDetails = () => {
    const errors: string[] = [];

    if (!shippingDetails.firstName) errors.push('Jméno je povinné');
    if (!shippingDetails.lastName) errors.push('Příjmení je povinné');
    if (!shippingDetails.email) errors.push('Email je povinný');
    if (!shippingDetails.phone) errors.push('Telefon je povinný');

    if (shippingDetails.deliveryMethod === 'dpd') {
      if (!shippingDetails.address) errors.push('Adresa je povinná');
      if (!shippingDetails.city) errors.push('Město je povinné');
      if (!shippingDetails.state) errors.push('Stát je povinný');
      if (!shippingDetails.zipCode) errors.push('PSČ je povinné');
    }

    return errors;
  };

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const errors = validateShippingDetails();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleConfirmOrder = async () => {
    if (!user) return;
  
    setIsSubmitting(true);
  
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: 'pending',
            total_amount: totalWithDelivery,
            shipping_address: shippingDetails.address,
            shipping_city: shippingDetails.city,
            shipping_state: shippingDetails.state,
            shipping_zip: shippingDetails.zipCode,
            delivery_method: shippingDetails.deliveryMethod,
            customer_name: `${shippingDetails.firstName} ${shippingDetails.lastName}`
          },
        ])
        .select()
        .single();
  
      if (orderError) throw orderError;
  
      const orderItems = cartState.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));
  
      const { data, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
  
      if (itemsError) throw itemsError;

      for (const item of cartState.items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq('id', item.id);
  
        if (stockError) throw stockError;
      }

      try {
        await fetch('/api/send-new-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            orderId: order.order_number, 
            items: cartState.items, 
            price: order.total_amount,
            customer_name: order.customer_name,
            delivery_method: order.delivery_method,
            address: order.shipping_address,
            city: order.shipping_city,
            state: order.shipping_state,
            zip: order.shipping_zip,
          }),
        })
      } catch(e) {
        toast.error('Chyba při odesílání potvrzovacího emailu.')
      }
      
      skipRedirectRef.current = true
      clearCart()

      toast.success('Objednávka byla úspěšně vytvořena!');
      router.replace('/checkout/success');
    } catch (err) {
      console.error('Chyba při vytváření objednávky:', err);
      toast.error('Chyba při vytváření objednávky.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalWithDelivery = shippingDetails.deliveryMethod === 'dpd' 
    ? cartState.total + DELIVERY_COST 
    : cartState.total;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader title="Checkout" />

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= 1 ? 'border-green-600 bg-green-50' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2">Doprava</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= 2 ? 'border-green-600 bg-green-50' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2">Shrnutí</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <form onSubmit={handleShippingSubmit}>
              <Card.Body>
                <h2 className="text-xl font-semibold mb-6">Dodací údaje</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Způsob dopravy
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex cursor-pointer rounded-lg border p-4 
                      ${shippingDetails.deliveryMethod === 'dpd' 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="dpd"
                        checked={shippingDetails.deliveryMethod === 'dpd'}
                        onChange={(e) => setShippingDetails({
                          ...shippingDetails,
                          deliveryMethod: e.target.value as 'dpd'
                        })}
                        className="sr-only"
                      />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <Truck className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">DPD</p>
                            <p className="text-sm text-gray-500">{DELIVERY_COST.toFixed(2)} Kč</p>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className={`relative flex cursor-pointer rounded-lg border p-4 
                      ${shippingDetails.deliveryMethod === 'pickup' 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={shippingDetails.deliveryMethod === 'pickup'}
                        onChange={(e) => setShippingDetails({
                          ...shippingDetails,
                          deliveryMethod: e.target.value as 'pickup'
                        })}
                        className="sr-only"
                      />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <Store className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">Osobní odběr</p>
                            <p className="text-sm text-gray-500">Zdarma</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Jméno"
                      required
                      value={shippingDetails.firstName}
                      onChange={(e) => setShippingDetails({...shippingDetails, firstName: e.target.value})}
                    />
                    <Input
                      label="Příjmení"
                      required
                      value={shippingDetails.lastName}
                      onChange={(e) => setShippingDetails({...shippingDetails, lastName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({...shippingDetails, email: e.target.value})}
                    />
                    <Input
                      label="Telefon"
                      type="tel"
                      required
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                    />
                  </div>

                  {shippingDetails.deliveryMethod === 'dpd' && (
                    <>
                      <Input
                        label="Adresa"
                        required
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                          label="Město"
                          required
                          value={shippingDetails.city}
                          onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                        />
                        <Input
                          label="Stát"
                          required
                          value={shippingDetails.state}
                          onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                        />
                        <Input
                          label="PSČ"
                          required
                          value={shippingDetails.zipCode}
                          onChange={(e) => setShippingDetails({...shippingDetails, zipCode: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card.Body>

              <Card.Footer>
                <div className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => router.replace('/cart')}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Zpět do košíku
                  </Button>
                  <Button
                    type="submit"
                    icon={<ChevronRight className="h-4 w-4" />}
                  >
                    Pokračovat
                  </Button>
                </div>
              </Card.Footer>
            </form>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              <h2 className="text-xl font-semibold mb-6">Shrnutí</h2>
              
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="font-medium mb-2">Způsob dopravy</h3>
                  <div className="flex items-center gap-2">
                    {shippingDetails.deliveryMethod === 'dpd' ? (
                      <>
                        <Truck className="h-4 w-4 text-green-600" />
                        <span>DPD ({DELIVERY_COST.toFixed(2)} Kč)</span>
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 text-green-600" />
                        <span>Osobní odběr (Zdarma)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="font-medium mb-2">Kontaktní údaje</h3>
                  <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
                  <p>{shippingDetails.email}</p>
                  <p>{shippingDetails.phone}</p>
                </div>

                {shippingDetails.deliveryMethod === 'dpd' && (
                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-2">Doručovací adresa</h3>
                    <p>{shippingDetails.address}</p>
                    <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-4">Shrnutí objednávky</h3>
                  <div className="space-y-4">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {item.price.toFixed(2)} Kč/{item.unit}
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} Kč
                        </p>
                      </div>
                    ))}

                    {shippingDetails.deliveryMethod === 'dpd' && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Doprava</span>
                        <span>{DELIVERY_COST.toFixed(2)} Kč</span>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Celkem</span>
                        <span>{totalWithDelivery.toFixed(2)} Kč</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>

            <Card.Footer>
              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  icon={<ChevronLeft className="h-4 w-4" />}
                >
                  Zpět
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  loading={isSubmitting}
                >
                  Potvrdit objednávku
                </Button>
              </div>
            </Card.Footer>
          </Card>
        )}
      </Container>
    </div>
  );
}