/**
 * WordPress subsite detection logic
 */

import { DetectionMethod, DetectionConfidence } from './types.js';

export interface DetectionResult {
  isWordPress: boolean;
  method: DetectionMethod;
  confidence: DetectionConfidence;
  canonicalUrl?: string; // The canonical URL from the page (if different from baseUrl)
}

/**
 * Detect if a URL is a WordPress installation using multiple signals
 */
export async function detectWordPress(
  baseUrl: string,
  userAgent: string
): Promise<DetectionResult> {
  
  // Priority 1: Check for /wp-json/ endpoint
  const wpJsonResult = await checkWpJson(baseUrl, userAgent);
  if (wpJsonResult.isWordPress) {
    // Also check for canonical URL
    const canonicalUrl = await getCanonicalUrl(baseUrl, userAgent);
    return {
      ...wpJsonResult,
      canonicalUrl
    };
  }
  
  // Priority 2: Check for /wp-content/ in asset URLs
  const wpContentResult = await checkWpContent(baseUrl, userAgent);
  if (wpContentResult.isWordPress) {
    const canonicalUrl = await getCanonicalUrl(baseUrl, userAgent);
    return {
      ...wpContentResult,
      canonicalUrl
    };
  }
  
  // Priority 3: Check for meta generator tag
  const metaResult = await checkMetaGenerator(baseUrl, userAgent);
  if (metaResult.isWordPress) {
    const canonicalUrl = await getCanonicalUrl(baseUrl, userAgent);
    return {
      ...metaResult,
      canonicalUrl
    };
  }
  
  return {
    isWordPress: false,
    method: 'none',
    confidence: 'low'
  };
}

/**
 * Check for wp-json endpoint
 */
async function checkWpJson(baseUrl: string, userAgent: string): Promise<DetectionResult> {
  try {
    const wpJsonUrl = `${baseUrl.replace(/\/$/, '')}/wp-json/`;
    const response = await fetch(wpJsonUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return {
          isWordPress: true,
          method: 'wp-json',
          confidence: 'high'
        };
      }
    }
  } catch (error) {
    // Endpoint not available or error - continue to fallback
  }
  
  return {
    isWordPress: false,
    method: 'none',
    confidence: 'low'
  };
}

/**
 * Check for wp-content in page assets
 */
async function checkWpContent(baseUrl: string, userAgent: string): Promise<DetectionResult> {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const html = await response.text();
      const normalizedBase = baseUrl.replace(/\/$/, '');
      
      // Look for wp-content URLs that include the base path
      const wpContentPattern = new RegExp(`${normalizedBase}/wp-content/`, 'i');
      if (wpContentPattern.test(html)) {
        return {
          isWordPress: true,
          method: 'wp-content',
          confidence: 'medium'
        };
      }
    }
  } catch (error) {
    // Error fetching page - continue to next check
  }
  
  return {
    isWordPress: false,
    method: 'none',
    confidence: 'low'
  };
}

/**
 * Check for WordPress meta generator tag
 */
async function checkMetaGenerator(baseUrl: string, userAgent: string): Promise<DetectionResult> {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for WordPress generator meta tag
      const generatorPattern = /<meta[^>]*name=["']generator["'][^>]*content=["']WordPress[^"']*["']/i;
      if (generatorPattern.test(html)) {
        return {
          isWordPress: true,
          method: 'meta',
          confidence: 'medium'
        };
      }
    }
  } catch (error) {
    // Error fetching page
  }
  
  return {
    isWordPress: false,
    method: 'none',
    confidence: 'low'
  };
}

/**
 * Extract canonical URL from a page's HTML
 * Returns the canonical URL if found and different from the baseUrl, otherwise returns undefined
 */
async function getCanonicalUrl(baseUrl: string, userAgent: string): Promise<string | undefined> {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract canonical URL from link tag
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      if (canonicalMatch) {
        const canonicalUrl = canonicalMatch[1];
        const normalizedBase = baseUrl.replace(/\/$/, '');
        const normalizedCanonical = canonicalUrl.replace(/\/$/, '');
        
        // Only return if canonical URL is different from base URL
        if (normalizedBase !== normalizedCanonical) {
          return normalizedCanonical;
        }
      }
    }
  } catch (error) {
    // Error fetching page or parsing - return undefined
  }
  
  return undefined;
}

