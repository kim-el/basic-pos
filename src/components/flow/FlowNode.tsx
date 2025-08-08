'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Globe, 
  Layers, 
  Zap, 
  FileText, 
  Monitor,
  Settings,
  Workflow,
  Code,
  Server
} from 'lucide-react';

export interface FlowNodeData {
  id: string;
  type: 'page' | 'component' | 'context' | 'api' | 'database' | 'hook' | 'type';
  title: string;
  description: string;
  file?: string;
  position: { x: number; y: number };
  connections?: string[];
}

interface FlowNodeProps {
  data: FlowNodeData;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const getNodeIcon = (type: FlowNodeData['type']) => {
  switch (type) {
    case 'page':
      return <Monitor className="h-4 w-4" />;
    case 'component':
      return <Layers className="h-4 w-4" />;
    case 'context':
      return <Settings className="h-4 w-4" />;
    case 'api':
      return <Server className="h-4 w-4" />;
    case 'database':
      return <Database className="h-4 w-4" />;
    case 'hook':
      return <Zap className="h-4 w-4" />;
    case 'type':
      return <Code className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getNodeColor = (type: FlowNodeData['type']) => {
  switch (type) {
    case 'page':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'component':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'context':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    case 'api':
      return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
    case 'database':
      return 'bg-red-50 border-red-200 hover:bg-red-100';
    case 'hook':
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    case 'type':
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    default:
      return 'bg-white border-gray-200 hover:bg-gray-50';
  }
};

const getBadgeColor = (type: FlowNodeData['type']) => {
  switch (type) {
    case 'page':
      return 'bg-blue-100 text-blue-800';
    case 'component':
      return 'bg-green-100 text-green-800';
    case 'context':
      return 'bg-purple-100 text-purple-800';
    case 'api':
      return 'bg-orange-100 text-orange-800';
    case 'database':
      return 'bg-red-100 text-red-800';
    case 'hook':
      return 'bg-yellow-100 text-yellow-800';
    case 'type':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function FlowNode({ data, isSelected = false, onSelect }: FlowNodeProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: data.position.x,
        top: data.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      className="z-10"
    >
      <Card 
        className={`
          w-64 cursor-pointer transition-all duration-200 
          ${getNodeColor(data.type)}
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'shadow-md hover:shadow-lg'}
        `}
        onClick={() => onSelect?.(data.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getNodeIcon(data.type)}
              <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getBadgeColor(data.type)}`}
            >
              {data.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600 mb-2">{data.description}</p>
          {data.file && (
            <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
              {data.file}
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Connection points */}
      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"></div>
      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"></div>
    </div>
  );
}