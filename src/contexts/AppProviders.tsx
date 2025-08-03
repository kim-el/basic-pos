'use client';

import { ReactNode } from 'react';
import { CartProvider } from './CartContext';
import { RestaurantProvider } from './RestaurantContext';
import { SocketProvider } from './SocketContext';

interface AppProvidersProps {
  children: ReactNode;
  restaurantId?: string;
}

export function AppProviders({ children, restaurantId = '' }: AppProvidersProps) {
  return (
    <RestaurantProvider initialRestaurantId={restaurantId}>
      <SocketProvider restaurantId={restaurantId}>
        <CartProvider>
          {children}
        </CartProvider>
      </SocketProvider>
    </RestaurantProvider>
  );
}