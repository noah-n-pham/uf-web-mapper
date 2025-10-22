'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function SubsiteNode({ data }: NodeProps) {
  const isRoot = data.isRoot;
  const confidence = data.detectionConfidence;

  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-lg border-2 min-w-[200px] ${
        isRoot
          ? 'bg-blue-600 text-white border-blue-700'
          : confidence === 'high'
          ? 'bg-blue-500 text-white border-blue-600'
          : confidence === 'medium'
          ? 'bg-blue-400 text-white border-amber-500'
          : 'bg-blue-300 text-white border-blue-400'
      }`}
    >
      {!isRoot && <Handle type="target" position={Position.Left} />}
      
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-sm">{data.label}</div>
        {!isRoot && (
          <>
            <div className="text-xs opacity-90">
              {data.detectionMethod?.toUpperCase()}
            </div>
            {data.pageCount !== undefined && (
              <div className="text-xs opacity-80">
                {data.pageCount} page{data.pageCount !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

