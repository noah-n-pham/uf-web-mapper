'use client';

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CrawlResult, Subsite } from '../types/data';
import { useMap } from './MapProvider';

interface NetworkViewProps {
  data: CrawlResult;
}

// Custom node component
function CustomNode({ data }: any) {
  const isRoot = data.isRoot;
  const confidence = data.detectionConfidence;
  
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] transition-all ${
        isRoot
          ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/50'
          : confidence === 'high'
          ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30'
          : confidence === 'medium'
          ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/30'
          : 'bg-gray-500 text-white border-gray-600'
      }`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      {!isRoot && (
        <div className="text-xs opacity-90 mt-1">
          {data.pageCount} pages
        </div>
      )}
    </div>
  );
}

export default function NetworkView({ data }: NetworkViewProps) {
  const { setSelectedSubsite } = useMap();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // Generate nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root node
    nodes.push({
      id: 'root',
      type: 'custom',
      position: { x: 400, y: 50 },
      data: {
        label: 'UF College of Education',
        isRoot: true,
      },
    });

    // Calculate grid layout for subsites
    const columns = 6;
    const rowHeight = 150;
    const columnWidth = 220;
    const startX = 50;
    const startY = 250;

    data.subsites.forEach((subsite, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      nodes.push({
        id: subsite.id,
        type: 'custom',
        position: {
          x: startX + col * columnWidth,
          y: startY + row * rowHeight,
        },
        data: {
          label: subsite.title || subsite.baseUrl.split('/').filter(Boolean).pop(),
          isRoot: false,
          detectionConfidence: subsite.detectionConfidence,
          pageCount: subsite.pages.length,
          subsiteData: subsite,
        },
      });

      // Edge from root to subsite
      edges.push({
        id: `root-${subsite.id}`,
        source: 'root',
        target: subsite.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { 
          stroke: subsite.detectionConfidence === 'high' ? '#10b981' : '#f59e0b',
          strokeWidth: 2,
        },
        animated: false,
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.id !== 'root' && node.data.subsiteData) {
      setSelectedSubsite(node.data.subsiteData);
    }
  }, [setSelectedSubsite]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        className="dark:bg-gray-900"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          className="dark:opacity-20"
        />
        <Controls className="dark:bg-gray-800 dark:border-gray-700" />

        <Panel position="top-right" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 m-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Legend</h4>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Root Site</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">High Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Medium Confidence</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}

