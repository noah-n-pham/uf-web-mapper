'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subsite } from '../types/data';
import { X, ExternalLink, FileText, CheckCircle2, AlertCircle, ChevronDown, Link2, AlertTriangle } from 'lucide-react';

interface EnhancedDetailPanelProps {
  subsite: Subsite | null;
  onClose: () => void;
}

export default function EnhancedDetailPanel({ subsite, onClose }: EnhancedDetailPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const detectionMethodLabel = {
    'wp-json': 'REST API (wp-json)',
    'wp-content': 'WordPress Assets (wp-content)',
    'meta': 'Meta Generator Tag',
    'none': 'Unknown',
  }[subsite?.detectionMethod || 'none'];

  // Focus trap and keyboard support
  React.useEffect(() => {
    if (subsite && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (subsite) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [subsite, onClose]);

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
            aria-hidden="true"
          />

          {/* Panel with warm colors */}
          <motion.aside
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[600px] shadow-2xl z-50 overflow-y-auto"
            style={{
              background: 'var(--bg-tertiary)',
              boxShadow: 'var(--shadow-xl)'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            aria-describedby="panel-description"
          >
            {/* Header */}
            <header 
              className="sticky top-0 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex-1 mr-4">
                <h2 id="panel-title" className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {subsite.title || 'Untitled Site'}
                </h2>
                <a
                  href={subsite.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline break-all flex items-center gap-1"
                  style={{ color: 'var(--accent-blue)' }}
                  aria-label={`Visit ${subsite.title || 'subsite'} website (opens in new tab)`}
                >
                  {subsite.baseUrl}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
              <motion.button
                ref={closeButtonRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-tertiary)',
                  background: 'transparent'
                }}
                aria-label="Close details panel"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </motion.button>
            </header>

            {/* Content */}
            <div className="px-6 py-6 space-y-6" id="panel-description">
              {/* Access URLs Info */}
              {(subsite as any).aliases && (subsite as any).aliases.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-xl p-5 border"
                  style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    borderColor: 'rgba(59, 130, 246, 0.2)'
                  }}
                  role="region"
                  aria-label="Access URLs for this installation"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Link2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(37, 99, 235)' }} aria-hidden="true" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1" style={{ color: 'rgb(37, 99, 235)' }}>
                        Multiple Access URLs
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'rgb(30, 64, 175)' }}>
                        This WordPress installation is accessible via {(subsite as any).aliases.length + 1} different URLs. All URLs share the same dashboard and content.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(37, 99, 235)' }} aria-hidden="true" />
                      <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                        {subsite.baseUrl.replace('https://education.ufl.edu', '')} <span style={{ color: 'rgb(37, 99, 235)' }} className="font-semibold">(canonical)</span>
                      </span>
                    </div>
                    {(subsite as any).aliases.map((alias: string, idx: number) => (
                      <div key={alias} className="flex items-center gap-2 text-sm">
                        <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
                        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {alias.replace('https://education.ufl.edu', '')} <span style={{ color: 'var(--text-tertiary)' }} className="text-xs">(alias)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Status & Detection Info */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-5 space-y-4 border"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
                aria-label="Site status and detection information"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border"
                    style={{
                      background: subsite.isLive ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
                      color: subsite.isLive ? 'var(--status-success-text)' : 'var(--status-error-text)',
                      borderColor: subsite.isLive ? 'var(--status-success-border)' : 'var(--status-error-border)'
                    }}
                    role="status"
                    aria-label={`Site status: ${subsite.isLive ? 'Live' : 'Offline'}`}
                  >
                    {subsite.isLive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Live
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
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
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }} aria-label={`${subsite.pages.length} total pages`}>{subsite.pages.length}</span>
                </div>
              </motion.section>

              {/* Pages List */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                aria-labelledby="pages-heading"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 id="pages-heading" className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FileText className="w-5 h-5" aria-hidden="true" />
                    Pages ({subsite.pages.length})
                  </h3>
                </div>

                {subsite.pages.length > 0 ? (
                  <div className="space-y-3" role="list" aria-label="Pages in this subsite">
                    {subsite.pages.map((page, index) => (
                      <motion.article
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
                        role="listitem"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 
                            className="font-medium flex-1 mr-2 transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                          >
                            {page.title || page.path}
                          </h4>
                          <span 
                            className="flex-shrink-0 w-2 h-2 rounded-full mt-2" 
                            style={{ background: page.isLive ? 'var(--status-icon-success)' : 'var(--text-muted)' }}
                            role="status"
                            aria-label={page.isLive ? 'Live page' : 'Offline page'}
                          />
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
                            aria-label={`Visit ${page.title || page.path} (opens in new tab)`}
                          >
                            Visit page
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                          {page.outboundLinks.length > 0 && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }} aria-label={`${page.outboundLinks.length} outbound links`}>
                              {page.outboundLinks.length} link{page.outboundLinks.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {page.outboundLinks.length > 0 && (
                          <details className="mt-3">
                            <summary 
                              className="text-xs cursor-pointer hover:opacity-70 flex items-center gap-1 transition-opacity"
                              style={{ color: 'var(--text-tertiary)' }}
                              aria-label={`Show ${page.outboundLinks.length} outbound links`}
                            >
                              <ChevronDown className="w-3 h-3" aria-hidden="true" />
                              Outbound links
                            </summary>
                            <ul className="mt-2 ml-4 space-y-1" aria-label="Outbound links from this page">
                              {page.outboundLinks.map((link, linkIndex) => (
                                <li key={`${page.url}-link-${linkIndex}-${link}`} className="text-xs">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline break-all"
                                    style={{ color: 'var(--accent-blue)' }}
                                    aria-label={`Visit ${link} (opens in new tab)`}
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }} role="status">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                    <p>No pages discovered</p>
                  </div>
                )}
              </motion.section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
