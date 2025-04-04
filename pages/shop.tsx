import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../lib/types/';
import { useAuth } from '../context/AuthContext';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Package } from 'lucide-react';

type SortOption = 'name' | 'price-asc' | 'price-desc';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useAuth();

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Nepodařilo se načíst kategorie:', err);
        setError('Nepodařilo se načíst kategorie');
      }
    }

    loadCategories();
  }, [supabase]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('disabled', false);
  
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Chyba při načítání produktů:', err);
        setError('Chyba při načítání produktů');
      } finally {
        setIsLoading(false);
      }
    }
  
    loadProducts();
  }, [supabase]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [selectedCategory, sortBy, searchQuery, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            {error}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader 
          title="Naše produkty" 
          description="Prohlédněte si naši nabídku produktů, které nabízíme."
        />

        <Card className="mb-8">
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Kategorie"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'Všechny kategorie' },
                  ...categories.map(cat => ({
                    value: cat.id,
                    label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
                  }))
                ]}
              />

              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                options={[
                  { value: 'name', label: 'Název' },
                  { value: 'price-asc', label: 'Cena: Vzestupně' },
                  { value: 'price-desc', label: 'Cena : Sestupně' }
                ]}
              />

              <Input
                label="Hledat"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat produkty.."
              />
            </div>
          </Card.Body>
        </Card>

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Produkty nebyly nalezeny"
            description="Žádné produkty neodpovídají vašemu vyhledávání."
          />
        )}
      </Container>
    </div>
  );
}