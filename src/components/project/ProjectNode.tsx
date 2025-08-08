'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Folder, 
  Code, 
  Database,
  Settings,
  Zap,
  Globe,
  Layout
} from 'lucide-react';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'component' | 'page' | 'api' | 'config' | 'style' | 'hook' | 'context' | 'type';
  description: string;
  language?: string;
  size?: string;
  lastModified?: string;
  dependencies?: string[];
  position: { x: number; y: number };
}

interface ProjectNodeProps {
  file: ProjectFile;
  isSelected?: boolean;
  onSelect?: (file: ProjectFile) => void;
}

const getFileIcon = (type: ProjectFile['type']) => {
  switch (type) {
    case 'component':
      return <Layout className="h-5 w-5" />;
    case 'page':
      return <Globe className="h-5 w-5" />;
    case 'api':
      return <Database className="h-5 w-5" />;
    case 'config':
      return <Settings className="h-5 w-5" />;
    case 'style':
      return <FileText className="h-5 w-5" />;
    case 'hook':
      return <Zap className="h-5 w-5" />;
    case 'context':
      return <Settings className="h-5 w-5" />;
    case 'type':
      return <Code className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const getNodeColor = (type: ProjectFile['type']) => {
  switch (type) {
    case 'component':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'page':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'api':
      return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
    case 'config':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    case 'style':
      return 'bg-pink-50 border-pink-200 hover:bg-pink-100';
    case 'hook':
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    case 'context':
      return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
    case 'type':
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    default:
      return 'bg-white border-gray-200 hover:bg-gray-50';
  }
};

const getBadgeColor = (type: ProjectFile['type']) => {
  switch (type) {
    case 'component':
      return 'bg-blue-100 text-blue-800';
    case 'page':
      return 'bg-green-100 text-green-800';
    case 'api':
      return 'bg-orange-100 text-orange-800';
    case 'config':
      return 'bg-purple-100 text-purple-800';
    case 'style':
      return 'bg-pink-100 text-pink-800';
    case 'hook':
      return 'bg-yellow-100 text-yellow-800';
    case 'context':
      return 'bg-indigo-100 text-indigo-800';
    case 'type':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ProjectNode({ file, isSelected = false, onSelect }: ProjectNodeProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: file.position.x,
        top: file.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      className="z-10"
    >
      <Card 
        className={`
          w-80 cursor-pointer transition-all duration-200 
          ${getNodeColor(file.type)}
          ${isSelected ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'shadow-lg hover:shadow-xl'}
        `}
        onClick={() => onSelect?.(file)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-gray-900 truncate">
                  {file.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {file.description}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ml-2 ${getBadgeColor(file.type)}`}
            >
              {file.type}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {file.path}
              </span>
              {file.size && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {file.size}
                </span>
              )}
            </div>
            
            {file.language && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Language:</span>
                <Badge variant="outline" className="text-xs">
                  {file.language}
                </Badge>
              </div>
            )}
            
            {file.dependencies && file.dependencies.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Uses:</span>
                <div className="flex flex-wrap gap-1">
                  {file.dependencies.slice(0, 3).map(dep => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                  {file.dependencies.length > 3 && (
                    <span className="text-xs text-gray-500">+{file.dependencies.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}