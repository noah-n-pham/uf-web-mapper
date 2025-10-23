'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Subsite } from '../types/data';
import { FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface EnhancedSubsiteCardProps {
  subsite: Subsite;
  onClick: () => void;
  index: number;
}

export default function EnhancedSubsiteCard({ subsite, onClick, index }: EnhancedSubsiteCardProps) {
  const confidenceColor = {
    high: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    medium: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    low: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
  }[subsite.detectionConfidence];

  const confidenceBadge = {
    high: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    low: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
  }[subsite.detectionConfidence];

  const detectionIcons = {
    'wp-json': '🔌',
    'wp-content': '📦',
    'meta': '🏷️',
    'none': '❓',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.03,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      onClick={onClick}
      className="group relative"
    >
      {/* Gradient glow on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${confidenceColor} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300`}></div>
      
      {/* Card content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-300 h-full flex flex-col hover:shadow-xl dark:hover:shadow-gray-900/50">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {subsite.title || 'Untitled Site'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">
              {subsite.baseUrl.replace('https://education.ufl.edu', '')}
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-3">
            {subsite.isLive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Detection info */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${confidenceBadge}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {subsite.detectionConfidence.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {detectionIcons[subsite.detectionMethod]}
            {subsite.detectionMethod}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{subsite.pages.length}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              page{subsite.pages.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <motion.div
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 2 }}
          >
            <span className="text-sm font-medium">View</span>
            <ExternalLink className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

