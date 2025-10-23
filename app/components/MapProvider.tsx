'use client';

import React, { createContext, useContext, useState } from 'react';
import { Subsite } from '../types/data';

type ViewMode = 'cards' | 'network';

interface MapContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedSubsite: Subsite | null;
  setSelectedSubsite: (subsite: Subsite | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedSubsite, setSelectedSubsite] = useState<Subsite | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  return (
    <MapContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedSubsite,
        setSelectedSubsite,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    // Return default values during SSR
    return {
      viewMode: 'cards' as ViewMode,
      setViewMode: () => {},
      selectedSubsite: null,
      setSelectedSubsite: () => {},
      searchTerm: '',
      setSearchTerm: () => {},
      sortBy: 'name',
      setSortBy: () => {},
    };
  }
  return context;
}
