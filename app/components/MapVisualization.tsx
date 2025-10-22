'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CrawlResult } from '../types/data';
import SubsiteNode from './SubsiteNode';
import PageNode from './PageNode';
import DetailPanel from './DetailPanel';

interface MapVisualizationProps {
  data: CrawlResult;
}

export default function MapVisualization({ data }: MapVisualizationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      subsite: SubsiteNode,
      page: PageNode,
    }),
    []
  );

  // Generate nodes and edges from data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root node
    nodes.push({
      id: 'root',
      type: 'subsite',
      position: { x: 0, y: 300 },
      data: {
        label: 'UF College of Education',
        url: data.root,
        isRoot: true,
        detectionMethod: null,
        detectionConfidence: null,
        isLive: true,
      },
    });

    // Subsite nodes
    data.subsites.forEach((subsite, subsiteIndex) => {
      const subsiteNodeId = `subsite-${subsite.id}`;
      
      nodes.push({
        id: subsiteNodeId,
        type: 'subsite',
        position: { x: 400, y: subsiteIndex * 250 },
        data: {
          label: subsite.title || subsite.baseUrl,
          url: subsite.baseUrl,
          isRoot: false,
          detectionMethod: subsite.detectionMethod,
          detectionConfidence: subsite.detectionConfidence,
          isLive: subsite.isLive,
          pageCount: subsite.pages.length,
        },
      });

      // Edge from root to subsite
      edges.push({
        id: `root-${subsiteNodeId}`,
        source: 'root',
        target: subsiteNodeId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#64748b', strokeWidth: 2 },
      });

      // Page nodes for this subsite
      subsite.pages.slice(0, 10).forEach((page, pageIndex) => {
        const pageNodeId = `page-${subsite.id}-${pageIndex}`;
        
        nodes.push({
          id: pageNodeId,
          type: 'page',
          position: { x: 800, y: subsiteIndex * 250 + pageIndex * 60 - 150 },
          data: {
            label: page.title || page.path,
            url: page.url,
            path: page.path,
            isLive: page.isLive,
            outboundLinks: page.outboundLinks,
          },
        });

        // Edge from subsite to page
        edges.push({
          id: `${subsiteNodeId}-${pageNodeId}`,
          source: subsiteNodeId,
          target: pageNodeId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#94a3b8', strokeWidth: 1 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    const term = searchTerm.toLowerCase();
    return nodes.filter((node) => {
      const label = node.data.label?.toLowerCase() || '';
      const url = node.data.url?.toLowerCase() || '';
      return label.includes(term) || url.includes(term);
    });
  }, [nodes, searchTerm]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="w-full h-screen relative">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />

        {/* Search Panel */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">UF COE Web Mapper</h3>
            <input
              type="text"
              placeholder="Search subsites or pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-sm text-gray-600">
              <p>Subsites: {data.subsiteCount}</p>
              <p>
                Total Pages:{' '}
                {data.subsites.reduce((sum, s) => sum + s.pages.length, 0)}
              </p>
              <p className="text-xs mt-1">
                Last crawl: {new Date(data.crawlTimestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Panel>

        {/* Legend Panel */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 m-4">
          <h4 className="font-semibold mb-2">Legend</h4>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Root / Subsite</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Page</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 rounded"></div>
              <span>Medium confidence</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Detail Panel */}
      {selectedNode && (
        <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

