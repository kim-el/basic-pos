'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/types/pos';
import { useSocket } from '@/hooks/useSocket';

interface KitchenDisplayProps {
  params: Promise<{
    id: string;
  }>;
}

interface KitchenItem {
  packageId: number;
  component: string;
  station: string;
  orderId: string;
  quantity: number;
  notes?: string;
  timestamp: Date;
}

export default function RestaurantKitchen({ params }: KitchenDisplayProps) {
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
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);

  // Component mapping - convert menu items to kitchen components
  const menuComponents: Record<string, Array<{packageId: number, component: string, station: string}>> = {
    'Burger': [
      { packageId: 20, component: 'Beef Patty', station: 'grill' },
      { packageId: 11, component: 'Fries', station: 'fry' }
    ],
    'French Fries': [
      { packageId: 11, component: 'Fries', station: 'fry' }
    ],
    'Coca Cola': [
      { packageId: 45, component: 'Drink', station: 'beverage' }
    ],
    'Pizza': [
      { packageId: 34, component: 'Pizza', station: 'grill' }
    ],
    'Steak': [
      { packageId: 35, component: 'Steak', station: 'grill' }
    ]
  };

  // Convert cart items to kitchen items when order changes
  useEffect(() => {
    const newKitchenItems: KitchenItem[] = [];
    
    items.forEach((cartItem, index) => {
      const components = menuComponents[cartItem.product.name] || [
        { packageId: 99, component: cartItem.product.name, station: 'prep' }
      ];
      
      components.forEach(comp => {
        newKitchenItems.push({
          packageId: comp.packageId + index, // Make unique
          component: comp.component,
          station: comp.station,
          orderId: '1234', // In real app, would be actual order ID
          quantity: cartItem.quantity,
          timestamp: new Date()
        });
      });
    });
    
    setKitchenItems(newKitchenItems);
  }, [items]);

  const getItemsByStation = (station: string) => {
    return kitchenItems.filter(item => item.station === station);
  };

  const markItemReady = (packageId: number) => {
    setKitchenItems(prev => prev.filter(item => item.packageId !== packageId));
  };

  const getTimerDisplay = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const stations = [
    { name: 'grill', title: 'Grill Station', color: 'bg-red-500' },
    { name: 'fry', title: 'Fry Station', color: 'bg-yellow-500' },
    { name: 'salad', title: 'Salad Station', color: 'bg-green-500' },
    { name: 'beverage', title: 'Beverage Station', color: 'bg-blue-500' }
  ];

  // Show loading state until we have restaurantId
  if (!restaurantId) {
    return <div className="h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Display</h1>
          <div className="flex items-center justify-center space-x-2 mt-1">
            <p className="text-lg text-gray-600">Restaurant {restaurantId}</p>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
          {stations.map((station) => {
            const stationItems = getItemsByStation(station.name);
            return (
              <div key={station.name} className="bg-white rounded-lg shadow-lg flex flex-col">
                {/* Station Header */}
                <div className={`${station.color} text-white p-4 rounded-t-lg`}>
                  <h2 className="text-xl font-bold text-center">{station.title}</h2>
                  <p className="text-center text-sm opacity-90">
                    {stationItems.length} items pending
                  </p>
                </div>

                {/* Station Items */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {stationItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">✅</div>
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    stationItems.map((item) => (
                      <div key={item.packageId} className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-lg text-gray-900">
                            [Package {item.packageId}]
                          </div>
                          <div className="text-sm text-gray-600">
                            Order #{item.orderId}
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {item.component}
                          </h3>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm text-blue-600 italic">
                              Notes: {item.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm font-mono text-gray-600">
                            Timer: {getTimerDisplay(item.timestamp)}
                          </div>
                          <button
                            onClick={() => markItemReady(item.packageId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-semibold transition-colors text-sm"
                          >
                            READY
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}