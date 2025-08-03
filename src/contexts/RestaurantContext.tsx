'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailySales } from '@/types/pos';

// Restaurant context interface
interface RestaurantContextType {
  restaurantId: string;
  setRestaurantId: (id: string) => void;
  dailySales: DailySales;
  setDailySales: (sales: DailySales) => void;
  fetchDailySales: () => Promise<void>;
  isLoading: boolean;
}

// Create context
const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Restaurant provider component
interface RestaurantProviderProps {
  children: ReactNode;
  initialRestaurantId?: string;
}

export function RestaurantProvider({ children, initialRestaurantId = '' }: RestaurantProviderProps) {
  const [restaurantId, setRestaurantId] = useState<string>(initialRestaurantId);
  const [dailySales, setDailySales] = useState<DailySales>({
    total_sales: 0,
    total_transactions: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch daily sales data
  const fetchDailySales = async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    try {
      const url = restaurantId 
        ? `/api/daily-sales?restaurant=${restaurantId}`
        : '/api/daily-sales';
      
      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch daily sales when restaurant ID changes
  useEffect(() => {
    if (restaurantId) {
      fetchDailySales();
    }
  }, [restaurantId]);

  const contextValue: RestaurantContextType = {
    restaurantId,
    setRestaurantId,
    dailySales,
    setDailySales,
    fetchDailySales,
    isLoading
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
}

// Custom hook to use restaurant context
export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}