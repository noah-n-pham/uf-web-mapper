'use client';

import React from 'react';
import { Subsite } from '../types/data';

interface SubsiteDetailPanelProps {
  subsite: Subsite | null;
  onClose: () => void;
}

export default function SubsiteDetailPanel({ subsite, onClose }: SubsiteDetailPanelProps) {
  if (!subsite) return null;

  const confidenceBadgeColor = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }[subsite.detectionConfidence];

  const detectionMethodLabel = {
    'wp-json': 'REST API (wp-json)',
    'wp-content': 'WordPress Assets (wp-content)',
    'meta': 'Meta Generator Tag',
    'none': 'Unknown',
  }[subsite.detectionMethod];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {subsite.title || 'Untitled Site'}
            </h2>
            <a
              href={subsite.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {subsite.baseUrl}
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status & Detection Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${subsite.isLive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {subsite.isLive ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Live
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Offline
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Detection Confidence</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${confidenceBadgeColor}`}>
                {subsite.detectionConfidence.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-gray-700">Detection Method</span>
              <span className="text-sm text-gray-900 text-right">{detectionMethodLabel}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Pages Discovered</span>
              <span className="text-sm font-bold text-gray-900">{subsite.pages.length}</span>
            </div>
          </div>

          {/* Pages List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Pages ({subsite.pages.length})
              </h3>
              {subsite.pages.length === 20 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Sampled (max 20)
                </span>
              )}
            </div>

            {subsite.pages.length > 0 ? (
              <div className="space-y-2">
                {subsite.pages.map((page, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1 mr-2">
                        {page.title || page.path}
                      </h4>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${page.isLive ? 'bg-green-500' : 'bg-gray-400'}`} title={page.isLive ? 'Live' : 'Offline'} />
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="font-mono">{page.path}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Visit page →
                      </a>
                      {page.outboundLinks.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {page.outboundLinks.length} outbound link{page.outboundLinks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Outbound Links (collapsed by default) */}
                    {page.outboundLinks.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Show outbound links
                        </summary>
                        <ul className="mt-2 ml-4 space-y-1">
                          {page.outboundLinks.map((link, linkIndex) => (
                            <li key={linkIndex} className="text-xs">
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No pages discovered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

