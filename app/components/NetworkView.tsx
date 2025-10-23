'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  MarkerType,
  NodeTypes,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CrawlResult } from '../types/data';
import { useMap } from './MapProvider';
import { ChevronDown, ChevronRight, Search, ChevronLeft, ChevronRight as ChevronRightIcon, X, Undo2, Layers } from 'lucide-react';

interface NetworkViewProps {
  data: CrawlResult;
}

interface NodeHistoryItem {
  nodeId: string;
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

// Color palette for clusters (vibrant and distinct)
const clusterColors = [
  { main: 'from-blue-500 to-blue-600', border: 'border-blue-700', shadow: 'shadow-blue-500/40', page: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100' },
  { main: 'from-emerald-500 to-emerald-600', border: 'border-emerald-700', shadow: 'shadow-emerald-500/40', page: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100' },
  { main: 'from-purple-500 to-purple-600', border: 'border-purple-700', shadow: 'shadow-purple-500/40', page: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100' },
  { main: 'from-pink-500 to-pink-600', border: 'border-pink-700', shadow: 'shadow-pink-500/40', page: 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-100' },
  { main: 'from-orange-500 to-orange-600', border: 'border-orange-700', shadow: 'shadow-orange-500/40', page: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100' },
  { main: 'from-teal-500 to-teal-600', border: 'border-teal-700', shadow: 'shadow-teal-500/40', page: 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100' },
  { main: 'from-indigo-500 to-indigo-600', border: 'border-indigo-700', shadow: 'shadow-indigo-500/40', page: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100' },
  { main: 'from-cyan-500 to-cyan-600', border: 'border-cyan-700', shadow: 'shadow-cyan-500/40', page: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100' },
];

// Custom node components
function SubsiteNode({ data, selected }: any) {
  const isExpanded = data.isExpanded;
  const isSearchMatch = data.isSearchMatch;
  const colorScheme = clusterColors[data.colorIndex % clusterColors.length];
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`px-8 py-6 rounded-2xl border-3 shadow-2xl min-w-[260px] max-w-[280px] bg-gradient-to-br transition-all ${
        isSearchMatch
          ? 'from-amber-400 to-amber-500 border-amber-600 ring-4 ring-amber-300 dark:ring-amber-500 scale-110'
          : `${colorScheme.main} ${colorScheme.border} ${colorScheme.shadow}`
      } ${selected || isExpanded ? 'scale-110 ring-2 ring-white/30' : ''} text-white cursor-pointer`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 drop-shadow-lg" />
          ) : (
            <ChevronRight className="w-6 h-6 drop-shadow-lg" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base leading-tight line-clamp-3 break-words mb-2 drop-shadow-md">
            {data.label}
          </div>
          <div className="text-sm opacity-95 font-semibold">
            {data.pageCount} page{data.pageCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="text-xs opacity-85 mt-2 pl-9 italic">Click to collapse</div>
      )}
    </motion.div>
  );
}

function PageNode({ data }: any) {
  const isSearchMatch = data.isSearchMatch;
  const colorScheme = clusterColors[data.colorIndex % clusterColors.length];
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`px-4 py-3 rounded-xl border-2 shadow-lg min-w-[180px] max-w-[200px] transition-all cursor-pointer ${
        isSearchMatch
          ? 'bg-amber-300 dark:bg-amber-600 text-amber-900 dark:text-amber-50 border-amber-500 ring-4 ring-amber-300 shadow-amber-500/50 scale-110'
          : colorScheme.page
      }`}
    >
      <div className="text-xs font-bold truncate drop-shadow-sm">
        {data.label}
      </div>
      <div className="text-xs mt-1 opacity-75">
        {data.isLive ? '✓ Live' : '○ Offline'}
      </div>
    </motion.div>
  );
}

export default function NetworkView({ data }: NetworkViewProps) {
  const { setSelectedSubsite } = useMap();
  const [expandedSubsites, setExpandedSubsites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [nodeHistory, setNodeHistory] = useState<NodeHistoryItem[]>([]);
  const [showOnlyExpanded, setShowOnlyExpanded] = useState(false);
  const { fitView, setCenter, getNodes, setNodes: rfSetNodes } = useReactFlow();
  
  const nodeHistoryRef = useRef<NodeHistoryItem[]>([]);

  useEffect(() => {
    nodeHistoryRef.current = nodeHistory;
  }, [nodeHistory]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      subsite: SubsiteNode,
      page: PageNode,
    }),
    []
  );

  // Hexagonal grid positioning for subsites (even distribution, no overlap)
  const calculateHexagonalPosition = (index: number) => {
    // Hexagonal grid parameters
    const hexWidth = 650;   // Horizontal spacing (wide enough for expanded clusters)
    const hexHeight = 550;  // Vertical spacing
    const cols = 9;         // Number of columns
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Hexagonal offset (odd rows shifted right by half width)
    const xOffset = (row % 2) * (hexWidth / 2);
    
    return {
      x: 150 + col * hexWidth + xOffset,
      y: 150 + row * hexHeight,
    };
  };

  // Calculate circular orbit for pages around their parent subsite
  const calculatePageOrbit = (subsitePos: { x: number; y: number }, pageIndex: number, totalPages: number, layer: number = 0) => {
    const orbitRadius = 220 + (layer * 80); // Multiple layers if many pages
    const pagesPerLayer = 8;
    const currentLayer = Math.floor(pageIndex / pagesPerLayer);
    const indexInLayer = pageIndex % pagesPerLayer;
    const angleStep = (2 * Math.PI) / Math.min(totalPages, pagesPerLayer);
    const angle = indexInLayer * angleStep - Math.PI / 2; // Start from top
    
    return {
      x: subsitePos.x + (orbitRadius + currentLayer * 80) * Math.cos(angle),
      y: subsitePos.y + (orbitRadius + currentLayer * 80) * Math.sin(angle),
    };
  };

  // Generate hexagonal multi-cluster layout
  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Filter subsites if needed
    let subsitesToShow = data.subsites;
    if (showOnlyExpanded && expandedSubsites.size > 0) {
      subsitesToShow = data.subsites.filter((_, idx) => 
        expandedSubsites.has(`subsite-${data.subsites[idx].id}`)
      );
    }

    subsitesToShow.forEach((subsite, subsiteIndex) => {
      const subsiteId = `subsite-${subsite.id}`;
      const isExpanded = expandedSubsites.has(subsiteId);
      const isSubsiteMatch = searchMatches.includes(subsiteId);
      const colorIndex = data.subsites.indexOf(subsite); // Use original index for consistent colors

      // Calculate hexagonal position for this subsite
      const subsitePos = calculateHexagonalPosition(subsiteIndex);

      generatedNodes.push({
        id: subsiteId,
        type: 'subsite',
        position: subsitePos,
        data: {
          label: subsite.title?.split('|')[0]?.split('–')[0]?.trim()?.substring(0, 50) || 
                 subsite.baseUrl.split('/').filter(Boolean).pop() || 'Site',
          pageCount: subsite.pages.length,
          subsiteData: subsite,
          isExpanded,
          isSearchMatch: isSubsiteMatch,
          colorIndex,
        },
        draggable: true,
      });

      // Add pages if expanded (orbit around parent in their own local cluster)
      if (isExpanded) {
        const pagesToShow = subsite.pages.slice(0, 32); // Max 32 pages (4 layers of 8)

        pagesToShow.forEach((page, pageIndex) => {
          const pageId = `page-${subsite.id}-${pageIndex}`;
          const isPageMatch = searchMatches.includes(pageId);

          // Calculate local orbit position around THIS subsite
          const layer = Math.floor(pageIndex / 8);
          const pagePos = calculatePageOrbit(subsitePos, pageIndex, pagesToShow.length, layer);

          generatedNodes.push({
            id: pageId,
            type: 'page',
            position: pagePos,
            data: {
              label: page.title?.substring(0, 40) || page.path,
              url: page.url,
              isLive: page.isLive,
              pageData: page,
              isSearchMatch: isPageMatch,
              colorIndex,
            },
            draggable: false,
          });

          // Curved edge from subsite to page (local connection)
          generatedEdges.push({
            id: `${subsiteId}-${pageId}`,
            source: subsiteId,
            target: pageId,
            type: 'smoothstep',
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              color: isPageMatch ? '#f59e0b' : '#94a3b8',
              width: 12,
              height: 12,
            },
            style: {
              stroke: isPageMatch ? '#f59e0b' : '#cbd5e1',
              strokeWidth: isPageMatch ? 3 : 1.5,
              opacity: isPageMatch ? 1 : 0.5,
            },
            animated: isPageMatch,
          });
        });
      }
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [data, expandedSubsites, searchMatches, showOnlyExpanded]);

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, , onEdgesChange] = useEdgesState(edges);

  // Update nodes when generated nodes change
  useEffect(() => {
    setNodesState(nodes);
  }, [nodes, setNodesState]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches: string[] = [];
    const lowerTerm = term.toLowerCase();

    data.subsites.forEach((subsite) => {
      const subsiteId = `subsite-${subsite.id}`;
      
      if (
        subsite.title?.toLowerCase().includes(lowerTerm) ||
        subsite.baseUrl.toLowerCase().includes(lowerTerm)
      ) {
        matches.push(subsiteId);
      }

      if (expandedSubsites.has(subsiteId)) {
        subsite.pages.forEach((page, pageIndex) => {
          if (
            page.title?.toLowerCase().includes(lowerTerm) ||
            page.path.toLowerCase().includes(lowerTerm) ||
            page.url.toLowerCase().includes(lowerTerm)
          ) {
            matches.push(`page-${subsite.id}-${pageIndex}`);
          }
        });
      }
    });

    setSearchMatches(matches);
    setCurrentMatchIndex(0);

    if (matches.length > 0) {
      setTimeout(() => {
        const currentNodes = getNodes();
        const matchNode = currentNodes.find(n => n.id === matches[0]);
        if (matchNode) {
          setCenter(matchNode.position.x, matchNode.position.y, { zoom: 0.7, duration: 1000 });
        }
      }, 100);
    }
  }, [data.subsites, expandedSubsites, setCenter, getNodes]);

  // Navigate between search matches
  const navigateMatches = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    const newIndex = direction === 'next'
      ? (currentMatchIndex + 1) % searchMatches.length
      : (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;

    setCurrentMatchIndex(newIndex);

    setTimeout(() => {
      const currentNodes = getNodes();
      const matchNode = currentNodes.find(n => n.id === searchMatches[newIndex]);
      if (matchNode) {
        setCenter(matchNode.position.x, matchNode.position.y, { zoom: 0.7, duration: 1000 });
      }
    }, 50);
  }, [searchMatches, currentMatchIndex, setCenter, getNodes]);

  // Undo last node move
  const handleUndo = useCallback(() => {
    const history = nodeHistoryRef.current;
    if (history.length === 0) return;

    const lastMove = history[history.length - 1];
    const currentNodes = getNodes();
    
    const updatedNodes = currentNodes.map(node => {
      if (node.id === lastMove.nodeId) {
        return {
          ...node,
          position: lastMove.oldPosition,
        };
      }
      return node;
    });

    rfSetNodes(updatedNodes);
    setNodeHistory(prev => prev.slice(0, -1));
  }, [getNodes, rfSetNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        e.preventDefault();
        setSearchTerm('');
        setSearchMatches([]);
        setCurrentMatchIndex(0);
        document.getElementById('network-search')?.blur();
        return;
      }

      if (isTyping) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('network-search')?.focus();
        return;
      }

      if (searchMatches.length > 0) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          navigateMatches('next');
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateMatches('prev');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, searchMatches, navigateMatches]);

  // Track node movements
  const handleNodesChange = useCallback((changes: any[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false && change.position) {
        const nodeId = change.id;
        const oldPos = nodes.find(n => n.id === nodeId)?.position;
        
        if (oldPos && (Math.abs(oldPos.x - change.position.x) > 5 || Math.abs(oldPos.y - change.position.y) > 5)) {
          setNodeHistory(prev => [...prev.slice(-10), {
            nodeId,
            oldPosition: oldPos,
            newPosition: change.position,
          }]);
        }
      }
    });

    onNodesChange(changes);
  }, [onNodesChange, nodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === 'subsite' && node.data.subsiteData) {
      const subsiteId = node.id;
      
      setExpandedSubsites(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subsiteId)) {
          newSet.delete(subsiteId);
        } else {
          newSet.add(subsiteId);
        }
        return newSet;
      });
      
      setSelectedSubsite(node.data.subsiteData);
    }
  }, [setSelectedSubsite]);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set(data.subsites.map((s) => `subsite-${s.id}`));
    setExpandedSubsites(allIds);
  }, [data.subsites]);

  const handleCollapseAll = useCallback(() => {
    setExpandedSubsites(new Set());
  }, []);

  const visibleNodeCount = useMemo(() => {
    let count = (showOnlyExpanded && expandedSubsites.size > 0) ? expandedSubsites.size : data.subsiteCount;
    expandedSubsites.forEach(id => {
      const subsite = data.subsites.find((s) => `subsite-${s.id}` === id);
      if (subsite) {
        count += Math.min(subsite.pages.length, 32);
      }
    });
    return count;
  }, [expandedSubsites, data, showOnlyExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-[calc(100vh-10rem)]"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.05}
        maxZoom={1.5}
        className="transition-colors"
        style={{ background: 'var(--bg-secondary)' }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={30} 
          size={2}
          className="opacity-30"
          style={{ color: 'var(--border-secondary)' }}
        />
        <Controls 
          className="backdrop-blur-sm rounded-xl shadow-2xl border"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'var(--border-secondary)'
          }}
        />
        <MiniMap 
          className="backdrop-blur-sm rounded-xl shadow-2xl border"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'var(--border-secondary)'
          }}
          maskColor="rgba(212, 204, 196, 0.15)"
          nodeColor={(node) => {
            if (node.type === 'subsite') {
              const colors = ['#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#06b6d4'];
              return colors[node.data.colorIndex % colors.length];
            }
            return '#e2e8f0';
          }}
        />

        {/* Search & Controls Panel */}
        <Panel position="top-left" className="backdrop-blur-sm rounded-2xl p-6 m-4 border w-[400px]" style={{
          background: 'rgba(255, 255, 255, 0.97)',
          borderColor: 'var(--border-secondary)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div className="flex items-center gap-3 mb-5">
            <Search className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
            <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Search & Navigate
            </h4>
          </div>
          
          <div className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <input
                id="network-search"
                type="text"
                placeholder="Search subsites and pages..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-opacity-50"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderWidth: '2px',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchMatches([]);
                    setCurrentMatchIndex(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search results */}
            {searchMatches.length > 0 && (
              <div className="flex items-center justify-between rounded-xl p-3 border-2" style={{
                background: 'linear-gradient(to right, #fff9f0, #fef3c7)',
                borderColor: '#fbbf24'
              }}>
                <span className="text-sm font-bold" style={{ color: '#78350f' }}>
                  {currentMatchIndex + 1} / {searchMatches.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMatches('prev')}
                    className="p-2 rounded-lg bg-white hover:bg-amber-100 transition-all shadow-md"
                    style={{ color: '#d97706' }}
                    title="Previous (↑ or ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateMatches('next')}
                    className="p-2 rounded-lg bg-white hover:bg-amber-100 transition-all shadow-md"
                    style={{ color: '#d97706' }}
                    title="Next (↓ or →)"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExpandAll}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)' }}
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-4 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-lg"
                style={{
                  background: 'var(--bg-accent)',
                  color: 'var(--text-secondary)',
                  borderWidth: '2px',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                Collapse All
              </button>
            </div>

            {/* Filter */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showOnlyExpanded}
                  onChange={(e) => setShowOnlyExpanded(e.target.checked)}
                  className="w-4 h-4 rounded border-2 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border-secondary)' }}
                />
                <span className="text-sm font-medium group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                  Show only expanded clusters
                </span>
              </label>
            </div>

            {/* Keyboard shortcuts */}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="text-xs font-bold mb-3" style={{ color: 'var(--text-tertiary)' }}>
                KEYBOARD SHORTCUTS
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-tertiary)' }}>Search</span>
                  <kbd className="px-2 py-1 rounded border font-mono text-xs" style={{
                    background: 'var(--bg-accent)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}>⌘ F</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-tertiary)' }}>Undo</span>
                  <kbd className="px-2 py-1 rounded border font-mono text-xs" style={{
                    background: 'var(--bg-accent)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}>⌘ Z</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-tertiary)' }}>Clear</span>
                  <kbd className="px-2 py-1 rounded border font-mono text-xs" style={{
                    background: 'var(--bg-accent)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}>Esc</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-tertiary)' }}>Navigate</span>
                  <kbd className="px-2 py-1 rounded border font-mono text-xs" style={{
                    background: 'var(--bg-accent)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}>↑↓←→</kbd>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Info & Stats Panel */}
        <Panel position="top-right" className="backdrop-blur-sm rounded-2xl p-6 m-4 border w-80" style={{
          background: 'rgba(255, 255, 255, 0.97)',
          borderColor: 'var(--border-secondary)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div className="flex items-center gap-3 mb-5">
            <Layers className="w-6 h-6" style={{ color: 'var(--accent-purple)' }} />
            <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Cluster Stats
            </h4>
          </div>
          
          <div className="space-y-4">
            {/* Stats */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-tertiary)' }}>Total Subsites</span>
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{data.subsiteCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-tertiary)' }}>Expanded</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{expandedSubsites.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: 'var(--text-tertiary)' }}>Visible Nodes</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{visibleNodeCount}</span>
              </div>
              {nodeHistory.length > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-tertiary)' }}>Moves</span>
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{nodeHistory.length}</span>
                </div>
              )}
            </div>

            {/* Undo button */}
            {nodeHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all font-bold shadow-xl"
                style={{ boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)' }}
              >
                <Undo2 className="w-5 h-5" />
                Undo Last Move
              </button>
            )}

            {/* Legend */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="text-xs font-bold mb-3" style={{ color: 'var(--text-tertiary)' }}>
                LEGEND
              </div>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md"></div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>WordPress Subsite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl"></div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Page (orbits parent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-md ring-2 ring-amber-300"></div>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Search match</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="text-xs space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                <p><strong style={{ color: 'var(--text-secondary)' }}>💡 Tip:</strong> Each subsite is an independent cluster with pages orbiting around it</p>
                <p><strong style={{ color: 'var(--text-secondary)' }}>🎨 Layout:</strong> Hexagonal grid prevents overlap</p>
                <p><strong style={{ color: 'var(--text-secondary)' }}>🔍 Search:</strong> Highlights and zooms to matches</p>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
