import { Edit, Trash2, Plus, ShoppingBag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { AdminProduct } from '../../lib/types';

interface ProductListProps {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onDisable: (productId: string, disabled: boolean) => void;
}

const DEFAULT_PRODUCT_IMAGE = "dummy.jpg";

export function ProductList({ products, onEdit, onDisable }: ProductListProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Žádné produkty"
        description="Zatím nebyly přidány žádné produkty."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <Card.Body>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative w-16 h-16 shrink-0">
                  <img
                    src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                    alt={product.name}
                    className={`w-full h-full object-cover rounded-lg ${
                      product.disabled ? 'opacity-50' : ''
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium truncate ${product.disabled ? 'line-through text-gray-500' : ''}`}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.category?.name || 'Bez kategorie'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={product.stock_quantity > 0 ? 'success' : 'error'}>
                      {product.stock_quantity} skladem
                    </Badge>
                    <span className="font-medium whitespace-nowrap">
                      {product.price.toFixed(2)} Kč/{product.unit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-4">
                <Button
                  variant="secondary"
                  onClick={() => onEdit(product)}
                  icon={<Edit className="h-5 w-5" />}
                />
                <Button
                  variant={product.disabled ? 'primary' : 'danger'}
                  onClick={() => onDisable(product.id, !product.disabled)}
                  icon={product.disabled ? <Plus className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                >
                  {product.disabled ? 'Aktivovat' : 'Deaktivovat'}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}