'use client';

import React from 'react';
import { CrawlResult } from '../types/data';
import { ThemeProvider } from './ThemeProvider';
import { MapProvider, useMap } from './MapProvider';
import Header from './Header';
import EnhancedGridView from './EnhancedGridView';
import EnhancedDetailPanel from './EnhancedDetailPanel';

interface InteractiveDataExplorerProps {
  data: CrawlResult;
}

function ExplorerContent({ data }: InteractiveDataExplorerProps) {
  const { selectedSubsite, setSelectedSubsite } = useMap();

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Header data={data} />
      <EnhancedGridView data={data} />
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
