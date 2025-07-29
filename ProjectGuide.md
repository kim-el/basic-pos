# Project Guide: Multi-Tenant POS System with Real-Time Sync

## Overview
This document provides a comprehensive guide for building a multi-tenant Point of Sale (POS) system with real-time synchronization between cashier, customer, and kitchen displays using Next.js 15, Socket.IO, and React.

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Real-time Communication**: Socket.IO
- **Server**: Custom Node.js server with Socket.IO integration
- **State Management**: React hooks with custom useSocket hook
- **UI Components**: Custom components with shadcn/ui base

### Core Components
1. **Cashier Interface** (`/restaurant/[id]/cashier`)
2. **Customer Display** (`/restaurant/[id]/customer`) 
3. **Kitchen Display** (`/restaurant/[id]/kitchen`)
4. **Calculator Component** (POS-style payment interface)
5. **Socket.IO Server** (Real-time communication hub)

## Implementation Journey & Solutions

### Phase 1: Initial Setup and Basic UI

**Goal**: Create basic POS interface with item management

**Implementation**:
- Set up Next.js 15 project with TypeScript
- Create calculator component mimicking real POS systems
- Implement basic cart functionality with add/remove/update operations

**Key Files**:
- `src/components/pos/Calculator.tsx` - POS-style calculator
- `src/app/pos/page.tsx` - Initial single-screen POS
- `src/types/pos.ts` - TypeScript interfaces

### Phase 2: Multi-Tenant Architecture

**Goal**: Support multiple restaurants with isolated data

**Challenge**: How to structure routes for multi-tenancy

**Solution**: 
```
/restaurant/[id]/cashier
/restaurant/[id]/customer
/restaurant/[id]/kitchen
```

**Implementation**:
- Dynamic routes with restaurant ID parameter
- Isolated state per restaurant
- Restaurant-specific Socket.IO rooms

**Key Files**:
- `src/app/restaurant/[id]/cashier/page.tsx`
- `src/app/restaurant/[id]/customer/page.tsx`
- `src/app/restaurant/[id]/kitchen/page.tsx`

### Phase 3: Real-Time Synchronization

**Goal**: Sync cart changes between all screens instantly

**Major Challenge**: Next.js 15 Async Params Breaking Change

**Problem**: 
```typescript
// This broke in Next.js 15
export default function Component({ params }: { params: { id: string } }) {
  const restaurantId = params.id; // Error: params is now a Promise
}
```

**Solution**: 
```typescript
// Fixed approach
export default function Component({ params }: { params: Promise<{ id: string }> }) {
  const [restaurantId, setRestaurantId] = useState<string>('');
  
  useEffect(() => {
    const getRestaurantId = async () => {
      const { id } = await params;
      setRestaurantId(id);
    };
    getRestaurantId();
  }, [params]);
}
```

**Socket.IO Implementation**:

**Server Setup** (`server.js`):
```javascript
const io = new Server(server, {
  cors: {
    origin: `http://${hostname}:${port}`,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // Join restaurant-specific room
  socket.on('join-restaurant', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
  });

  // Handle order updates
  socket.on('update-order', (data) => {
    const { restaurantId, items } = data;
    restaurantOrders.set(restaurantId, items);
    // Broadcast to all clients in restaurant room
    io.to(`restaurant-${restaurantId}`).emit('order-updated', items);
  });
});
```

**Custom Hook** (`src/hooks/useSocket.ts`):
```typescript
export function useSocket(restaurantId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!restaurantId || restaurantId.trim() === '') {
      return; // Wait for valid restaurant ID
    }

    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join-restaurant', restaurantId);
    });

    socketInstance.on('order-updated', (updatedItems) => {
      setItems(updatedItems);
    });

    return () => socketInstance.disconnect();
  }, [restaurantId]);

  const updateOrder = useCallback((newItems: CartItem[]) => {
    if (socket && socket.connected && restaurantId) {
      socket.emit('update-order', {
        restaurantId,
        items: newItems
      });
    }
  }, [socket, restaurantId]);

  return { socket, items, setItems, updateOrder, isConnected };
}
```

### Phase 4: Critical Bug Fixes

#### Bug 1: React Hooks Order Violation

**Problem**: Conditional hook usage breaking React's rules
```typescript
// WRONG - breaks Rules of Hooks
const socketData = restaurantId ? useSocket(restaurantId) : { /* fallback */ };
```

**Error**: "React has detected a change in the order of Hooks"

**Solution**: Always call hooks, handle empty state internally
```typescript
// CORRECT - hooks called consistently
const { items, setItems, updateOrder, isConnected } = useSocket(restaurantId);
// Handle empty restaurantId inside the hook
```

#### Bug 2: Socket.IO Timing Race Condition

**Problem**: `updateOrder` called before socket connection established

**Symptoms**:
```
🚀 updateOrder called for restaurant:  with 1 items
🚀 Socket exists: false restaurantId: 
❌ Cannot send update - socket: false restaurantId:
```

**Root Cause**: useSocket hook initialized with empty `restaurantId`, causing:
1. Socket connects with no restaurant context
2. Restaurant ID arrives later, requires reconnection
3. Race condition between connection and updateOrder calls

**Solution**: Enhanced validation in useSocket
```typescript
useEffect(() => {
  if (!restaurantId || restaurantId.trim() === '') {
    console.log('⏳ Waiting for valid restaurantId');
    return; // Don't connect until we have valid ID
  }
  // ... rest of connection logic
}, [restaurantId]);

