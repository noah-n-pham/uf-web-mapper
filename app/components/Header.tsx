'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { useMap } from './MapProvider';
import { Sun, Moon, LayoutGrid, Network } from 'lucide-react';

export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { viewMode, setViewMode } = useMap();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header 
        className="sticky top-0 z-30 backdrop-blur-xl border-b shadow-sm"
        style={{
          background: 'rgba(255, 252, 249, 0.8)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                🎓
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  UF COE Web Mapper
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Interactive Data Explorer
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-30 backdrop-blur-xl border-b shadow-sm"
      style={{
        background: 'rgba(255, 252, 249, 0.8)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
              🎓
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                UF COE Web Mapper
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Interactive Data Explorer
              </p>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {/* View toggle */}
            <div className="hidden sm:flex rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'cards' ? 'shadow-sm' : ''
                }`}
                style={{
                  background: viewMode === 'cards' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--accent-blue)' : 'var(--text-tertiary)'
                }}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm font-medium">Cards</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('network')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'network' ? 'shadow-sm' : ''
                }`}
                style={{
                  background: viewMode === 'network' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'network' ? 'var(--accent-blue)' : 'var(--text-tertiary)'
                }}
              >
                <Network className="w-4 h-4" />
                <span className="text-sm font-medium">Network</span>
              </motion.button>
            </div>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="sm:hidden border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'cards' ? 'bg-blue-600 text-white' : ''
            }`}
            style={viewMode !== 'cards' ? {
              background: 'var(--bg-secondary)',
              color: 'var(--text-tertiary)'
            } : {}}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-medium">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('network')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'network' ? 'bg-blue-600 text-white' : ''
            }`}
            style={viewMode !== 'network' ? {
              background: 'var(--bg-secondary)',
              color: 'var(--text-tertiary)'
            } : {}}
          >
            <Network className="w-4 h-4" />
            <span className="text-sm font-medium">Network</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
