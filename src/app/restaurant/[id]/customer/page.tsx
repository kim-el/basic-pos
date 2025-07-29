'use client';

import { useState, useEffect } from 'react';
import { CartItem, DailySales } from '@/types/pos';
import { useSocket } from '@/hooks/useSocket';

interface CustomerDisplayProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RestaurantCustomer({ params }: CustomerDisplayProps) {
  const [restaurantId, setRestaurantId] = useState<string>('');
  const { items, isConnected } = useSocket(restaurantId);

  // Extract restaurantId from params
  useEffect(() => {
    const getRestaurantId = async () => {
      const { id } = await params;
      setRestaurantId(id);
    };
    getRestaurantId();
  }, [params]);

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Show loading state until we have restaurantId
  if (!restaurantId) {
    return <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-lg text-gray-600">Your Order</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-sm text-gray-500">Restaurant {restaurantId}</p>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Items Display */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Your Items</h2>
            
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-xl">No items yet</p>
                <p className="text-sm">Your order will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {item.quantity} × ${item.product.price.toFixed(2)}
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total Display */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="text-center">
                <p className="text-xl font-medium mb-2">Total Amount</p>
                <p className="text-5xl font-bold">${getTotalPrice().toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Branding Section */}
          <div className="text-center mt-8 text-gray-600">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-lg font-medium">Thank you for dining with us!</p>
            <p className="text-sm">Restaurant {restaurantId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}