const updateOrder = useCallback((newItems: CartItem[]) => {
  if (socket && socket.connected && restaurantId && restaurantId.trim() !== '') {
    socket.emit('update-order', { restaurantId, items: newItems });
  } else {
    console.error('❌ Cannot send update - waiting for connection');
  }
}, [socket, restaurantId]);
```

#### Bug 3: Programmatic Item Addition State Issues

**Problem**: Adding multiple items programmatically resulted in only the last item appearing

**Root Cause**: Closure problem with React state updates
```typescript
// BROKEN - each setTimeout captures stale state
setTimeout(() => addItem('Burger', 1, 18.99), 1000);
setTimeout(() => addItem('Pizza', 1, 24.99), 2000);
// Result: Only Pizza appears (overwrites Burger)
```

**Debugging Process**:
1. Added extensive console logging
2. Traced updateOrder calls: `[Burger x1]` → `[Pizza x1]` (not `[Burger x1, Pizza x1]`)
3. Identified stale closure in `addItem` function

**Solution**: Functional state updates
```typescript
// FIXED - uses current state
setTimeout(() => {
  setItems(prev => {
    const newItems = [...prev, {
      product: { id: 1, name: 'Burger', price: 18.99, /* ... */ },
      quantity: 1
    }];
    updateOrder(newItems);
    return newItems;
  });
}, 1000);
```

### Phase 5: Kitchen Display Enhancement

**Goal**: Transform cart items into kitchen workflow

**Implementation**: Component mapping system
```typescript
const menuComponents: Record<string, Array<{packageId: number, component: string, station: string}>> = {
  'Burger': [
    { packageId: 20, component: 'Beef Patty', station: 'grill' },
    { packageId: 11, component: 'Fries', station: 'fry' }
  ],
  'Pizza': [
    { packageId: 34, component: 'Pizza', station: 'grill' }
  ]
  // ...
};
```

**Features**:
- Station-based organization (grill, fry, salad, beverage)
- Timer display for each item
- Package ID system for tracking
- Ready button to complete items

## Development Best Practices Learned

### 1. Next.js 15 Migration
- Always `await params` in dynamic route components
- Handle async params with useEffect, not direct access
- Test thoroughly when upgrading Next.js versions

### 2. Socket.IO Integration
- Always validate connection state before emitting
- Use rooms for multi-tenant isolation
- Handle reconnection scenarios gracefully
- Add extensive debugging logs during development

### 3. React State Management
- Use functional updates for async operations
- Avoid closure issues with timers/callbacks
- Prefer useCallback for functions passed to useEffect dependencies
- Always call hooks in the same order (Rules of Hooks)

### 4. Debugging Strategies
- Console.log everything during development
- Use unique prefixes for different components (`🚀`, `📦`, `❌`)
- Log both function calls and their parameters
- Trace state changes through the application flow

## Common Pitfalls & Solutions

### Issue: Items Not Syncing Between Screens
**Check**:
1. Socket connection status (`isConnected`)
2. Restaurant ID validity (not empty/undefined)
3. Room joining (`join-restaurant` event)
4. Server broadcast to correct room

### Issue: React Hooks Errors
**Check**:
1. Conditional hook usage
2. Async component patterns
3. Hook call order consistency
4. Dependencies in useEffect/useCallback

### Issue: State Updates Not Working
**Check**:
1. Closure issues with setTimeout/setInterval
2. Stale state in callbacks
3. Functional vs direct state updates
4. Race conditions between updates

## File Structure
```
src/
├── app/
│   ├── pos/page.tsx                    # Original single-screen POS
│   └── restaurant/[id]/
│       ├── cashier/page.tsx           # Main POS interface
│       ├── customer/page.tsx          # Customer display
│       └── kitchen/page.tsx           # Kitchen workflow
├── components/
│   ├── pos/
│   │   ├── Calculator.tsx             # POS-style calculator
│   │   ├── Cart.tsx                   # Cart management
│   │   └── ProductGrid.tsx            # Product selection
│   └── ui/                            # Base UI components
├── hooks/
│   └── useSocket.ts                   # Socket.IO integration
├── types/
│   └── pos.ts                         # TypeScript interfaces
└── lib/
    └── utils.ts                       # Utility functions

server.js                              # Custom Socket.IO server
```

## Running the Project

### Development
```bash
# Start the custom server (includes Socket.IO)
node server.js

# Access different interfaces:
# Cashier: http://localhost:3000/restaurant/123/cashier
# Customer: http://localhost:3000/restaurant/123/customer  
# Kitchen: http://localhost:3000/restaurant/123/kitchen
```

### Testing Real-Time Sync
1. Open cashier and customer screens in separate tabs
2. Add items in cashier interface
3. Verify items appear immediately in customer display
4. Check kitchen display for component breakdown

### Voice Command Testing
Access browser console and run:
```javascript
addItem("add burger")  // Add burger
addItem("add pizza")   // Add pizza  
addItem("clear all")   // Clear cart
```

## Future Enhancements

### Immediate Improvements
- Error handling for network failures
- Offline mode support
- Payment processing integration
- Order history persistence

### Advanced Features
- Multi-location support
- Inventory management
- Analytics dashboard
- Mobile responsiveness
- Print receipt functionality

## Lessons Learned

1. **Framework Updates Matter**: Next.js 15 breaking changes required significant refactoring
2. **Real-time is Complex**: Socket.IO timing issues are subtle and require careful state management
3. **React Rules are Strict**: Hooks order violations break everything
4. **Debug Early**: Extensive logging saved hours of debugging
5. **State Closures**: Async operations with React state require functional updates
6. **Multi-tenancy Planning**: Early architecture decisions impact entire system

## Conclusion

This POS system demonstrates successful integration of modern web technologies for real-time multi-tenant applications. The key to success was methodical debugging, understanding framework changes, and proper state management patterns.

The most critical insight: **Real-time applications require careful coordination between client state, server state, and network communication**. Every state update must be validated, every connection must be monitored, and every error must be handled gracefully.

---

*Generated during development session with Claude Code - January 2025*