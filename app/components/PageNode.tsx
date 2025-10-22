'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function PageNode({ data }: NodeProps) {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-full border-2 min-w-[150px] text-center ${
        data.isLive
          ? 'bg-green-500 text-white border-green-600'
          : 'bg-gray-400 text-white border-gray-500'
      }`}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="text-xs font-medium truncate">{data.label}</div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

