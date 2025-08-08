'use client';

import { useState } from 'react';
import { IronManNode, IronManNodeData } from './IronManNode';
import { FlowConnection } from './FlowConnection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Zap } from 'lucide-react';

// Iron Man universe nodes
const ironManNodes: IronManNodeData[] = [
  // People
  {
    id: 'tony',
    type: 'Person',
    name: 'Tony Stark',
    description: 'Genius, billionaire, playboy, philanthropist',
    position: { x: 600, y: 400 }
  },
  {
    id: 'pepper',
    type: 'Person',
    name: 'Pepper Potts',
    description: 'Personal assistant and later CEO',
    position: { x: 300, y: 200 }
  },
  {
    id: 'stane',
    type: 'Person',
    name: 'Obadiah Stane',
    description: 'Business partner turned enemy',
    position: { x: 900, y: 200 }
  },
  {
    id: 'yinsen',
    type: 'Person',
    name: 'Yinsen',
    description: 'Doctor who helped Tony escape',
    position: { x: 300, y: 600 }
  },
  {
    id: 'rhodey',
    type: 'Person',
    name: 'James Rhodes',
    description: 'Military friend and War Machine',
    position: { x: 900, y: 600 }
  },

  // AI
  {
    id: 'jarvis',
    type: 'AI',
    name: 'J.A.R.V.I.S.',
    description: 'Tony\'s AI assistant',
    position: { x: 600, y: 600 }
  },

  // Organizations
  {
    id: 'starkIndustries',
    type: 'Company',
    name: 'Stark Industries',
    description: 'Weapons manufacturer turned clean energy',
    position: { x: 600, y: 100 }
  },
  {
    id: 'tenRings',
    type: 'Group',
    name: 'Ten Rings',
    description: 'Terrorist organization',
    position: { x: 100, y: 400 }
  },

  // Armor
  {
    id: 'mark1',
    type: 'Armor',
    name: 'Mark I',
    description: 'First Iron Man armor built in cave',
    position: { x: 600, y: 800 }
  }
];

// Extended connection type for Iron Man relationships
type IronManConnectionType = 
  | 'CEO_OF' | 'ASSISTANT_OF' | 'BUSINESS_PARTNER_OF' | 'AI_ASSISTANT_OF' 
  | 'FRIEND_OF' | 'BUILT' | 'USED_BY' | 'BOARD_MEMBER_OF' 
  | 'SECRETLY_WORKS_WITH' | 'STOLE' | 'KIDNAPPED' | 'HELPED_ESCAPE';

// Define relationships
const ironManConnections: Array<{from: string, to: string, type: IronManConnectionType}> = [
  // Tony's relationships
  { from: 'tony', to: 'starkIndustries', type: 'CEO_OF' },
  { from: 'pepper', to: 'tony', type: 'ASSISTANT_OF' },
  { from: 'stane', to: 'tony', type: 'BUSINESS_PARTNER_OF' },
  { from: 'jarvis', to: 'tony', type: 'AI_ASSISTANT_OF' },
  { from: 'rhodey', to: 'tony', type: 'FRIEND_OF' },
  { from: 'tony', to: 'mark1', type: 'BUILT' },
  { from: 'mark1', to: 'tony', type: 'USED_BY' },
  
  // Stane's betrayal
  { from: 'stane', to: 'starkIndustries', type: 'BOARD_MEMBER_OF' },
  { from: 'stane', to: 'tenRings', type: 'SECRETLY_WORKS_WITH' },
  { from: 'stane', to: 'mark1', type: 'STOLE' },
  
  // Kidnapping and escape
  { from: 'tenRings', to: 'tony', type: 'KIDNAPPED' },
  { from: 'yinsen', to: 'tony', type: 'HELPED_ESCAPE' }
];

const getConnectionColor = (type: IronManConnectionType) => {
  switch (type) {
    case 'CEO_OF':
    case 'BOARD_MEMBER_OF':
      return '#10b981'; // green - business
    case 'ASSISTANT_OF':
    case 'FRIEND_OF':
    case 'AI_ASSISTANT_OF':
      return '#3b82f6'; // blue - positive relationships
    case 'BUILT':
    case 'USED_BY':
      return '#8b5cf6'; // purple - creation/usage
    case 'HELPED_ESCAPE':
      return '#06d6a0'; // teal - heroic
    case 'SECRETLY_WORKS_WITH':
    case 'STOLE':
    case 'KIDNAPPED':
      return '#ef4444'; // red - negative/evil
    case 'BUSINESS_PARTNER_OF':
      return '#f59e0b'; // orange - neutral business
    default:
      return '#6b7280'; // gray
  }
};

