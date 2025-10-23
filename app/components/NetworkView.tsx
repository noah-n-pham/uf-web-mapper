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
import { CrawlResult, Subsite } from '../types/data';
import { useMap } from './MapProvider';
import { useTheme } from './ThemeProvider';
import { ChevronDown, ChevronRight, Search, ChevronLeft, ChevronRight as ChevronRightIcon, X, Undo2, Filter, Layers, Info } from 'lucide-react';

interface NetworkViewProps {
  data: CrawlResult;
}

interface NodeHistoryItem {
  nodeId: string;
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

// Color palette for clusters
const clusterColors = [
  { main: 'from-blue-500 to-blue-600', border: 'border-blue-700', shadow: 'shadow-blue-500/30', page: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' },
  { main: 'from-emerald-500 to-emerald-600', border: 'border-emerald-700', shadow: 'shadow-emerald-500/30', page: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' },
  { main: 'from-purple-500 to-purple-600', border: 'border-purple-700', shadow: 'shadow-purple-500/30', page: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' },
  { main: 'from-pink-500 to-pink-600', border: 'border-pink-700', shadow: 'shadow-pink-500/30', page: 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700' },
  { main: 'from-orange-500 to-orange-600', border: 'border-orange-700', shadow: 'shadow-orange-500/30', page: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' },
  { main: 'from-teal-500 to-teal-600', border: 'border-teal-700', shadow: 'shadow-teal-500/30', page: 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700' },
  { main: 'from-indigo-500 to-indigo-600', border: 'border-indigo-700', shadow: 'shadow-indigo-500/30', page: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' },
  { main: 'from-cyan-500 to-cyan-600', border: 'border-cyan-700', shadow: 'shadow-cyan-500/30', page: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700' },
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
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`px-7 py-5 rounded-2xl border-3 shadow-xl min-w-[240px] max-w-[260px] bg-gradient-to-br transition-all ${
        isSearchMatch
          ? 'from-yellow-500 to-yellow-600 border-yellow-700 shadow-yellow-500/50 ring-4 ring-yellow-300 dark:ring-yellow-500 scale-110'
          : `${colorScheme.main} ${colorScheme.border} ${colorScheme.shadow}`
      } ${selected || isExpanded ? 'scale-110' : 'hover:scale-105'} text-white cursor-pointer`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 mt-0.5">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight line-clamp-3 break-words mb-1">
            {data.label}
          </div>
          <div className="text-xs opacity-90 font-medium">
            {data.pageCount} page{data.pageCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="text-xs opacity-75 mt-2 pl-7">Click to collapse</div>
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
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`px-4 py-2.5 rounded-lg border-2 shadow-lg min-w-[160px] max-w-[180px] transition-all cursor-pointer ${
        isSearchMatch
          ? 'bg-yellow-400 text-yellow-900 border-yellow-600 ring-4 ring-yellow-300 shadow-yellow-500/50 scale-110'
          : `${colorScheme.page} border-2 hover:shadow-xl hover:scale-105`
      }`}
    >
      <div className={`text-xs font-semibold truncate ${isSearchMatch ? 'text-yellow-900' : 'text-gray-800 dark:text-gray-200'}`}>
        {data.label}
      </div>
      <div className={`text-xs mt-1 ${isSearchMatch ? 'text-yellow-700' : 'text-gray-600 dark:text-gray-400'}`}>
        {data.isLive ? '✓ Live' : '○ Offline'}
      </div>
    </motion.div>
  );
}

export default function NetworkView({ data }: NetworkViewProps) {
  const { setSelectedSubsite } = useMap();
  const { theme } = useTheme();
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

  // Calculate spiral/radial positioning for subsites
  const calculateSpiralPosition = (index: number, total: number) => {
    const centerX = 1200;
    const centerY = 800;
    
    // Golden angle spiral for even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const angle = index * goldenAngle;
    
    // Gradually increasing radius based on index
    const radius = 100 + Math.sqrt(index) * 80;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Calculate circular orbit for pages around subsite
  const calculatePageOrbit = (subsitePos: { x: number; y: number }, pageIndex: number, totalPages: number) => {
    const orbitRadius = 180;
    const angle = (pageIndex / totalPages) * 2 * Math.PI - Math.PI / 2;
    
    return {
      x: subsitePos.x + orbitRadius * Math.cos(angle),
      y: subsitePos.y + orbitRadius * Math.sin(angle),
    };
  };

  // Generate clustered force-directed layout
  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Filter subsites if needed
    let subsitesToShow = data.subsites;
    if (showOnlyExpanded) {
      subsitesToShow = data.subsites.filter((_, idx) => 
        expandedSubsites.has(`subsite-${data.subsites[idx].id}`)
      );
    }

    subsitesToShow.forEach((subsite, subsiteIndex) => {
      const subsiteId = `subsite-${subsite.id}`;
      const isExpanded = expandedSubsites.has(subsiteId);
      const isSubsiteMatch = searchMatches.includes(subsiteId);
      const colorIndex = subsiteIndex;

      // Calculate spiral position for subsite
      const subsitePos = calculateSpiralPosition(subsiteIndex, subsitesToShow.length);

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

      // Add pages if expanded (orbit around parent)
      if (isExpanded) {
        const pagesToShow = subsite.pages.slice(0, 40);

        pagesToShow.forEach((page, pageIndex) => {
          const pageId = `page-${subsite.id}-${pageIndex}`;
          const isPageMatch = searchMatches.includes(pageId);

          // Calculate orbit position
          const pagePos = calculatePageOrbit(subsitePos, pageIndex, pagesToShow.length);

          generatedNodes.push({
            id: pageId,
            type: 'page',
            position: pagePos,
            data: {
              label: page.title?.substring(0, 35) || page.path,
              url: page.url,
              isLive: page.isLive,
              pageData: page,
              isSearchMatch: isPageMatch,
              colorIndex,
            },
            draggable: false,
          });

          // Curved edge from subsite to page
          generatedEdges.push({
            id: `${subsiteId}-${pageId}`,
            source: subsiteId,
            target: pageId,
            type: 'smoothstep',
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              color: isPageMatch ? '#eab308' : '#94a3b8',
              width: 15,
              height: 15,
            },
            style: {
              stroke: isPageMatch ? '#eab308' : '#cbd5e1',
              strokeWidth: isPageMatch ? 3 : 1.5,
              opacity: isPageMatch ? 1 : 0.6,
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
      
      // Match subsite
      if (
        subsite.title?.toLowerCase().includes(lowerTerm) ||
        subsite.baseUrl.toLowerCase().includes(lowerTerm)
      ) {
        matches.push(subsiteId);
      }

      // Match pages (only if expanded)
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

    // Zoom to first match
    if (matches.length > 0) {
      setTimeout(() => {
        const currentNodes = getNodes();
        const matchNode = currentNodes.find(n => n.id === matches[0]);
        if (matchNode) {
          setCenter(matchNode.position.x, matchNode.position.y, { zoom: 0.8, duration: 1000 });
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
        setCenter(matchNode.position.x, matchNode.position.y, { zoom: 0.8, duration: 1000 });
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

      // Escape always works
      if (e.key === 'Escape') {
        e.preventDefault();
        setSearchTerm('');
        setSearchMatches([]);
        setCurrentMatchIndex(0);
        document.getElementById('network-search')?.blur();
        return;
      }

      // Don't trigger other shortcuts while typing
      if (isTyping) return;

      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('network-search')?.focus();
        return;
      }

      // Arrow keys for navigation (only if search active)
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
          setNodeHistory(prev => [...prev.slice(-10), { // Keep last 10 moves
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
      
      // Toggle expansion
      setExpandedSubsites(prev => {
        const newSet = new Set(prev);
        if (newSet.has(subsiteId)) {
          newSet.delete(subsiteId);
        } else {
          newSet.add(subsiteId);
        }
        return newSet;
      });
      
      // Open detail panel
      setSelectedSubsite(node.data.subsiteData);
    }
  }, [setSelectedSubsite]);

  // Expand all / Collapse all
  const handleExpandAll = useCallback(() => {
    const allIds = new Set(data.subsites.map((_, idx) => `subsite-${data.subsites[idx].id}`));
    setExpandedSubsites(allIds);
  }, [data.subsites]);

  const handleCollapseAll = useCallback(() => {
    setExpandedSubsites(new Set());
  }, []);

  // Calculate total visible nodes
  const visibleNodeCount = useMemo(() => {
    let count = data.subsiteCount;
    expandedSubsites.forEach(id => {
      const subsite = data.subsites.find((s, idx) => `subsite-${s.id}` === id);
      if (subsite) {
        count += Math.min(subsite.pages.length, 40);
      }
    });
    return count;
  }, [expandedSubsites, data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-[calc(100vh-10rem)]"
      style={{
        background: theme === 'light' 
          ? 'linear-gradient(135deg, #fefcf9 0%, #f8f5f1 30%, #fff9f0 60%, #fefcf9 100%)'
          : 'linear-gradient(135deg, #0f0e0d 0%, #1a1816 30%, #252320 60%, #0f0e0d 100%)'
      }}
    >
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.05}
        maxZoom={1.5}
        className="dark:bg-gray-900"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={25} 
          size={1.5}
          className="opacity-40 dark:opacity-20"
          color="#94a3b8"
        />
        <Controls className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg" />
        <MiniMap 
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg"
          maskColor="rgb(0, 0, 0, 0.05)"
          nodeColor={(node) => {
            if (node.type === 'subsite') {
              const colorScheme = clusterColors[node.data.colorIndex % clusterColors.length];
              return node.data.isExpanded ? '#10b981' : '#6366f1';
            }
            return '#e2e8f0';
          }}
        />

        {/* Search & Controls Panel */}
        <Panel position="top-left" className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 m-4 border-2 border-stone-200 dark:border-stone-800 w-96">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow-lg shadow-sky-500/30">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg text-stone-900 dark:text-stone-50">
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
                className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchMatches([]);
                    setCurrentMatchIndex(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search results navigation */}
            {searchMatches.length > 0 && (
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {currentMatchIndex + 1} / {searchMatches.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMatches('prev')}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 transition-all shadow-sm"
                    title="Previous (↑ or ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateMatches('next')}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 transition-all shadow-sm"
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
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-emerald-500/20"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
              >
                Collapse All
              </button>
            </div>

            {/* Filters */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showOnlyExpanded}
                  onChange={(e) => setShowOnlyExpanded(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Show only expanded clusters
                </span>
              </label>
            </div>

            {/* Keyboard shortcuts */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                KEYBOARD SHORTCUTS
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Search</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">⌘ F</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Clear</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">Esc</kbd>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Undo</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">⌘ Z</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">↓/→</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Info & Stats Panel */}
        <Panel position="top-right" className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 m-4 border-2 border-stone-200 dark:border-stone-800 w-72">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              Cluster Stats
            </h4>
          </div>
          
          <div className="space-y-4">
            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Subsites</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{data.subsiteCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Expanded</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{expandedSubsites.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Visible Nodes</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{visibleNodeCount}</span>
              </div>
              {nodeHistory.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Moves</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{nodeHistory.length}</span>
                </div>
              )}
            </div>

            {/* Undo button */}
            {nodeHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/30"
              >
                <Undo2 className="w-4 h-4" />
                Undo Last Move
              </button>
            )}

            {/* Legend */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
                LEGEND
              </div>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300">WordPress Subsite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg"></div>
                  <span className="text-gray-700 dark:text-gray-300">Page (orbits subsite)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm ring-2 ring-yellow-300"></div>
                  <span className="text-gray-700 dark:text-gray-300">Search match</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <p>💡 <strong>Tip:</strong> Click a subsite to expand its pages in a circular orbit</p>
                <p>🔍 <strong>Search:</strong> Highlights matches and auto-zooms</p>
                <p>🎨 <strong>Colors:</strong> Each cluster has a unique gradient</p>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
