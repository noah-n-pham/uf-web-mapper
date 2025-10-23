'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { useMap } from './MapProvider';
import { Sun, Moon, LayoutGrid, Network, Sparkles } from 'lucide-react';

export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { viewMode, setViewMode } = useMap();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border-b-2 border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-sky-500/40">
                🎓
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                  UF COE Web Mapper
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
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
      className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border-b-2 border-stone-200 dark:border-stone-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-sky-500/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">🎓</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-stone-900 to-stone-700 dark:from-stone-50 dark:to-stone-200 bg-clip-text text-transparent">
                UF COE Web Mapper
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Interactive Data Explorer
              </p>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* View toggle */}
            <div className="hidden sm:flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1.5 shadow-inner">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">Cards</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('network')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold ${
                  viewMode === 'network'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Network className="w-4 h-4" />
                <span className="text-sm">Network</span>
              </motion.button>
            </div>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: theme === 'light' ? -30 : 30 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 hover:from-stone-200 hover:to-stone-300 dark:hover:from-stone-700 dark:hover:to-stone-800 text-stone-700 dark:text-stone-300 transition-all shadow-lg"
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
      <div className="sm:hidden border-t-2 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold shadow-lg ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sky-500/30'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-2 border-stone-200 dark:border-stone-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('network')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold shadow-lg ${
              viewMode === 'network'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-2 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Network className="w-4 h-4" />
            <span className="text-sm">Network</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
