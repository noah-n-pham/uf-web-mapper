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
        y: -6,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      onClick={onClick}
      className="group relative"
    >
      {/* Sophisticated glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-400/30 via-emerald-400/30 to-purple-400/30 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
      
      {/* Card content with warm colors */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-200 dark:border-stone-800 p-7 cursor-pointer transition-all duration-300 h-full flex flex-col min-h-[200px] group-hover:shadow-2xl group-hover:border-sky-300 dark:group-hover:border-sky-700 backdrop-blur-sm">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/10 to-transparent dark:from-sky-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Header */}
        <div className="flex items-start gap-3 mb-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 break-words mb-2 leading-snug">
              {subsite.title || 'Untitled Site'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate font-mono bg-stone-50 dark:bg-stone-800/50 px-2 py-1 rounded-md">
              {subsite.baseUrl.replace('https://education.ufl.edu', '') || '/'}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {subsite.isLive ? (
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-stone-400 dark:text-stone-500" />
              </div>
            )}
          </div>
        </div>

        {/* Detection info */}
        <div className="mb-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <span className="text-base">{detectionIcons[subsite.detectionMethod]}</span>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {detectionLabels[subsite.detectionMethod]}
            </span>
          </div>
        </div>

        {/* Stats footer */}
        <div className="mt-5 pt-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <div className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">{subsite.pages.length}</span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              page{subsite.pages.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <motion.div
            className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
            whileHover={{ x: 3 }}
          >
            <span className="text-sm">Explore</span>
            <ExternalLink className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
