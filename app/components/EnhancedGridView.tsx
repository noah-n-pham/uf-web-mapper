'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CrawlResult } from '../types/data';
import EnhancedSubsiteCard from './EnhancedSubsiteCard';
import { useMap } from './MapProvider';
import { Search, X, TrendingUp, FileText, Globe, ChevronDown } from 'lucide-react';

interface EnhancedGridViewProps {
  data: CrawlResult;
}

export default function EnhancedGridView({ data }: EnhancedGridViewProps) {
  const {
    setSelectedSubsite,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
  } = useMap();

  // Filter and sort subsites
  const filteredAndSortedSubsites = useMemo(() => {
    let result = [...data.subsites];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (subsite) =>
          subsite.title?.toLowerCase().includes(term) ||
          subsite.baseUrl.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || a.baseUrl).localeCompare(b.title || b.baseUrl);
        case 'pages':
          return b.pages.length - a.pages.length;
        default:
          return 0;
      }
    });

    return result;
  }, [data.subsites, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const totalPages = data.subsites.reduce((sum, s) => sum + s.pages.length, 0);
    const liveSubsites = data.subsites.filter(s => s.isLive).length;
    
    // Calculate median pages per site
    const pageCounts = data.subsites.map(s => s.pages.length).sort((a, b) => a - b);
    const mid = Math.floor(pageCounts.length / 2);
    const medianPagesPerSite = pageCounts.length % 2 === 0
      ? Math.round((pageCounts[mid - 1] + pageCounts[mid]) / 2)
      : pageCounts[mid];
    
    return { totalPages, liveSubsites, medianPagesPerSite };
  }, [data.subsites, data.subsiteCount]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'var(--bg-primary)' }}
      className="min-h-screen"
      id="main-content"
      role="main"
    >
      {/* Metrics Dashboard */}
      <section 
        className="backdrop-blur-xl border-b" 
        style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
        aria-label="Website metrics overview"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            role="list"
            aria-label="Key metrics"
          >
            {/* Sites metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-xl p-6 text-white shadow-xl relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
              }}
              role="listitem"
              aria-label={`${data.subsiteCount} WordPress sites total`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-8 h-8 drop-shadow-md" aria-hidden="true" />
                  <span className="text-sm font-semibold tracking-wide">WordPress Sites</span>
                </div>
                <div className="text-4xl font-bold mb-1 drop-shadow-sm">{data.subsiteCount}</div>
                <div className="text-sm font-medium opacity-95">
                  {stats.liveSubsites} live • {data.subsiteCount - stats.liveSubsites} offline
                </div>
              </div>
            </motion.div>

            {/* Pages metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-xl p-6 text-white shadow-xl relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
                boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)' 
              }}
              role="listitem"
              aria-label={`${stats.totalPages} total pages across all sites`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-transparent" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 drop-shadow-md" aria-hidden="true" />
                  <span className="text-sm font-semibold tracking-wide">Total Pages</span>
                </div>
                <div className="text-4xl font-bold mb-1 drop-shadow-sm">{stats.totalPages.toLocaleString()}</div>
                <div className="text-sm font-medium opacity-95">Across all sites</div>
              </div>
            </motion.div>

            {/* Median metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-xl p-6 text-white shadow-xl relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
                boxShadow: '0 10px 30px -5px rgba(168, 85, 247, 0.5), 0 0 0 1px rgba(168, 85, 247, 0.1)' 
              }}
              role="listitem"
              aria-label={`${stats.medianPagesPerSite} median pages per WordPress site`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent" aria-hidden="true"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 drop-shadow-md" aria-hidden="true" />
                  <span className="text-sm font-semibold tracking-wide">Median Pages</span>
                </div>
                <div className="text-4xl font-bold mb-1 drop-shadow-sm">{stats.medianPagesPerSite}</div>
                <div className="text-sm font-medium opacity-95">Per WordPress site</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Last crawl info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-tertiary)' }}
            className="mt-6 text-center text-sm"
          >
            Last crawled: {new Date(data.crawlTimestamp).toLocaleString()}
          </motion.div>
        </div>
      </section>

      {/* Search and filters */}
      <section 
        className="backdrop-blur-xl border-b sticky top-16 z-20" 
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
        aria-label="Search and filter controls"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <label htmlFor="subsite-search" className="sr-only">
                Search subsites by name or URL
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <input
                id="subsite-search"
                type="search"
                placeholder="Search subsites by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderWidth: '1px',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                aria-describedby="search-description"
              />
              <span id="search-description" className="sr-only">
                Filter the list of subsites by typing a name or URL
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <label htmlFor="sort-select" className="sr-only">
                Sort subsites by
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-12 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderWidth: '1px',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
                aria-label="Sort subsites"
              >
                <option value="name">Sort: Name</option>
                <option value="pages">Sort: Page Count</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Subsites list">
        {filteredAndSortedSubsites.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm"
              style={{ color: 'var(--text-tertiary)' }}
              role="status"
              aria-live="polite"
            >
              Showing {filteredAndSortedSubsites.length} of {data.subsiteCount} subsites
            </motion.div>
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              role="list"
              aria-label="Filtered subsites"
            >
              {filteredAndSortedSubsites.map((subsite, index) => (
                <EnhancedSubsiteCard
                  key={subsite.id}
                  subsite={subsite}
                  onClick={() => setSelectedSubsite(subsite)}
                  index={index}
                />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
            role="status"
            aria-live="polite"
          >
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No subsites found</h2>
            <p className="mb-4" style={{ color: 'var(--text-tertiary)' }}>Try adjusting your search</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 text-white rounded-lg transition-colors font-medium shadow-lg"
              style={{ background: 'var(--accent-blue)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              aria-label="Clear search and show all subsites"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
