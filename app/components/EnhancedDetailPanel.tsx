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
          {/* Warm themed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-40"
            style={{ background: 'rgba(26, 22, 20, 0.4)' }}
          />

          {/* Panel with warm colors */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[600px] shadow-2xl z-50 overflow-y-auto"
            style={{
              background: 'var(--bg-tertiary)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Header */}
            <div 
              className="sticky top-0 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex-1 mr-4">
                <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {subsite.title || 'Untitled Site'}
                </h2>
                <a
                  href={subsite.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline break-all flex items-center gap-1"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  {subsite.baseUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-tertiary)',
                  background: 'transparent'
                }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Status & Detection Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-5 space-y-4 border"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    subsite.isLive 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
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
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Detection</span>
                  <span className="text-sm text-right" style={{ color: 'var(--text-primary)' }}>{detectionMethodLabel}</span>
                </div>

                <div 
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Pages</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{subsite.pages.length}</span>
                </div>
              </motion.div>

              {/* Pages List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FileText className="w-5 h-5" />
                    Pages ({subsite.pages.length})
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
                        className="rounded-lg p-4 border transition-all group"
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-primary)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 
                            className="font-medium flex-1 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {page.title || page.path}
                          </h4>
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${page.isLive ? 'bg-emerald-500' : 'bg-gray-400'}`} title={page.isLive ? 'Live' : 'Offline'} />
                        </div>

                        <div className="flex items-center text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="font-mono truncate">{page.path}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs hover:underline flex items-center gap-1"
                            style={{ color: 'var(--accent-blue)' }}
                          >
                            Visit page
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {page.outboundLinks.length > 0 && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {page.outboundLinks.length} link{page.outboundLinks.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {page.outboundLinks.length > 0 && (
                          <details className="mt-3">
                            <summary 
                              className="text-xs cursor-pointer hover:opacity-70 flex items-center gap-1 transition-opacity"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              <ChevronDown className="w-3 h-3" />
                              Outbound links
                            </summary>
                            <ul className="mt-2 ml-4 space-y-1">
                              {page.outboundLinks.map((link, linkIndex) => (
                                <li key={`${page.url}-link-${linkIndex}-${link}`} className="text-xs">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline break-all"
                                    style={{ color: 'var(--accent-blue)' }}
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
                  <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pages discovered</p>
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
