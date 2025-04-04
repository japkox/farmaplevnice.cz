import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Plus, Search, Users, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Container } from '../components/layout/Container';
import { PageHeader } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OrderList } from '../components/admin/OrderList';
import { ProductList } from '../components/admin/ProductList';
import { CategoryList } from '../components/admin/CategoryList';
import { UserList } from '../components/admin/UserList';
import { MessageList } from '../components/admin/MessageList';
import { ProductModal } from '../components/admin/ProductModal';
import { TabItem, AdminOrder, AdminProduct, Category, User, Message, Product, StatusTranslations } from '../lib/types/';
import { useRouter } from 'next/router';


const tabs: TabItem[] = [
  { id: 'orders', label: 'Objednávky', icon: Package },
  { id: 'products', label: 'Produkty', icon: ShoppingBag },
  { id: 'categories', label: 'Kategorie', icon: Package },
  { id: 'messages', label: 'Zprávy', icon: Mail },
  { id: 'users', label: 'Uživatelé', icon: Users }
];

const statusTranslations: StatusTranslations = {
  pending: 'Čeká na vyřízení',
  awaiting_payment: 'Čeká na platbu',
  paid: 'Zaplaceno',
  processing: 'Zpracovává se',
  shipped: 'Odesláno',
  delivered: 'Doručeno',
  cancelled: 'Zrušeno',
};

