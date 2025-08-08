'use client';

import { useState } from 'react';
import { FlowNode, FlowNodeData } from './FlowNode';
import { FlowConnection } from './FlowConnection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Define the POS system architecture as nodes
const posSystemNodes: FlowNodeData[] = [
  // Pages
  {
    id: 'home',
    type: 'page',
    title: 'Home Page',
    description: 'Landing page with navigation',
    file: 'src/app/page.tsx',
    position: { x: 200, y: 100 }
  },
  {
    id: 'pos',
    type: 'page', 
    title: 'POS Page',
    description: 'Main POS interface',
    file: 'src/app/pos/page.tsx',
    position: { x: 200, y: 300 }
  },
  {
    id: 'cashier',
    type: 'page',
    title: 'Cashier Page', 
    description: 'Restaurant-specific cashier interface',
    file: 'src/app/restaurant/[id]/cashier/page.tsx',
    position: { x: 200, y: 500 }
  },
  {
    id: 'kitchen',
    type: 'page',
    title: 'Kitchen Display',
    description: 'Real-time order display for kitchen',
    file: 'src/app/restaurant/[id]/kitchen/page.tsx', 
    position: { x: 200, y: 700 }
  },
  {
    id: 'customer',
    type: 'page',
    title: 'Customer Display',
    description: 'Order status for customers',
    file: 'src/app/restaurant/[id]/customer/page.tsx',
    position: { x: 200, y: 900 }
  },

  // Components
  {
    id: 'calculator',
    type: 'component',
    title: 'Calculator',
    description: 'Payment calculation component',
    file: 'src/components/pos/Calculator.tsx',
    position: { x: 600, y: 300 }
  },
  {
    id: 'productGrid',
    type: 'component', 
    title: 'Product Grid',
    description: 'Product selection interface',
    file: 'src/components/pos/ProductGrid.tsx',
    position: { x: 600, y: 500 }
  },
  {
    id: 'cart',
    type: 'component',
    title: 'Cart',
    description: 'Shopping cart component', 
    file: 'src/components/pos/Cart.tsx',
    position: { x: 600, y: 700 }
  },

  // UI Components
  {
    id: 'button',
    type: 'component',
    title: 'Button UI',
    description: 'Reusable button component',
    file: 'src/components/ui/button.tsx',
    position: { x: 1000, y: 400 }
  },
  {
    id: 'card',
    type: 'component',
    title: 'Card UI', 
    description: 'Card layout component',
    file: 'src/components/ui/card.tsx',
    position: { x: 1000, y: 600 }
  },

  // Contexts
  {
    id: 'cartContext',
    type: 'context',
    title: 'Cart Context',
    description: 'Global cart state management',
    file: 'src/contexts/CartContext.tsx',
    position: { x: 600, y: 100 }
  },
  {
    id: 'socketContext',
    type: 'context',
    title: 'Socket Context',
    description: 'WebSocket connection management', 
    file: 'src/contexts/SocketContext.tsx',
    position: { x: 600, y: 900 }
  },

  // Hooks
  {
    id: 'useSocket',
    type: 'hook',
    title: 'useSocket Hook',
    description: 'WebSocket communication logic',
    file: 'src/hooks/useSocket.ts', 
    position: { x: 1000, y: 800 }
  },

  // APIs
  {
    id: 'productsApi',
    type: 'api',
    title: 'Products API',
    description: 'Product data endpoint',
    file: 'src/app/api/products/route.ts',
    position: { x: 1000, y: 200 }
  },
  {
    id: 'salesApi', 
    type: 'api',
    title: 'Sales API',
    description: 'Daily sales statistics',
    file: 'src/app/api/daily-sales/route.ts',
    position: { x: 1000, y: 100 }
  },

  // Database
  {
    id: 'database',
    type: 'database',
    title: 'PostgreSQL',
    description: 'Main database storage',
    file: 'src/lib/db.ts',
    position: { x: 1400, y: 150 }
  }
];

