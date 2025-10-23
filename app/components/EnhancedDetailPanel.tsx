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
  const detectionMethodLabel = {
    'wp-json': 'REST API (wp-json)',
    'wp-content': 'WordPress Assets (wp-content)',
    'meta': 'Meta Generator Tag',
    'none': 'Unknown',
  }[subsite?.detectionMethod || 'none'];

  return (
    <AnimatePresence>
      {subsite && (
        <>
          {/* Elegant backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/30 dark:bg-black/60 backdrop-blur-md z-40"
          />

          {/* Panel with warm colors */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[650px] bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 shadow-2xl z-50 overflow-y-auto border-l-2 border-stone-200 dark:border-stone-800"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-b-2 border-stone-200 dark:border-stone-800 px-7 py-5 flex items-center justify-between z-10">
              <div className="flex-1 mr-4">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2 leading-tight">
                  {subsite.title || 'Untitled Site'}
                </h2>
                <a
                  href={subsite.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
                >
                  <span className="font-mono text-xs bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded">
                    {subsite.baseUrl}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-7 py-6 space-y-6">
              {/* Status & Detection Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50 rounded-2xl p-6 space-y-4 border-2 border-stone-200 dark:border-stone-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide">STATUS</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${subsite.isLive ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'}`}>
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

                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide">DETECTION METHOD</span>
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100 text-right bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg">{detectionMethodLabel}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-stone-200 dark:border-stone-700">
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 tracking-wide">TOTAL PAGES</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 bg-clip-text text-transparent">{subsite.pages.length}</span>
                </div>
              </motion.div>

              {/* Pages List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                    Pages <span className="text-stone-500 dark:text-stone-400">({subsite.pages.length})</span>
                  </h3>
                </div>

                {subsite.pages.length > 0 ? (
                  <div className="space-y-3">
                    {subsite.pages.map((page, index) => (
                      <motion.div
                        key={`${subsite.id}-${page.url}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.02 }}
                        className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl p-5 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-lg transition-all group/page"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-100 flex-1 mr-3 group-hover/page:text-sky-600 dark:group-hover/page:text-sky-400 transition-colors leading-snug">
                            {page.title || page.path}
                          </h4>
                          <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1 ${page.isLive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-stone-400'}`} title={page.isLive ? 'Live' : 'Offline'} />
                        </div>

                        <div className="flex items-center text-xs text-stone-600 dark:text-stone-400 mb-3 bg-stone-50 dark:bg-stone-900/50 px-3 py-1.5 rounded-lg font-mono">
                          <span className="truncate">{page.path}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
                          >
                            Visit page
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {page.outboundLinks.length > 0 && (
                            <span className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                              {page.outboundLinks.length} link{page.outboundLinks.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {page.outboundLinks.length > 0 && (
                          <details className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                            <summary className="text-xs font-semibold text-stone-600 dark:text-stone-400 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 transition-colors">
                              <ChevronDown className="w-3.5 h-3.5" />
                              Outbound links
                            </summary>
                            <ul className="mt-3 ml-1 space-y-2">
                              {page.outboundLinks.map((link, linkIndex) => (
                                <li key={`${page.url}-link-${linkIndex}-${link}`} className="text-xs">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline break-all transition-colors"
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
                  <div className="text-center py-16 bg-stone-50 dark:bg-stone-800/30 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                    <div className="w-16 h-16 mx-auto mb-4 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 font-medium">No pages discovered</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
