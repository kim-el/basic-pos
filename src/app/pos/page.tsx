'use client';

import { useState, useEffect } from 'react';
import { Calculator } from '@/components/pos/Calculator';
import { Product, CartItem, Transaction, DailySales } from '@/types/pos';

export default function POSSystem() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [dailySales, setDailySales] = useState<DailySales>({
    total_sales: 0,
    total_transactions: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });

  // Fetch daily sales data
  useEffect(() => {
    fetchDailySales();
    // Add sample items for testing
    addItem('Coffee', 2, 15.50);
    addItem('Sandwich', 1, 34.50);
    addItem('Soda', 3, 4.25);
    addItem('Pizza', 1, 28.75);
  }, []);

  const fetchDailySales = async () => {
    try {
      const response = await fetch('/api/daily-sales');
      const data = await response.json();
      setDailySales(data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    }
  };

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
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.product.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Voice POS System</h1>
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
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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