'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { CrawlResult } from '../types/data';

interface HeaderProps {
  data: CrawlResult;
}

export default function Header({ data }: HeaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

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
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ 
                  background: 'linear-gradient(to bottom right, #0369a1, #0284c7)',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
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
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ 
                background: 'linear-gradient(to bottom right, #0369a1, #0284c7)',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              🎓
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                UF COE Web Mapper
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {data.subsiteCount} WordPress Sites • {data.subsites.reduce((sum, s) => sum + s.pages.length, 0).toLocaleString()} Pages
              </p>
            </div>
          </motion.div>

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
        </div>
      </div>
    </motion.header>
  );
}
