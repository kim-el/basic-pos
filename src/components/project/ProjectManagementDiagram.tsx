'use client';

import { useState } from 'react';
import { ProjectNode, ProjectFile } from './ProjectNode';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Code2, FolderOpen } from 'lucide-react';

// Your actual POS System files mapped to interactive boxes
const posSystemFiles: ProjectFile[] = [
  // Pages
  {
    id: 'home-page',
    name: 'Home Page',
    path: 'src/app/page.tsx',
    type: 'page',
    description: 'Landing page with navigation and welcome content',
    language: 'TypeScript React',
    size: '3.2KB',
    dependencies: ['Next.js', 'Image'],
    position: { x: 200, y: 150 }
  },
  {
    id: 'pos-page',
    name: 'POS System',
    path: 'src/app/pos/page.tsx',
    type: 'page',
    description: 'Main point-of-sale interface with cart and calculator',
    language: 'TypeScript React',
    size: '8.1KB',
    dependencies: ['Calculator', 'CartItem', 'DailySales'],
    position: { x: 200, y: 350 }
  },
  {
    id: 'cashier-page',
    name: 'Cashier Interface',
    path: 'src/app/restaurant/[id]/cashier/page.tsx',
    type: 'page',
    description: 'Restaurant-specific cashier interface with real-time updates',
    language: 'TypeScript React',
    size: '12.5KB',
    dependencies: ['Calculator', 'useSocket', 'DailySales'],
    position: { x: 200, y: 550 }
  },
  {
    id: 'kitchen-page',
    name: 'Kitchen Display',
    path: 'src/app/restaurant/[id]/kitchen/page.tsx',
    type: 'page',
    description: 'Real-time order display for kitchen staff',
    language: 'TypeScript React',
    size: '5.8KB',
    dependencies: ['useSocket', 'CartItem'],
    position: { x: 200, y: 750 }
  },

  // Components
  {
    id: 'calculator',
    name: 'Calculator',
    path: 'src/components/pos/Calculator.tsx',
    type: 'component',
    description: 'Payment calculation component with change calculation',
    language: 'TypeScript React',
    size: '4.2KB',
    dependencies: ['Button', 'Card'],
    position: { x: 600, y: 200 }
  },
  {
    id: 'product-grid',
    name: 'Product Grid',
    path: 'src/components/pos/ProductGrid.tsx',
    type: 'component',
    description: 'Product selection interface with categories and search',
    language: 'TypeScript React',
    size: '6.7KB',
    dependencies: ['Card', 'Button', 'Badge', 'Tabs'],
    position: { x: 600, y: 400 }
  },
  {
    id: 'cart',
    name: 'Shopping Cart',
    path: 'src/components/pos/Cart.tsx',
    type: 'component',
    description: 'Shopping cart component with quantity management',
    language: 'TypeScript React',
    size: '3.9KB',
    dependencies: ['Button', 'Card'],
    position: { x: 600, y: 600 }
  },
  {
    id: 'checkout-dialog',
    name: 'Checkout Dialog',
    path: 'src/components/pos/CheckoutDialog.tsx',
    type: 'component',
    description: 'Payment processing and checkout modal',
    language: 'TypeScript React',
    size: '5.1KB',
    dependencies: ['Dialog', 'Button'],
    position: { x: 600, y: 800 }
  },

  // Contexts
  {
    id: 'cart-context',
    name: 'Cart Context',
    path: 'src/contexts/CartContext.tsx',
    type: 'context',
    description: 'Global shopping cart state management with reducer',
    language: 'TypeScript React',
    size: '7.3KB',
    dependencies: ['React.Context', 'useReducer'],
    position: { x: 1000, y: 150 }
  },
  {
    id: 'socket-context',
    name: 'Socket Context',
    path: 'src/contexts/SocketContext.tsx',
    type: 'context',
    description: 'WebSocket connection management for real-time updates',
    language: 'TypeScript React',
    size: '4.8KB',
    dependencies: ['Socket.IO', 'React.Context'],
    position: { x: 1000, y: 350 }
  },
  {
    id: 'restaurant-context',
    name: 'Restaurant Context',
    path: 'src/contexts/RestaurantContext.tsx',
    type: 'context',
    description: 'Restaurant-specific state and configuration management',
    language: 'TypeScript React',
    size: '3.2KB',
    dependencies: ['React.Context'],
    position: { x: 1000, y: 550 }
  },

  // Hooks
  {
    id: 'use-socket',
    name: 'useSocket Hook',
    path: 'src/hooks/useSocket.ts',
    type: 'hook',
    description: 'Custom hook for WebSocket communication and state management',
    language: 'TypeScript',
    size: '4.5KB',
    dependencies: ['Socket.IO-Client', 'React'],
    position: { x: 1000, y: 750 }
  },

  // API Routes
  {
    id: 'products-api',
    name: 'Products API',
    path: 'src/app/api/products/route.ts',
    type: 'api',
    description: 'REST endpoint for product data retrieval',
    language: 'TypeScript',
    size: '2.1KB',
    dependencies: ['Next.js', 'PostgreSQL'],
    position: { x: 1400, y: 200 }
  },
  {
    id: 'sales-api',
    name: 'Daily Sales API',
    path: 'src/app/api/daily-sales/route.ts',
    type: 'api',
    description: 'Endpoint for daily sales statistics and reporting',
    language: 'TypeScript',
    size: '1.8KB',
    dependencies: ['Next.js', 'PostgreSQL'],
    position: { x: 1400, y: 400 }
  },
  {
    id: 'transactions-api',
    name: 'Transactions API',
    path: 'src/app/api/transactions/route.ts',
    type: 'api',
    description: 'Transaction processing and storage endpoint',
    language: 'TypeScript',
    size: '3.4KB',
    dependencies: ['Next.js', 'PostgreSQL'],
    position: { x: 1400, y: 600 }
  },

  // Types
  {
    id: 'pos-types',
    name: 'POS Types',
    path: 'src/types/pos.ts',
    type: 'type',
    description: 'TypeScript interfaces for Product, Cart, Transaction, etc.',
    language: 'TypeScript',
    size: '1.2KB',
    dependencies: [],
    position: { x: 1400, y: 800 }
  },

  // Config
  {
    id: 'db-config',
    name: 'Database Config',
    path: 'src/lib/db.ts',
    type: 'config',
    description: 'PostgreSQL database connection and configuration',
    language: 'TypeScript',
    size: '0.8KB',
    dependencies: ['pg'],
    position: { x: 1800, y: 400 }
  }
];

export function ProjectManagementDiagram() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
  };

  const handleCloseChat = () => {
    setSelectedFile(null);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleReset = () => {
    setZoom(0.7);
    setPan({ x: 0, y: 0 });
    setSelectedFile(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                POS System Project Manager
              </h1>
              <p className="text-sm text-gray-600">Click any file box to start editing with AI assistance</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono px-3 py-1 bg-gray-100 rounded">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Project Canvas */}
        <div className={`${selectedFile ? 'flex-1' : 'w-full'} relative overflow-hidden transition-all duration-300`}>
          <div 
            className="w-full h-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Project Files Grid */}
            <div className="relative w-full h-full" style={{ minWidth: '2200px', minHeight: '1000px' }}>
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }} />
              </div>
              
              {/* File Nodes - Removed */}
              
              {/* Section Labels - Removed */}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface 
          selectedFile={selectedFile} 
          onClose={handleCloseChat}
        />
      </div>
    </div>
  );
}