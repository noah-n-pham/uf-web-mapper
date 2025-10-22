/**
 * Utility functions for URL handling and normalization
 */

import { URL } from 'url';

/**
 * Normalize a URL by removing fragments, trailing slashes, and query params
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove fragment and trailing slash
    let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    normalized = normalized.replace(/\/+$/, '');
    return normalized || `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

/**
 * Check if URL is under the given root domain
 */
export function isUnderRoot(url: string, root: string): boolean {
  try {
    const urlObj = new URL(url);
    const rootObj = new URL(root);
    return urlObj.host === rootObj.host && urlObj.pathname.startsWith(rootObj.pathname);
  } catch {
    return false;
  }
}

/**
 * Extract the base path of a URL (e.g., /educational-technology/)
 */
export function extractBasePath(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return `/${parts[0]}/`;
    }
    return '/';
  } catch {
    return '/';
  }
}

/**
 * Get the subdirectory path from a URL
 */
export function getSubdirectory(url: string, rootUrl: string): string | null {
  try {
    const parsed = new URL(url);
    const rootParsed = new URL(rootUrl);
    
    if (parsed.host !== rootParsed.host) {
      return null;
    }
    
    const rootPath = rootParsed.pathname.replace(/\/$/, '');
    const urlPath = parsed.pathname.replace(/\/$/, '');
    
    if (urlPath === rootPath || !urlPath.startsWith(rootPath)) {
      return null;
    }
    
    const relativePath = urlPath.substring(rootPath.length);
    const parts = relativePath.split('/').filter(Boolean);
    
    if (parts.length > 0) {
      return `${rootPath}/${parts[0]}/`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a unique ID from a URL
 */
export function generateId(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

