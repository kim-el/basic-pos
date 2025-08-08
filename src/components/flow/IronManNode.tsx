'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Users, 
  Bot,
  Shield
} from 'lucide-react';

export interface IronManNodeData {
  id: string;
  type: 'Person' | 'Company' | 'Group' | 'AI' | 'Armor';
  name: string;
  description?: string;
  position: { x: number; y: number };
}

interface IronManNodeProps {
  data: IronManNodeData;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const getNodeIcon = (type: IronManNodeData['type']) => {
  switch (type) {
    case 'Person':
      return <User className="h-5 w-5" />;
    case 'Company':
      return <Building className="h-5 w-5" />;
    case 'Group':
      return <Users className="h-5 w-5" />;
    case 'AI':
      return <Bot className="h-5 w-5" />;
    case 'Armor':
      return <Shield className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

const getNodeColor = (type: IronManNodeData['type']) => {
  switch (type) {
    case 'Person':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'Company':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'Group':
      return 'bg-red-50 border-red-200 hover:bg-red-100';
    case 'AI':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    case 'Armor':
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }
};

const getBadgeColor = (type: IronManNodeData['type']) => {
  switch (type) {
    case 'Person':
      return 'bg-blue-100 text-blue-800';
    case 'Company':
      return 'bg-green-100 text-green-800';
    case 'Group':
      return 'bg-red-100 text-red-800';
    case 'AI':
      return 'bg-purple-100 text-purple-800';
    case 'Armor':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCharacterImage = (name: string) => {
  // You could add character images here
  const avatarMap: Record<string, string> = {
    'Tony Stark': '🦾',
    'Pepper Potts': '👩‍💼',
    'Obadiah Stane': '🕴️',
    'Yinsen': '👨‍⚕️',
    'J.A.R.V.I.S.': '🤖',
    'James Rhodes': '✈️',
    'Stark Industries': '🏭',
    'Ten Rings': '💀',
    'Mark I': '🤖'
  };
  
  return avatarMap[name] || '👤';
};

export function IronManNode({ data, isSelected = false, onSelect }: IronManNodeProps) {
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
          w-72 cursor-pointer transition-all duration-200 
          ${getNodeColor(data.type)}
          ${isSelected ? 'ring-2 ring-red-500 shadow-xl scale-105' : 'shadow-lg hover:shadow-xl'}
        `}
        onClick={() => onSelect?.(data.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getCharacterImage(data.name)}</div>
              <div>
                <CardTitle className="text-lg font-bold">{data.name}</CardTitle>
                {data.description && (
                  <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                )}
              </div>
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
          <div className="flex items-center space-x-2 text-gray-500">
            {getNodeIcon(data.type)}
            <span className="text-sm font-medium">{data.type}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Connection points */}
      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white border-2 border-red-400 rounded-full transform -translate-y-1/2"></div>
      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-2 border-red-400 rounded-full transform -translate-y-1/2"></div>
    </div>
  );
}