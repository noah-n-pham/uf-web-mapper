'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ReactFlowProvider } from 'reactflow';
import { CrawlResult } from '../types/data';
import { ThemeProvider } from './ThemeProvider';
import { MapProvider, useMap } from './MapProvider';
import Header from './Header';
import EnhancedGridView from './EnhancedGridView';
import NetworkView from './NetworkView';
import EnhancedDetailPanel from './EnhancedDetailPanel';

interface InteractiveDataExplorerProps {
  data: CrawlResult;
}

function ExplorerContent({ data }: InteractiveDataExplorerProps) {
  const { viewMode, selectedSubsite, setSelectedSubsite } = useMap();

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <EnhancedGridView key="cards" data={data} />
        ) : (
          <ReactFlowProvider>
            <NetworkView key="network" data={data} />
          </ReactFlowProvider>
        )}
      </AnimatePresence>

      <EnhancedDetailPanel
        subsite={selectedSubsite}
        onClose={() => setSelectedSubsite(null)}
      />
    </div>
  );
}

export default function InteractiveDataExplorer({ data }: InteractiveDataExplorerProps) {
  return (
    <ThemeProvider>
      <MapProvider>
        <ExplorerContent data={data} />
      </MapProvider>
    </ThemeProvider>
  );
}
