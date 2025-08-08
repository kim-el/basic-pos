'use client';

import { useState, useEffect } from 'react';
import { Calculator } from '@/components/pos/Calculator';
import { CartItem } from '@/types/pos';
import { useCart } from '@/contexts/CartContext';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { AppProviders } from '@/contexts/AppProviders';

interface POSSystemProps {
  params: Promise<{
    id: string;
  }>;
}

function RestaurantCashierContent({ params }: POSSystemProps) {
  const [restaurantId, setRestaurantId] = useState<string>('');
  
  // Use contexts instead of local state and useSocket hook
  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity: updateCartQuantity, 
    setItems, 
    getTotalPrice 
  } = useCart();
  
  const { 
    dailySales, 
    fetchDailySales, 
    setRestaurantId: setContextRestaurantId 
  } = useRestaurant();
  
  const { 
    isConnected, 
    updateOrder 
  } = useSocketContext();

  // Extract restaurantId from params
  useEffect(() => {
    const getRestaurantId = async () => {
      const { id } = await params;
      setRestaurantId(id);
      setContextRestaurantId(id);
    };
    getRestaurantId();
  }, [params, setContextRestaurantId]);
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  // Add demo items with delays (same as before)
  useEffect(() => {
    if (isConnected && restaurantId) {
      // Clear any existing items first
      setItems([]);
      
      // Add items progressively using the context methods
      setTimeout(() => {
        addItem('Burger', 1, 18.99);
      }, 1000);
      
      setTimeout(() => {
        addItem('Pizza', 1, 24.99);
      }, 2000);
      
      setTimeout(() => {
        addItem('Ravioli', 1, 22.50);
      }, 3000);
      
      setTimeout(() => {
        addItem('Orange Juice', 2, 4.25);
      }, 4000);
      
      setTimeout(() => {
        addItem('Wagyu Tomahawk', 1, 89.99);
      }, 5000);
    }
  }, [isConnected, restaurantId, addItem, setItems]);

  // Sync cart changes with socket
  useEffect(() => {
    if (isConnected && restaurantId) {
      updateOrder(items);
    }
  }, [items, isConnected, restaurantId, updateOrder]);

  // Voice simulation - add items programmatically
  const simulateVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    switch(command) {
      case 'add burger':
        addItem('Burger', 1, 18.99);
        break;
      case 'add fries':
        addItem('French Fries', 1, 6.50);
        break;
      case 'add drink':
        addItem('Coca Cola', 1, 3.25);
        break;
      case 'add pizza':
        addItem('Pizza', 1, 24.99);
        break;
      case 'clear all':
        setItems([]);
        break;
    }
  };

  // Expose function to window for live testing
  useEffect(() => {
    (window as Window & { addItem?: typeof simulateVoiceCommand }).addItem = simulateVoiceCommand;
    console.log('🎤 Voice commands available:');
    console.log('addItem("add burger") - Add burger');
    console.log('addItem("add fries") - Add fries'); 
    console.log('addItem("add drink") - Add drink');
    console.log('addItem("add pizza") - Add pizza');
    console.log('addItem("clear all") - Clear all items');
  }, []);

  const handleAddItem = () => {
    if (newItemName.trim() && newItemPrice && newItemQuantity) {
      addItem(newItemName.trim(), parseInt(newItemQuantity), parseFloat(newItemPrice));
      // Reset form
      setNewItemName('');
      setNewItemPrice('');
      setNewItemQuantity('1');
      setShowAddForm(false);
    }
  };

  // Show loading state until we have restaurantId
  if (!restaurantId) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS System (With Context)</h1>
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-600">Restaurant ID: {restaurantId}</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Sales Today: ${(dailySales?.total_sales || 0).toFixed(2)}</span>
            <span>Transactions: {dailySales?.total_transactions || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Side - Items Box */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Items</h2>
          
          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No items added yet</p>
                <p className="text-sm">Speak to add items</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Calculator */}
        <div className="w-96">
          <Calculator 
            totalAmount={getTotalPrice()}
            onChangeCalculated={(change) => {
              console.log('Change calculated:', change);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Main component with providers
export default function RestaurantCashier({ params }: POSSystemProps) {
  const [restaurantId, setRestaurantId] = useState<string>('');

  // Extract restaurantId first
  useEffect(() => {
    const getRestaurantId = async () => {
      const { id } = await params;
      setRestaurantId(id);
    };
    getRestaurantId();
  }, [params]);

  if (!restaurantId) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <AppProviders restaurantId={restaurantId}>
      <RestaurantCashierContent params={params} />
    </AppProviders>
  );
}