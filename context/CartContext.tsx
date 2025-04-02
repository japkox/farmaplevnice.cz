import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../lib/types';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'farm-shop-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          total: state.total + product.price * quantity
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...product, quantity }],
          total: state.total + product.price * quantity
        };
      }
      break;
    }

    case 'REMOVE_FROM_CART': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;

      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
        total: state.total - (item.price * item.quantity)
      };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (!item) return state;

      const quantityDiff = quantity - item.quantity;

      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
        total: state.total + (item.price * quantityDiff)
      };
      break;
    }

    case 'LOAD_CART': {
      newState = action.payload;
      break;
    }

    case 'CLEAR_CART': {
      newState = {
        items: [],
        total: 0
      };
      break;
    }

    default:
      return state;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newState));
  return newState;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (err) {
        console.error('Chyba při načítání dat:', err);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    toast.success(`${product.name} přidáno do košíku`);
  };

  const removeFromCart = (id: string) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
      toast.success(`${item.name} odstraněno z košíku`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = state.items.find(item => item.id === id);
    if (item) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      toast.success(`U položky ${item.name} byl aktualizován počet`);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart  }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}