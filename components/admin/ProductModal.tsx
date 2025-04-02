import { FormEvent } from 'react';
import { Loader, ImageIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { AdminProduct, Category } from '../../lib/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<AdminProduct> | null;
  categories: Category[];
  uploadingImage: boolean;
  onSubmit: (e: FormEvent) => void;
  onChange: (updates: Partial<AdminProduct>) => void;
}

const DEFAULT_PRODUCT_IMAGE = 'dummy.jpg';

export function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
  uploadingImage,
  onSubmit,
  onChange
}: ProductModalProps) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.id ? 'Upravit produkt' : 'Přidat produkt'}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          label="Název"
          required
          value={product.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-6">
          <Select
            label="Kategorie"
            value={product.category_id || ''}
            onChange={(e) => onChange({ category_id: e.target.value || null })}
            options={[
              { value: '', label: 'Bez kategorie' },
              ...categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))
            ]}
          />

          <Input
            label="Jednotka"
            required
            value={product.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Cena"
            type="number"
            required
            min="0"
            step="0.01"
            value={product.price}
            onChange={(e) => onChange({ price: parseFloat(e.target.value) })}
          />

          <Input
            label="Počet skladem"
            type="number"
            required
            min="0"
            value={product.stock_quantity}
            onChange={(e) => onChange({ stock_quantity: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotka produktu
          </label>
          <div className="relative w-32 h-32 mb-2">
            <img
              src={product.image_url || DEFAULT_PRODUCT_IMAGE}
              alt="Product preview"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
            />
            {!product.image_url && !product.newImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange({ newImage: file });
              }
            }}
            className="w-full"
          />
        </div>

        <Input
          label="Popis"
          as="textarea"
          required
          rows={3}
          value={product.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            disabled={uploadingImage}
            icon={uploadingImage ? <Loader className="h-5 w-5 animate-spin" /> : undefined}
          >
            {uploadingImage ? 'Nahrávání...' : (product.id ? 'Upravit produkt' : 'Přidat produkt')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}