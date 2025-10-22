'use client';

import React from 'react';
import { Subsite } from '../types/data';

interface SubsiteCardProps {
  subsite: Subsite;
  onClick: () => void;
}

export default function SubsiteCard({ subsite, onClick }: SubsiteCardProps) {
  const confidenceBadgeColor = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-gray-100 text-gray-800 border-gray-300',
  }[subsite.detectionConfidence];

  const detectionMethodLabel = {
    'wp-json': 'REST API',
    'wp-content': 'Assets',
    'meta': 'Meta Tag',
    'none': 'Unknown',
  }[subsite.detectionMethod];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-blue-400 p-5 flex flex-col justify-between h-full group"
    >
      {/* Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {subsite.title || 'Untitled Site'}
          </h3>
          <div className={`ml-2 flex-shrink-0 ${subsite.isLive ? 'text-green-500' : 'text-gray-400'}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" />
            </svg>
          </div>
        </div>

        {/* URL */}
        <p className="text-sm text-gray-600 mb-3 truncate" title={subsite.baseUrl}>
          {subsite.baseUrl.replace('https://education.ufl.edu/', '/')}
        </p>

        {/* Detection Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${confidenceBadgeColor}`}>
            {subsite.detectionConfidence.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            via {detectionMethodLabel}
          </span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">{subsite.pages.length}</span>
            <span className="ml-1">page{subsite.pages.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-blue-600 group-hover:text-blue-700 font-medium text-xs">
            View details →
          </div>
        </div>
      </div>
    </div>
  );
}

