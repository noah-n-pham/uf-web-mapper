/**
 * Type definitions for the crawl data
 */

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
}

export interface CrawlResult {
  crawlTimestamp: string;
  root: string;
  subsiteCount: number;
  subsites: Subsite[];
}

