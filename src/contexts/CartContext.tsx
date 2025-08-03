'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product } from '@/types/pos';

// Cart action types
type CartAction = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

// Cart state interface
interface CartState {
  items: CartItem[];
}

// Cart context interface
interface CartContextType {
  items: CartItem[];
  addItem: (name: string, quantity: number, price: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== action.payload.id)
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Action creators
  const addItem = (name: string, quantity: number, price: number) => {
    const newItem: CartItem = {
      product: {
        id: Date.now(), // Simple ID generation
        name,
        price,
        category: 'manual',
        description: '',
        image_url: '',
        stock_quantity: 100,
        is_active: true
      },
      quantity
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const setItems = (items: CartItem[]) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const contextValue: CartContextType = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    setItems,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}