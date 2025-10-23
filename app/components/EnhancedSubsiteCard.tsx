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
  const detectionIcons = {
    'wp-json': '🔌',
    'wp-content': '📦',
    'meta': '🏷️',
    'none': '❓',
  };

  const detectionLabels = {
    'wp-json': 'REST API',
    'wp-content': 'Assets',
    'meta': 'Meta Tag',
    'none': 'Unknown',
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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
      
      {/* Card content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-300 h-full flex flex-col hover:shadow-xl dark:hover:shadow-gray-900/50 min-h-[200px]">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 break-words">
              {subsite.title || 'Untitled Site'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
              {subsite.baseUrl.replace('https://education.ufl.edu', '') || '/'}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {subsite.isLive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Detection info */}
        <div className="mb-auto">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="text-base">{detectionIcons[subsite.detectionMethod]}</span>
            {detectionLabels[subsite.detectionMethod]}
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
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
