const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const port = process.argv[2] || process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory storage for restaurant orders
const restaurantOrders = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join restaurant room
    socket.on('join-restaurant', (restaurantId) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
      
      // Send current order state to new client
      const currentOrder = restaurantOrders.get(restaurantId) || [];
      socket.emit('order-updated', currentOrder);
    });

    // Handle order updates from cashier
    socket.on('update-order', (data) => {
      const { restaurantId, items } = data;
      console.log(`📦 Received update-order for restaurant-${restaurantId}:`, items.length, 'items');
      console.log('📦 Items:', items.map(item => `${item.product.name} x${item.quantity}`));
      
      // Update in-memory storage
      restaurantOrders.set(restaurantId, items);
      console.log(`💾 Stored in memory for restaurant-${restaurantId}:`, restaurantOrders.get(restaurantId)?.length || 0, 'items');
      
      // Broadcast to all clients in restaurant room
      io.to(`restaurant-${restaurantId}`).emit('order-updated', items);
      console.log(`📡 Broadcasted to restaurant-${restaurantId} room:`, items.length, 'items');
      
      // Debug: Show all connected sockets in this room
      const room = io.sockets.adapter.rooms.get(`restaurant-${restaurantId}`);
      console.log(`👥 Clients in restaurant-${restaurantId} room:`, room ? room.size : 0);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});