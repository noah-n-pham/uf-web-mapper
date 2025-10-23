'use client';

import React, { createContext, useContext, useState } from 'react';
import { Subsite } from '../types/data';

interface MapContextType {
  selectedSubsite: Subsite | null;
  setSelectedSubsite: (subsite: Subsite | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [selectedSubsite, setSelectedSubsite] = useState<Subsite | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  return (
    <MapContext.Provider
      value={{
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
