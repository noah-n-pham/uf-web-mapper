/**
 * WordPress subsite detection logic
 */

import { DetectionMethod, DetectionConfidence } from './types.js';

export interface DetectionResult {
  isWordPress: boolean;
  method: DetectionMethod;
  confidence: DetectionConfidence;
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
    return wpJsonResult;
  }
  
  // Priority 2: Check for /wp-content/ in asset URLs
  const wpContentResult = await checkWpContent(baseUrl, userAgent);
  if (wpContentResult.isWordPress) {
    return wpContentResult;
  }
  
  // Priority 3: Check for meta generator tag
  const metaResult = await checkMetaGenerator(baseUrl, userAgent);
  if (metaResult.isWordPress) {
    return metaResult;
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