export function IronManFlowDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleReset = () => {
    setZoom(0.8);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Get connections for drawing with Iron Man specific colors
  const getConnectionCoords = () => {
    return ironManConnections.map(conn => {
      const fromNode = ironManNodes.find(n => n.id === conn.from);
      const toNode = ironManNodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return null;
      
      return {
        from: { x: fromNode.position.x + 144, y: fromNode.position.y },
        to: { x: toNode.position.x - 144, y: toNode.position.y },
        type: conn.type,
        color: getConnectionColor(conn.type)
      };
    }).filter(Boolean);
  };

  const selectedNodeData = selectedNode ? ironManNodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                Iron Man Knowledge Graph
              </h1>
              <p className="text-sm text-gray-600">Interactive character relationship visualization</p>
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
              <defs>
                {/* Define arrow markers for each connection type */}
                {Array.from(new Set(ironManConnections.map(c => c.type))).map(type => (
                  <marker
                    key={type}
                    id={`arrowhead-${type}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={getConnectionColor(type)}
                    />
                  </marker>
                ))}
              </defs>
              
              {getConnectionCoords().map((conn, index) => {
                if (!conn) return null;
                
                const { from, to, type, color } = conn;
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                const controlPoint1X = from.x + (midX - from.x) * 0.5;
                const controlPoint1Y = from.y;
                const controlPoint2X = to.x - (to.x - midX) * 0.5;
                const controlPoint2Y = to.y;
                
                const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;
                
                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      stroke={color}
                      strokeWidth="3"
                      fill="none"
                      markerEnd={`url(#arrowhead-${type})`}
                      opacity="0.8"
                    />
                    <text
                      x={midX}
                      y={midY - 8}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-700"
                      style={{ userSelect: 'none' }}
                    >
                      {type.replace(/_/g, ' ')}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Nodes */}
            <div className="relative w-full h-full" style={{ minWidth: '1200px', minHeight: '900px' }}>
              {ironManNodes.map(node => (
                <IronManNode
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
          <div className="w-96 bg-white border-l p-4 shadow-lg">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span className="text-2xl">
                      {selectedNodeData.name === 'Tony Stark' && '🦾'}
                      {selectedNodeData.name === 'Pepper Potts' && '👩‍💼'}
                      {selectedNodeData.name === 'Obadiah Stane' && '🕴️'}
                      {selectedNodeData.name === 'Yinsen' && '👨‍⚕️'}
                      {selectedNodeData.name === 'J.A.R.V.I.S.' && '🤖'}
                      {selectedNodeData.name === 'James Rhodes' && '✈️'}
                      {selectedNodeData.name === 'Stark Industries' && '🏭'}
                      {selectedNodeData.name === 'Ten Rings' && '💀'}
                      {selectedNodeData.name === 'Mark I' && '🤖'}
                    </span>
                    <span>{selectedNodeData.name}</span>
                  </CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    {selectedNodeData.type}
                  </Badge>
                </div>
                {selectedNodeData.description && (
                  <p className="text-gray-600 mt-2">{selectedNodeData.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-800">Outgoing Relationships</h4>
                    <div className="space-y-2">
                      {ironManConnections.filter(c => c.from === selectedNodeData.id).map(conn => {
                        const targetNode = ironManNodes.find(n => n.id === conn.to);
                        return (
                          <div key={conn.to} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: getConnectionColor(conn.type) }}
                            >
                              {conn.type.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-sm">{targetNode?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-800">Incoming Relationships</h4>
                    <div className="space-y-2">
                      {ironManConnections.filter(c => c.to === selectedNodeData.id).map(conn => {
                        const sourceNode = ironManNodes.find(n => n.id === conn.from);
                        return (
                          <div key={conn.from} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: getConnectionColor(conn.type) }}
                            >
                              {conn.type.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-sm">{sourceNode?.name}</span>
                          </div>
                        );
                      })}
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