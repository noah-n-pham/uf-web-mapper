'use client';

import React, { useState, useMemo } from 'react';
import { CrawlResult, Subsite } from '../types/data';
import SubsiteCard from './SubsiteCard';
import SubsiteDetailPanel from './SubsiteDetailPanel';

interface GridViewProps {
  data: CrawlResult;
}

type SortOption = 'name' | 'pages' | 'confidence';
type FilterOption = 'all' | 'high' | 'medium' | 'low';

export default function GridView({ data }: GridViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsite, setSelectedSubsite] = useState<Subsite | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

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

    // Apply confidence filter
    if (filterBy !== 'all') {
      result = result.filter((subsite) => subsite.detectionConfidence === filterBy);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || a.baseUrl).localeCompare(b.title || b.baseUrl);
        case 'pages':
          return b.pages.length - a.pages.length;
        case 'confidence':
          const confidenceOrder = { high: 3, medium: 2, low: 1 };
          return confidenceOrder[b.detectionConfidence] - confidenceOrder[a.detectionConfidence];
        default:
          return 0;
      }
    });

    return result;
  }, [data.subsites, searchTerm, sortBy, filterBy]);

  const stats = useMemo(() => {
    const totalPages = data.subsites.reduce((sum, s) => sum + s.pages.length, 0);
    const highConfidence = data.subsites.filter(s => s.detectionConfidence === 'high').length;
    const mediumConfidence = data.subsites.filter(s => s.detectionConfidence === 'medium').length;
    return { totalPages, highConfidence, mediumConfidence };
  }, [data.subsites]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              UF College of Education Web Ecosystem
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">{data.subsiteCount}</span>
                <span className="ml-1">subsite{data.subsiteCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{stats.totalPages}</span>
                <span className="ml-1">page{stats.totalPages !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Last crawl: {new Date(data.crawlTimestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm">
              <span className="font-medium text-green-900">{stats.highConfidence}</span>
              <span className="text-green-700 ml-1">high confidence</span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-sm">
              <span className="font-medium text-yellow-900">{stats.mediumConfidence}</span>
              <span className="text-yellow-700 ml-1">medium confidence</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search subsites by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="name">Sort: Name</option>
              <option value="pages">Sort: Page Count</option>
              <option value="confidence">Sort: Confidence</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Confidence</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedSubsites.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredAndSortedSubsites.length} of {data.subsiteCount} subsites
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedSubsites.map((subsite) => (
                <SubsiteCard
                  key={subsite.id}
                  subsite={subsite}
                  onClick={() => setSelectedSubsite(subsite)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subsites found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <SubsiteDetailPanel
        subsite={selectedSubsite}
        onClose={() => setSelectedSubsite(null)}
      />
    </div>
  );
}

