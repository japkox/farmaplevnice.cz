import dummyImage from '/public/dummy.jpg';

import { useState } from 'react';
import { Product } from '../lib/types';
import { ShoppingCart, Plus, Minus, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface ProductCardProps {
  product: Product;
}

const DEFAULT_PRODUCT_IMAGE = "dummy.jpg";

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <Card>
      <div className="aspect-w-3 aspect-h-2">
        <img
          src={product.image_url || DEFAULT_PRODUCT_IMAGE}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
          }}
        />
      </div>
      
      <Card.Body>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
            <span className="text-green-600 font-semibold whitespace-nowrap ml-4">
              {product.price.toFixed(2)} Kč/{product.unit}
            </span>
          </div>
          
          <div className="min-h-[3rem] mb-4">
            <p className="text-gray-600 line-clamp-2">{product.description}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-auto">
            <Badge className="whitespace-nowrap" variant={product.in_stock ? 'success' : 'error'}>
              {product.in_stock ? 'Skladem' : '0ks'}
            </Badge>

            <div className="flex-1 flex justify-end">
              {user ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    icon={<Minus className="h-4 w-4" />}
                    className="p-1"
                  />
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 h-12 text-center border rounded-md"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    icon={<Plus className="h-4 w-4" />}
                    className="p-1"
                  />
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    className="ml-1"
                  >
                    Koupit
                  </Button>
                </div>
              ) : (
                <Button
                  as={Link}
                  to="/auth"
                  icon={<LogIn className="h-4 w-4" />}
                >
                  Přihlašte se
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}