// Define connections between nodes
const connections = [
  // Pages use components
  { from: 'pos', to: 'calculator', type: 'uses' as const },
  { from: 'pos', to: 'cart', type: 'uses' as const },
  { from: 'cashier', to: 'calculator', type: 'uses' as const },
  { from: 'cashier', to: 'productGrid', type: 'uses' as const },
  
  // Components use UI components
  { from: 'calculator', to: 'button', type: 'uses' as const },
  { from: 'calculator', to: 'card', type: 'uses' as const },
  { from: 'productGrid', to: 'button', type: 'uses' as const },
  { from: 'productGrid', to: 'card', type: 'uses' as const },
  { from: 'cart', to: 'button', type: 'uses' as const },
  
  // Pages use contexts
  { from: 'cashier', to: 'cartContext', type: 'uses' as const },
  { from: 'cashier', to: 'socketContext', type: 'uses' as const },
  
  // Socket communication
  { from: 'cashier', to: 'useSocket', type: 'uses' as const },
  { from: 'kitchen', to: 'useSocket', type: 'uses' as const },
  { from: 'customer', to: 'useSocket', type: 'uses' as const },
  { from: 'useSocket', to: 'socketContext', type: 'manages' as const },
  
  // API connections
  { from: 'productGrid', to: 'productsApi', type: 'fetches' as const },
  { from: 'pos', to: 'salesApi', type: 'fetches' as const },
  { from: 'cashier', to: 'salesApi', type: 'fetches' as const },
  
  // Database connections
  { from: 'productsApi', to: 'database', type: 'connects' as const },
  { from: 'salesApi', to: 'database', type: 'connects' as const }
];

export function POSFlowDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Get connections for drawing
  const getConnectionCoords = () => {
    return connections.map(conn => {
      const fromNode = posSystemNodes.find(n => n.id === conn.from);
      const toNode = posSystemNodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return null;
      
      return {
        from: { x: fromNode.position.x + 128, y: fromNode.position.y }, // +128 for right edge
        to: { x: toNode.position.x - 128, y: toNode.position.y }, // -128 for left edge
        type: conn.type
      };
    }).filter(Boolean);
  };

  const selectedNodeData = selectedNode ? posSystemNodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS System Architecture</h1>
          <p className="text-sm text-gray-600">Interactive flow diagram showing component relationships</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono px-2">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Flow Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="w-full h-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center'
            }}
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {getConnectionCoords().map((conn, index) => (
                conn && <FlowConnection key={index} connection={conn} />
              ))}
            </svg>
            
            {/* Nodes */}
            <div className="relative w-full h-full" style={{ minWidth: '1600px', minHeight: '1000px' }}>
              {posSystemNodes.map(node => (
                <FlowNode
                  key={node.id}
                  data={node}
                  isSelected={selectedNode === node.id}
                  onSelect={handleNodeSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {selectedNodeData && (
          <div className="w-80 bg-white border-l p-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedNodeData.title}</CardTitle>
                  <Badge variant="secondary">{selectedNodeData.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{selectedNodeData.description}</p>
                  </div>
                  
                  {selectedNodeData.file && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">File Path</h4>
                      <code className="text-xs bg-gray-100 p-2 rounded block">
                        {selectedNodeData.file}
                      </code>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Connections</h4>
                    <div className="space-y-1">
                      {connections.filter(c => c.from === selectedNodeData.id).map(conn => (
                        <div key={conn.to} className="text-xs flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{conn.type}</Badge>
                          <span>{posSystemNodes.find(n => n.id === conn.to)?.title}</span>
                        </div>
                      ))}
                      {connections.filter(c => c.to === selectedNodeData.id).map(conn => (
                        <div key={conn.from} className="text-xs flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">used by</Badge>
                          <span>{posSystemNodes.find(n => n.id === conn.from)?.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}