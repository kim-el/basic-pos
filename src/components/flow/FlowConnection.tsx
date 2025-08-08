'use client';

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'uses' | 'fetches' | 'connects' | 'manages' | 'wraps';
}

interface FlowConnectionProps {
  connection: Connection;
}

const getConnectionColor = (type: Connection['type']) => {
  switch (type) {
    case 'uses':
      return '#10b981'; // green
    case 'fetches':
      return '#3b82f6'; // blue  
    case 'connects':
      return '#f59e0b'; // orange
    case 'manages':
      return '#8b5cf6'; // purple
    case 'wraps':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export function FlowConnection({ connection }: FlowConnectionProps) {
  const { from, to, type } = connection;
  
  // Calculate control points for curved line
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  // Create a smooth curve
  const controlPoint1X = from.x + (midX - from.x) * 0.5;
  const controlPoint1Y = from.y;
  const controlPoint2X = to.x - (to.x - midX) * 0.5;
  const controlPoint2Y = to.y;

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;

  return (
    <g>
      {/* Connection line */}
      <path
        d={pathData}
        stroke={getConnectionColor(type)}
        strokeWidth="2"
        fill="none"
        strokeDasharray={type === 'fetches' ? '5,5' : 'none'}
        opacity="0.7"
      />
      
      {/* Arrow head */}
      <defs>
        <marker
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
      </defs>
      
      <path
        d={pathData}
        stroke={getConnectionColor(type)}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#arrowhead-${type})`}
        opacity="0.7"
      />
      
      {/* Connection label */}
      <text
        x={midX}
        y={midY - 5}
        textAnchor="middle"
        className="text-xs fill-gray-600 font-medium"
        style={{ userSelect: 'none' }}
      >
        {type}
      </text>
    </g>
  );
}