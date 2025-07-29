import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { CartItem } from '@/types/pos';

export function useSocket(restaurantId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use refs to always access current values
  const socketRef = useRef<Socket | null>(null);
  const restaurantIdRef = useRef<string>(restaurantId);
  
  // Keep refs updated
  socketRef.current = socket;
  restaurantIdRef.current = restaurantId;

  useEffect(() => {
    // Only create socket connection if we have a valid restaurantId
    if (!restaurantId || restaurantId.trim() === '') {
      console.log('⏳ Waiting for valid restaurantId, got:', restaurantId);
      return;
    }

    console.log('Creating socket connection for restaurant:', restaurantId);
    
    // Initialize socket connection
    const socketInstance = io({
      path: '/socket.io',
    });

    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server for restaurant:', restaurantId);
      setIsConnected(true);
      
      // Join restaurant room
      socketInstance.emit('join-restaurant', restaurantId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Listen for order updates
    socketInstance.on('order-updated', (updatedItems: CartItem[]) => {
      console.log('Order updated for restaurant', restaurantId, ':', updatedItems);
      setItems(updatedItems);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection for restaurant:', restaurantId);
      socketInstance.disconnect();
    };
  }, [restaurantId]);

  // Function to update order (for cashier) - uses refs to access current values
  const updateOrder = useCallback((newItems: CartItem[]) => {
    const currentSocket = socketRef.current;
    const currentRestaurantId = restaurantIdRef.current;
    
    console.log('🚀 updateOrder called for restaurant:', currentRestaurantId, 'with', newItems.length, 'items');
    console.log('🚀 Socket exists:', !!currentSocket, 'Connected:', currentSocket?.connected);
    console.log('🚀 Items to send:', newItems.map(item => `${item.product.name} x${item.quantity}`));
    
    if (currentSocket && currentSocket.connected && currentRestaurantId && currentRestaurantId.trim() !== '') {
      console.log('🚀 Emitting update-order event to server');
      currentSocket.emit('update-order', {
        restaurantId: currentRestaurantId,
        items: newItems
      });
    } else {
      console.error('❌ Cannot send update - socket connected:', currentSocket?.connected, 'restaurantId:', currentRestaurantId);
      console.error('❌ Waiting for socket connection and valid restaurant ID');
    }
  }, []);

  return {
    socket,
    items,
    setItems,
    updateOrder,
    isConnected
  };
}