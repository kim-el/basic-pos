'use client';

import { useState, useEffect } from 'react';
import { Calculator } from '@/components/pos/Calculator';
import { VoiceControl } from '@/components/pos/VoiceControl';
import { Product, CartItem, DailySales } from '@/types/pos';
import { useSocket } from '@/hooks/useSocket';

interface POSSystemProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RestaurantCashier({ params }: POSSystemProps) {
  const [restaurantId, setRestaurantId] = useState<string>('');
  const { items, setItems, updateOrder, isConnected } = useSocket(restaurantId);

  // Extract restaurantId from params
  useEffect(() => {
    const getRestaurantId = async () => {
      const { id } = await params;
      setRestaurantId(id);
    };
    getRestaurantId();
  }, [params]);
  
  const [dailySales, setDailySales] = useState<DailySales>({
    total_sales: 0,
    total_transactions: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  // Fetch daily sales data and add demo items with delays
  useEffect(() => {
    fetchDailySales();
    
    // Add items with 1 second delays for demo video
    if (isConnected && restaurantId) {
      // Clear any existing items first
      setItems([]);
      updateOrder([]);
      
      // Add items progressively using functional updates
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev, {
            product: { id: 1, name: 'Burger', price: 18.99, category: 'food', description: '', image_url: '', stock_quantity: 100, is_active: true },
            quantity: 1
          }];
          updateOrder(newItems);
          return newItems;
        });
      }, 1000);
      
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev, {
            product: { id: 2, name: 'Pizza', price: 24.99, category: 'food', description: '', image_url: '', stock_quantity: 100, is_active: true },
            quantity: 1
          }];
          updateOrder(newItems);
          return newItems;
        });
      }, 2000);
      
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev, {
            product: { id: 3, name: 'Ravioli', price: 22.50, category: 'food', description: '', image_url: '', stock_quantity: 100, is_active: true },
            quantity: 1
          }];
          updateOrder(newItems);
          return newItems;
        });
      }, 3000);
      
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev, {
            product: { id: 4, name: 'Orange Juice', price: 4.25, category: 'beverage', description: '', image_url: '', stock_quantity: 100, is_active: true },
            quantity: 2
          }];
          updateOrder(newItems);
          return newItems;
        });
      }, 4000);
      
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev, {
            product: { id: 5, name: 'Wagyu Tomahawk', price: 89.99, category: 'food', description: '', image_url: '', stock_quantity: 100, is_active: true },
            quantity: 1
          }];
          updateOrder(newItems);
          return newItems;
        });
      }, 5000);
    }
  }, [isConnected, restaurantId]);

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
        const emptyItems: CartItem[] = [];
        setItems(emptyItems);
        updateOrder(emptyItems);
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

  const fetchDailySales = async () => {
    try {
      const response = await fetch(`/api/daily-sales?restaurant=${restaurantId}`);
      const data = await response.json();
      setDailySales(data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    }
  };

  const addItem = (name: string, quantity: number, price: number) => {
    const newItem: CartItem = {
      product: {
        id: Date.now(),
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
    const newItems = [...items, newItem];
    console.log('📦 CASHIER: About to add item and call updateOrder');
    console.log('📦 CASHIER: updateOrder function exists:', typeof updateOrder);
    setItems(newItems);
    updateOrder(newItems);
    console.log('📦 CASHIER: updateOrder called with', newItems.length, 'items');
  };

  const removeItem = (id: number) => {
    const newItems = items.filter(item => item.product.id !== id);
    setItems(newItems);
    updateOrder(newItems);
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const newItems = items.map(item =>
      item.product.id === id
        ? { ...item, quantity }
        : item
    );
    setItems(newItems);
    updateOrder(newItems);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

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
      <div className="bg-white shadow-sm border-b p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">POS System</h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <p className="text-sm text-gray-600">Restaurant ID: {restaurantId}</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
            <span>Sales: ${(dailySales?.total_sales || 0).toFixed(2)}</span>
            <span>Orders: {dailySales?.total_transactions || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden">
        {/* Left Side - Items Box and Voice Control */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4">
          {/* Items Box */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col h-96 sm:h-[26rem] lg:h-[32rem]">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Items</h2>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 sm:mb-4 min-h-0">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <p className="text-sm sm:text-base">No items added yet</p>
                  <p className="text-xs sm:text-sm">Speak to add items</p>
                </div>
              ) : (
                items.map((item) => (
                  <div 
                    key={item.product.id} 
                    onClick={() => removeItem(item.product.id)}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-700 text-lg sm:text-xl truncate transition-colors">{item.product.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 group-hover:text-red-600 font-medium transition-colors">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-3 sm:space-x-4 ml-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.product.id, item.quantity - 1);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors text-lg font-semibold"
                        >
                          −
                        </button>
                        <span className="w-8 sm:w-10 text-center font-bold text-lg sm:text-xl group-hover:text-red-700 transition-colors">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.product.id, item.quantity + 1);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors text-lg font-semibold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="font-bold text-lg sm:text-xl text-blue-600 group-hover:text-red-600 transition-colors">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="text-red-500 group-hover:text-red-700 ml-2 text-xl font-bold transition-colors">
                        ×
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Total */}
            <div className="border-t-2 pt-4 sm:pt-5">
              <div className="flex justify-between items-center text-2xl sm:text-3xl lg:text-4xl font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Voice Control - Below Items */}
          <VoiceControl onVoiceCommand={simulateVoiceCommand} />
        </div>

        {/* Right Side - Calculator */}
        <div className="w-full lg:w-96 order-first lg:order-last">
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