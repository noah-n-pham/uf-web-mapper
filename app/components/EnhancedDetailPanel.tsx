'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subsite } from '../types/data';
import { X, ExternalLink, FileText, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface EnhancedDetailPanelProps {
  subsite: Subsite | null;
  onClose: () => void;
}

export default function EnhancedDetailPanel({ subsite, onClose }: EnhancedDetailPanelProps) {
  if (!subsite) return null;

  const confidenceBadge = {
    high: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    low: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
  }[subsite.detectionConfidence];

  const detectionMethodLabel = {
    'wp-json': 'REST API (wp-json)',
    'wp-content': 'WordPress Assets (wp-content)',
    'meta': 'Meta Generator Tag',
    'none': 'Unknown',
  }[subsite.detectionMethod];

  return (
    <AnimatePresence>
      {/* Backdrop with proper styling */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {subsite.title || 'Untitled Site'}
            </h2>
            <a
              href={subsite.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all flex items-center gap-1"
            >
              {subsite.baseUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status & Detection Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${subsite.isLive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 text-red-700 dark:text-red-300'}`}>
                {subsite.isLive ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Live
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Offline
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${confidenceBadge}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {subsite.detectionConfidence.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Detection</span>
              <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{detectionMethodLabel}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Pages</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{subsite.pages.length}</span>
            </div>
          </motion.div>

          {/* Pages List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pages ({subsite.pages.length})
              </h3>
            </div>

            {subsite.pages.length > 0 ? (
              <div className="space-y-3">
                {subsite.pages.map((page, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 flex-1 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {page.title || page.path}
                      </h4>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${page.isLive ? 'bg-emerald-500' : 'bg-gray-400'}`} title={page.isLive ? 'Live' : 'Offline'} />
                    </div>

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="font-mono truncate">{page.path}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Visit page
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {page.outboundLinks.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {page.outboundLinks.length} link{page.outboundLinks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {page.outboundLinks.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1">
                          <ChevronDown className="w-3 h-3" />
                          Outbound links
                        </summary>
                        <ul className="mt-2 ml-4 space-y-1">
                          {page.outboundLinks.map((link, linkIndex) => (
                            <li key={linkIndex} className="text-xs">
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pages discovered</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

