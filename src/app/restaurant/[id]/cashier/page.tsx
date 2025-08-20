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
  
  // Sales history state
  const [salesHistory, setSalesHistory] = useState<Array<{
    id: string;
    timestamp: string;
    amount: number;
    items: CartItem[];
  }>>([]);
  
  // History view mode state
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [currentHistorySale, setCurrentHistorySale] = useState<{
    id: string;
    timestamp: string;
    amount: number;
    items: CartItem[];
  } | null>(null);
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  // Fetch daily sales data and add demo items with delays
  useEffect(() => {
    fetchDailySales();
    
    // Add items with 1 second delays for demo video
    if (restaurantId) {
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
  }, [restaurantId]);

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

  const completeSale = () => {
    const total = getTotalPrice();
    if (total <= 0 || items.length === 0) {
      return; // Can't complete empty sale
    }

    // Create new sale record
    const newSale = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      amount: total,
      items: [...items]
    };

    // Add to sales history (most recent first)
    setSalesHistory(prev => [newSale, ...prev]);

    // Update daily sales
    setDailySales(prev => ({
      ...prev,
      total_sales: prev.total_sales + total,
      total_transactions: prev.total_transactions + 1
    }));

    // Clear current cart
    setItems([]);
    updateOrder([]);
  };

  const restoreSaleFromHistory = (sale: { id: string; timestamp: string; amount: number; items: CartItem[] }) => {
    // Switch to history view mode
    setIsHistoryMode(true);
    setCurrentHistorySale(sale);
  };

  const exitHistoryMode = () => {
    setIsHistoryMode(false);
    setCurrentHistorySale(null);
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
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">POS System</h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <p className="text-sm text-gray-300">Restaurant ID: {restaurantId}</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-300">
            <span>Sales: ${(dailySales?.total_sales || 0).toFixed(2)}</span>
            <span>Orders: {dailySales?.total_transactions || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden">
        {/* Left Side - Items Box and Voice Control */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4">
          {/* Items Box - LOCKED HEIGHT */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 flex flex-col h-[32rem] min-h-[32rem] max-h-[32rem] border border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {isHistoryMode ? `Sale History - ${currentHistorySale?.timestamp}` : 'Items'}
              </h2>
              {isHistoryMode && (
                <button
                  onClick={exitHistoryMode}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Back to Cart
                </button>
              )}
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 sm:mb-4 min-h-0">
              {(isHistoryMode ? currentHistorySale?.items || [] : items).length === 0 ? (
                <div className="text-center text-gray-400 py-6 sm:py-8">
                  <p className="text-sm sm:text-base">
                    {isHistoryMode ? 'No items in this sale' : 'No items added yet'}
                  </p>
                  {!isHistoryMode && <p className="text-xs sm:text-sm">Speak to add items</p>}
                </div>
              ) : (
                (isHistoryMode ? currentHistorySale?.items || [] : items).map((item) => (
                  <div 
                    key={`${isHistoryMode ? 'history' : 'current'}-${item.product.id}`} 
                    onClick={isHistoryMode ? undefined : () => removeItem(item.product.id)}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors ${
                      isHistoryMode 
                        ? 'bg-gray-700 border border-gray-600' 
                        : 'bg-gray-700 hover:bg-red-900 cursor-pointer group'
                    }`}
                  >
                    <div className="flex-1 min-w-0 max-w-[40%]">
                      <h3 className={`font-semibold text-lg sm:text-xl truncate transition-colors ${
                        isHistoryMode 
                          ? 'text-gray-200' 
                          : 'text-white group-hover:text-red-300'
                      }`}>{item.product.name}</h3>
                      <p className={`text-sm sm:text-base font-medium transition-colors ${
                        isHistoryMode 
                          ? 'text-gray-400' 
                          : 'text-gray-300 group-hover:text-red-400'
                      }`}>${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      {!isHistoryMode && (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.product.id, item.quantity - 1);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900 text-red-300 flex items-center justify-center hover:bg-red-800 transition-colors text-lg font-semibold"
                          >
                            −
                          </button>
                          <span className="w-8 sm:w-10 text-center font-bold text-lg sm:text-xl group-hover:text-red-300 text-white transition-colors">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.product.id, item.quantity + 1);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-900 text-green-300 flex items-center justify-center hover:bg-green-800 transition-colors text-lg font-semibold"
                          >
                            +
                          </button>
                        </div>
                      )}
                      {isHistoryMode && (
                        <span className="w-8 sm:w-10 text-center font-bold text-lg sm:text-xl text-gray-200">
                          {item.quantity}
                        </span>
                      )}
                      <p className={`font-bold text-lg sm:text-xl ml-4 text-right min-w-[100px] transition-colors ${
                        isHistoryMode 
                          ? 'text-gray-200' 
                          : 'text-blue-400 group-hover:text-red-400'
                      }`}>${(item.product.price * item.quantity).toFixed(2)}</p>
                      {!isHistoryMode && (
                        <div className="text-red-400 group-hover:text-red-300 text-xl font-bold transition-colors ml-2">
                          ×
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Total */}
            <div className="border-t-2 border-gray-600 pt-4 sm:pt-5">
              <div className="flex justify-between items-center text-2xl sm:text-3xl lg:text-4xl font-bold">
                <span className="text-white">Total:</span>
                <span className={isHistoryMode ? "text-gray-200" : "text-blue-400"}>
                  ${isHistoryMode ? (currentHistorySale?.amount.toFixed(2) || '0.00') : getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Voice Control and Sales History */}
          <div className="flex gap-3 sm:gap-4">
            {/* Voice Control */}
            <div className="flex-1">
              <VoiceControl onVoiceCommand={simulateVoiceCommand} />
            </div>
            
            {/* Sales History */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 h-48 sm:h-52 lg:h-56 flex flex-col border border-gray-700">
                <div className="mb-3 sm:mb-4">
                  <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Sales History
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  {salesHistory.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">
                      <p className="text-sm">No sales yet today</p>
                      <p className="text-xs">Complete a sale to see history</p>
                    </div>
                  ) : (
                    salesHistory.map((sale) => (
                      <div 
                        key={sale.id} 
                        onClick={() => restoreSaleFromHistory(sale)}
                        className="flex justify-between items-center p-2 bg-gray-700 hover:bg-blue-900 rounded text-sm cursor-pointer transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-300 group-hover:text-blue-300">{sale.timestamp}</span>
                          <span className="text-xs text-gray-400 group-hover:text-blue-400">{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="font-semibold text-green-400 group-hover:text-blue-400">${sale.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Today&apos;s Total:</span>
                    <span className="font-bold text-blue-400">${(dailySales?.total_sales || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Calculator - LOCKED HEIGHT */}
        <div className="w-full lg:w-96 order-first lg:order-last h-[32rem] min-h-[32rem] max-h-[32rem]">
          <Calculator 
            totalAmount={isHistoryMode ? (currentHistorySale?.amount || 0) : getTotalPrice()}
            onChangeCalculated={(change) => {
              console.log('Change calculated:', change);
            }}
            onCompleteSale={isHistoryMode ? undefined : completeSale}
            isDisabled={isHistoryMode}
          />
        </div>
      </div>
    </div>
  );
}