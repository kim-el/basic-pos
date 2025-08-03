'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { CartItem } from '@/types/pos';

// Socket context interface
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  updateOrder: (items: CartItem[]) => void;
  joinRestaurant: (restaurantId: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// Create context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Socket provider component
interface SocketProviderProps {
  children: ReactNode;
  restaurantId?: string;
}

export function SocketProvider({ children, restaurantId = '' }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  // Use refs to always access current values
  const socketRef = useRef<Socket | null>(null);
  const currentRestaurantIdRef = useRef<string>(restaurantId);
  
  // Keep refs updated
  socketRef.current = socket;
  currentRestaurantIdRef.current = restaurantId;

  // Initialize socket connection
  useEffect(() => {
    if (!restaurantId || restaurantId.trim() === '') {
      console.log('⏳ SocketContext: Waiting for valid restaurantId, got:', restaurantId);
      return;
    }

    console.log('🔌 SocketContext: Creating socket connection for restaurant:', restaurantId);
    setConnectionStatus('connecting');
    
    // Initialize socket connection
    const socketInstance = io({
      path: '/socket.io',
    });

    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('✅ SocketContext: Connected to Socket.IO server for restaurant:', restaurantId);
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Join restaurant room
      socketInstance.emit('join-restaurant', restaurantId);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ SocketContext: Disconnected from Socket.IO server');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ SocketContext: Connection error:', error);
      setConnectionStatus('error');
    });

    // Cleanup on unmount or restaurantId change
    return () => {
      console.log('🧹 SocketContext: Cleaning up socket connection for restaurant:', restaurantId);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [restaurantId]);

  // Function to join a restaurant room
  const joinRestaurant = useCallback((newRestaurantId: string) => {
    const currentSocket = socketRef.current;
    
    if (currentSocket && currentSocket.connected) {
      console.log('🏨 SocketContext: Joining restaurant room:', newRestaurantId);
      currentSocket.emit('join-restaurant', newRestaurantId);
      currentRestaurantIdRef.current = newRestaurantId;
    } else {
      console.error('❌ SocketContext: Cannot join restaurant - socket not connected');
    }
  }, []);

  // Function to update order (for cashier) - uses refs to access current values
  const updateOrder = useCallback((newItems: CartItem[]) => {
    const currentSocket = socketRef.current;
    const currentRestaurantId = currentRestaurantIdRef.current;
    
    console.log('🚀 SocketContext: updateOrder called for restaurant:', currentRestaurantId, 'with', newItems.length, 'items');
    console.log('🚀 SocketContext: Socket exists:', !!currentSocket, 'Connected:', currentSocket?.connected);
    
    if (currentSocket && currentSocket.connected && currentRestaurantId && currentRestaurantId.trim() !== '') {
      console.log('🚀 SocketContext: Emitting update-order event to server');
      currentSocket.emit('update-order', {
        restaurantId: currentRestaurantId,
        items: newItems
      });
    } else {
      console.error('❌ SocketContext: Cannot send update - socket connected:', currentSocket?.connected, 'restaurantId:', currentRestaurantId);
    }
  }, []);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    updateOrder,
    joinRestaurant,
    connectionStatus
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use socket context
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}