export default function AdminDashboard() {
  const { user, supabase } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'users' | 'messages'>('orders');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        router.replace('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!data?.is_admin) {
          router.replace('/');
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error('Chyba při získávání admin statusu:', err);
        router.replace('/');
      }
    }

    checkAdminStatus();
  }, [user, supabase]);

  useEffect(() => {
    async function loadData() {
      if (!isAdmin) return;

      try {
        const [ordersData, productsData, categoriesData, usersData, messagesData] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              *,
              user_profile:profiles(first_name, last_name),
              order_items (
                *,
                product:products(name, unit)
              )
            `)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('products')
            .select(`
              *,
              category:categories(*)
            `)
            .order('name'),
          
          supabase
            .from('categories')
            .select('*')
            .order('name'),

          supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })
        ]);

        if (ordersData.error) throw ordersData.error;
        if (productsData.error) throw productsData.error;
        if (categoriesData.error) throw categoriesData.error;
        if (usersData.error) throw usersData.error;
        if (messagesData.error) throw messagesData.error;

        setOrders(ordersData.data || []);
        setProducts(productsData.data || []);
        setCategories(categoriesData.data || []);
        setUsers(usersData.data || []);
        setMessages(messagesData.data || []);
      } catch (err) {
        console.error('Chyba při načítání dat:', err);
        setError('Chyba při načítání dat');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAdmin, supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Chyba při nahrávání fotky:', err);
      toast.error('Chyba při nahrávání fotky');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const productData = { ...editingProduct };
      
      if (editingProduct.newImage instanceof File) {
        const imageUrl = await handleImageUpload(editingProduct.newImage);
        if (imageUrl) {
          productData.image_url = imageUrl;
        }
      }

      delete productData.newImage;

      const { error } = await supabase
        .from('products')
        .upsert({
          id: productData.id,
          name: productData.name,
          category_id: productData.category_id,
          price: productData.price,
          image_url: productData.image_url,
          description: productData.description,
          unit: productData.unit,
          stock_quantity: productData.stock_quantity,
        });

      if (error) throw error;

      const { data: updatedProducts, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');

      if (fetchError) throw fetchError;
      setProducts(updatedProducts || []);

      toast.success(productData.id ? 'Produkt byl aktualizován' : 'Produkt byl přidán');
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Chyba při ukládání produktu:', err);
      toast.error('Chyba při ukládání produktu');
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategory });

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(data || []);
      setNewCategory('');
      toast.success('Kategorie byla přidána');
    } catch (err) {
      console.error('Chyba při vytváření kategorie:', err);
      toast.error('Chyba při vytváření kategorie');
    }
  };

  const handleCategoryEdit = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: category.name })
        .eq('id', category.id);

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(data || []);
      setEditingCategory(null);
      toast.success('Kategorie byla aktualizována');
    } catch (err) {
      console.error('Chyba při aktualizaci kategorie:', err);
      toast.error('Chyba při aktualizaci kategorie:');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', categoryId);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) throw deleteError;

      const { data: updatedCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setCategories(updatedCategories || []);

      const { data: updatedProducts, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');

      if (productsError) throw productsError;
      setProducts(updatedProducts || []);

      toast.success('Kategorie byla smazána');
    } catch (err) {
      console.error('Chyba při mazání kategorie:', err);
      toast.error('Chyba při mazání kategorie');
    }
  };

  const toggleProductStatus = async (productId: string, disabled: boolean) => {
    const action = disabled ? 'deaktivovat' : 'aktivovat';
    if (!window.confirm(`Opravdu chcete ${action} tento produkt?`)) return;
  
    try {
      const { error } = await supabase
        .from('products')
        .update({ disabled })
        .eq('id', productId);
      
      if (error) throw error;
  
      setProducts(products.map((p: Product) =>
        p.id === productId ? { ...p, disabled } : p
      ) as AdminProduct[]);
      toast.success(`Produkt byl ${disabled ? 'deaktivován' : 'aktivován'}`);
    } catch (err) {
      console.error(`Chyba při ${action} produktu:`, err);
      toast.error(`Chyba při ${action} produktu`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      setOrders(orders.map((order: AdminOrder) => 
        order.id === orderId ? { ...order, status } : order
      ));

      try {
        const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', orderId)
        .single();

        await fetch('/api/send-updated-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            orderId: data.order_number,
            newStatus: statusTranslations[status],
          }),
        })
      } catch (error) {
        toast.error('Chyba při odesílání emailu o změně stavu');
      }

      toast.success('Status objednávky byl aktualizován');
    } catch (err) {
      console.error('Chyba při aktualizaci statusu objednávky:', err);
      toast.error('Chyba při aktualizaci statusu objednávky');
    }
  };

  const toggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map((user: User) =>
        user.id === userId ? { ...user, is_admin: isAdmin } : user
      ));

      toast.success(`Uživatel ${isAdmin ? 'přidán jako' : 'odebrán jako'} admin`);
    } catch (err) {
      console.error('Chyba při aktualizaci uživatele:', err);
      toast.error('Chyba při aktualizaci uživatele');
    }
  };

  const handleMarkMessageAsRead = async (messageId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map((message: Message) =>
        message.id === messageId ? { ...message, read } : message
      ));

      toast.success(`Zpráva označena jako ${read ? 'přečteno' : 'nepřečteno'}`);
    } catch (err) {
      console.error('Chyba při aktualizaci zprávy:', err);
      toast.error('Chyba při aktualizaci zprávy');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.filter((message: Message) => message.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredOrders = orders.filter((order: AdminOrder) => {
    if (!orderSearchQuery) return true;
    
    const searchLower = orderSearchQuery.toLowerCase();
    return (
      order.order_number.toString().includes(orderSearchQuery) ||
      order.status.toLowerCase().includes(searchLower)
    );
  });

  const filteredProducts = products.filter((product: AdminProduct) => {
    if (!productSearchQuery) return true;
    
    const searchLower = productSearchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower)
    );
  });

  const filteredUsers = users.filter((user: User) => {
    if (!userSearchQuery) return true;

    const searchLower = userSearchQuery.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  const filteredMessages = messages.filter((message: Message) => {
    if (!messageSearchQuery) return true;

    const searchLower = messageSearchQuery.toLowerCase();
    return (
      message.name.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.subject.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <PageHeader 
          title="Dashboard pro správu eshopu"
          actions={
            activeTab === 'products' && (
              <Button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category_id: categories[0]?.id,
                    price: 0,
                    image_url: '',
                    description: '',
                    unit: '',
                    stock_quantity: 0,
                  });
                  setIsEditModalOpen(true);
                }}
                icon={<Plus className="h-5 w-5" />}
              >
                Přidat produkt
              </Button>
            )
          }
        />
        
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="mb-6">
              <Input
                placeholder="Hledat podle čísla objednávky nebo statusu.."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <OrderList
              orders={filteredOrders}
              expandedOrder={expandedOrder}
              setExpandedOrder={setExpandedOrder}
              updateOrderStatus={updateOrderStatus}
              formatDate={formatDate}
            />
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div className="mb-6">
              <Input
                placeholder="Hledat podle názvu nebo kategorie.."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            <ProductList
              products={filteredProducts}
              onEdit={(product) => {
                setEditingProduct(product);
                setIsEditModalOpen(true);
              }}
              onDisable={toggleProductStatus}
            />
          </>
        )}

        {activeTab === 'categories' && (
          <CategoryList
            categories={categories}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            editingCategory={editingCategory}
            onEdit={handleCategoryEdit}
            onDelete={deleteCategory}
            onSubmit={handleCategorySubmit}
          />
        )}

        {activeTab === 'users' && (
          <UserList
            users={filteredUsers}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
            onToggleAdmin={toggleUserAdmin}
          />
        )}

        {activeTab === 'messages' && (
          <MessageList
            messages={filteredMessages}
            searchQuery={messageSearchQuery}
            onSearchChange={setMessageSearchQuery}
            onMarkAsRead={handleMarkMessageAsRead}
            onDelete={handleDeleteMessage}
          />
        )}

        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          categories={categories}
          uploadingImage={uploadingImage}
          onSubmit={handleProductSubmit}
          onChange={(updates) => setEditingProduct(prev => prev ? { ...prev, ...updates } : null)}
        />
      </Container>
    </div>
  );
}