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
      {/* Warm gradient glow on hover */}
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"
        style={{ background: 'linear-gradient(to right, rgba(2, 132, 199, 0.15), rgba(5, 150, 105, 0.15))' }}
      ></div>
      
      {/* Card content */}
      <div 
        className="relative rounded-xl border p-6 cursor-pointer transition-all duration-300 h-full flex flex-col min-h-[200px]"
        style={{
          background: 'var(--bg-tertiary)',
          borderColor: 'var(--border-primary)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-base transition-colors line-clamp-2 break-words mb-2 group-hover-accent"
              style={{ color: 'var(--text-primary)' }}
            >
              {subsite.title || 'Untitled Site'}
            </h3>
            <p 
              className="text-xs truncate font-mono"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {subsite.baseUrl.replace('https://education.ufl.edu', '') || '/'}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {subsite.isLive ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--status-icon-success)' }} />
            ) : (
              <AlertCircle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
        </div>

        {/* Detection info */}
        <div className="mb-auto">
          <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span className="text-base">{detectionIcons[subsite.detectionMethod]}</span>
            {detectionLabels[subsite.detectionMethod]}
          </span>
        </div>

        {/* Stats */}
        <div 
          className="mt-4 pt-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{subsite.pages.length}</span>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              page{subsite.pages.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <motion.div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--accent-blue)' }}
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
