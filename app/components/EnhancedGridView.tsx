'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CrawlResult } from '../types/data';
import EnhancedSubsiteCard from './EnhancedSubsiteCard';
import { useMap } from './MapProvider';
import { Search, X, TrendingUp, FileText, Globe } from 'lucide-react';

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
    const avgPagesPerSite = Math.round(totalPages / data.subsiteCount);
    return { totalPages, liveSubsites, avgPagesPerSite };
  }, [data.subsites, data.subsiteCount]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(135deg, #fefcf9 0%, #f8f5f1 50%, #fff9f0 100%)',
      }}
    >
      <style jsx>{`
        .dark {
          background: linear-gradient(135deg, #0f0e0d 0%, #1a1816 50%, #0f0e0d 100%) !important;
        }
      `}</style>

      {/* Metrics Dashboard */}
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Sites metric - Ocean Blue */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Globe className="w-9 h-9 opacity-90" />
                  <span className="text-sky-100 text-sm font-semibold tracking-wide">WORDPRESS SITES</span>
                </div>
                <div className="text-5xl font-bold mb-1">{data.subsiteCount}</div>
                <div className="text-sky-100 text-sm font-medium">
                  {stats.liveSubsites} live • {data.subsiteCount - stats.liveSubsites} offline
                </div>
              </div>
            </motion.div>

            {/* Pages metric - Forest Green */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-9 h-9 opacity-90" />
                  <span className="text-emerald-100 text-sm font-semibold tracking-wide">TOTAL PAGES</span>
                </div>
                <div className="text-5xl font-bold mb-1">{stats.totalPages.toLocaleString()}</div>
                <div className="text-emerald-100 text-sm font-medium">Across all WordPress sites</div>
              </div>
            </motion.div>

            {/* Average metric - Royal Purple */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-9 h-9 opacity-90" />
                  <span className="text-purple-100 text-sm font-semibold tracking-wide">AVG PER SITE</span>
                </div>
                <div className="text-5xl font-bold mb-1">{stats.avgPagesPerSite}</div>
                <div className="text-purple-100 text-sm font-medium">Average pages per site</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Last crawl info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-sm text-stone-600 dark:text-stone-400"
          >
            Last crawled: {new Date(data.crawlTimestamp).toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-stone-200/60 dark:border-stone-800/60 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                placeholder="Search subsites by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 text-stone-900 dark:text-stone-100 transition-all cursor-pointer shadow-sm font-medium"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="pages">Sort: Page Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredAndSortedSubsites.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-sm font-medium text-stone-600 dark:text-stone-400"
            >
              Showing <span className="text-sky-600 dark:text-sky-400 font-bold">{filteredAndSortedSubsites.length}</span> of <span className="font-bold">{data.subsiteCount}</span> WordPress subsites
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center">
              <Search className="w-10 h-10 text-stone-400 dark:text-stone-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">No subsites found</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6">Try adjusting your search term</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-sky-500/30"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
