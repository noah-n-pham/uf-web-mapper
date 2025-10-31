/**
 * Type definitions for the Web Mapper crawler
 */

export interface CrawlConfig {
  seedUrl: string;
  maxConcurrency: number;
  delayMs: number;
  userAgent: string;
  outputPath: string;
}

export interface Page {
  path: string;
  title: string | null;
  url: string;
  isLive: boolean;
  outboundLinks: string[];
}

export type DetectionMethod = 'wp-json' | 'wp-content' | 'meta' | 'none';
export type DetectionConfidence = 'high' | 'medium' | 'low';

export interface Subsite {
  id: string;
  baseUrl: string;
  title: string | null;
  detectionMethod: DetectionMethod;
  detectionConfidence: DetectionConfidence;
  isLive: boolean;
  pages: Page[];
  canonicalUrl?: string; // The canonical URL if different from baseUrl
  isAlias?: boolean; // True if this is an alias pointing to another installation
  aliasTarget?: string; // The canonical installation this aliases to
}

export interface CrawlResult {
  crawlTimestamp: string;
  root: string;
  subsiteCount: number;
  subsites: Subsite[];
}

export interface CrawlState {
  visited: Set<string>;
  queue: string[];
  subsites: Map<string, Subsite>;
  pendingRequests: number;
}

