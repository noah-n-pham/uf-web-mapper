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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Metrics Dashboard */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Sites metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-8 h-8 opacity-80" />
                <span className="text-blue-100 text-sm font-medium">WordPress Sites</span>
              </div>
              <div className="text-4xl font-bold mb-1">{data.subsiteCount}</div>
              <div className="text-blue-100 text-sm">
                {stats.liveSubsites} live • {data.subsiteCount - stats.liveSubsites} offline
              </div>
            </motion.div>

            {/* Pages metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 opacity-80" />
                <span className="text-emerald-100 text-sm font-medium">Total Pages</span>
              </div>
              <div className="text-4xl font-bold mb-1">{stats.totalPages.toLocaleString()}</div>
              <div className="text-emerald-100 text-sm">Across all sites</div>
            </motion.div>

            {/* Average metric */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg shadow-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-purple-100 text-sm font-medium">Average Pages</span>
              </div>
              <div className="text-4xl font-bold mb-1">{stats.avgPagesPerSite}</div>
              <div className="text-purple-100 text-sm">Per WordPress site</div>
            </motion.div>
          </motion.div>

          {/* Last crawl info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Last crawled: {new Date(data.crawlTimestamp).toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subsites by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 transition-all cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="pages">Sort: Page Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedSubsites.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm text-gray-600 dark:text-gray-400"
            >
              Showing {filteredAndSortedSubsites.length} of {data.subsiteCount} subsites
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
            className="text-center py-20"
          >
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No subsites found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
