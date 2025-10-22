/**
 * Main crawler implementation
 */

import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { CrawlConfig, CrawlResult, CrawlState, Subsite, Page } from './types.js';
import { normalizeUrl, isUnderRoot, getSubdirectory, sleep, generateId } from './utils.js';
import { detectWordPress } from './detector.js';

export class Crawler {
  private config: CrawlConfig;
  private state: CrawlState;
  private robots: any;
  private lastRequestTime: number = 0;

  constructor(config: CrawlConfig) {
    this.config = config;
    this.state = {
      visited: new Set<string>(),
      queue: [],
      subsites: new Map<string, Subsite>(),
      pendingRequests: 0
    };
  }

  /**
   * Initialize the crawler by fetching robots.txt
   */
  async initialize(): Promise<void> {
    console.log('🤖 Fetching robots.txt...');
    try {
      const robotsUrl = new URL('/robots.txt', this.config.seedUrl).href;
      const response = await fetch(robotsUrl, {
        headers: { 'User-Agent': this.config.userAgent }
      });
      
      if (response.ok) {
        const robotsTxt = await response.text();
        this.robots = robotsParser(robotsUrl, robotsTxt);
        console.log('✅ robots.txt loaded');
      } else {
        console.log('⚠️  robots.txt not found, proceeding without restrictions');
        this.robots = robotsParser(robotsUrl, ''); // Empty robots = allow all
      }
    } catch (error) {
      console.log('⚠️  Could not fetch robots.txt, proceeding without restrictions');
      this.robots = robotsParser('', '');
    }
  }

  /**
   * Check if URL is allowed by robots.txt
   */
  private isAllowed(url: string): boolean {
    if (!this.robots) return true;
    return this.robots.isAllowed(url, this.config.userAgent) !== false;
  }

  /**
   * Enforce rate limiting
   */
  private async enforceDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.delayMs) {
      await sleep(this.config.delayMs - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch a page and return HTML content
   */
  private async fetchPage(url: string): Promise<{ html: string; status: number } | null> {
    try {
      await this.enforceDelay();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent
        },
        signal: AbortSignal.timeout(15000)
      });
      
      const html = await response.text();
      return { html, status: response.status };
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Extract links from HTML
   */
  private extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    
    $('a[href]').each((_: number, element: any) => {
      const href = $(element).attr('href');
      if (!href) return;
      
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const normalized = normalizeUrl(absoluteUrl);
        
        // Only include links under the root domain
        if (isUnderRoot(normalized, this.config.seedUrl)) {
          links.push(normalized);
        }
      } catch {
        // Invalid URL, skip
      }
    });
    
    return [...new Set(links)]; // Deduplicate
  }

  /**
   * Extract page title from HTML
   */
  private extractTitle(html: string): string | null {
    const $ = cheerio.load(html);
    const title = $('title').first().text().trim();
    return title || null;
  }

  /**
   * Discover subdirectories from the root page
   */
  private async discoverSubdirectories(): Promise<Set<string>> {
    console.log('\n📂 Discovering subdirectories...');
    const subdirs = new Set<string>();
    
    const result = await this.fetchPage(this.config.seedUrl);
    if (!result) {
      console.error('❌ Could not fetch root page');
      return subdirs;
    }
    
    const links = this.extractLinks(result.html, this.config.seedUrl);
    
    for (const link of links) {
      const subdir = getSubdirectory(link, this.config.seedUrl);
      if (subdir) {
        const baseUrl = new URL(subdir, this.config.seedUrl).href;
        subdirs.add(baseUrl);
      }
    }
    
    console.log(`✅ Found ${subdirs.size} potential subdirectories`);
    return subdirs;
  }

  /**
   * Detect and register a subsite
   */
  private async detectSubsite(baseUrl: string): Promise<void> {
    console.log(`\n🔍 Checking: ${baseUrl}`);
    
    const detection = await detectWordPress(baseUrl, this.config.userAgent);
    
    if (detection.isWordPress) {
      const id = generateId(baseUrl);
      console.log(`✅ WordPress detected via ${detection.method} (confidence: ${detection.confidence})`);
      
      // Fetch title
      const result = await this.fetchPage(baseUrl);
      const title = result ? this.extractTitle(result.html) : null;
      
      const subsite: Subsite = {
        id,
        baseUrl,
        title,
        detectionMethod: detection.method,
        detectionConfidence: detection.confidence,
        isLive: result !== null && result.status === 200,
        pages: []
      };
      
      this.state.subsites.set(baseUrl, subsite);
    } else {
      console.log(`ℹ️  Not a WordPress site (checked: wp-json, wp-content, meta)`);
    }
  }

  /**
   * Crawl pages within a subsite
   */
  private async crawlSubsitePages(subsite: Subsite, maxPages: number = 20): Promise<void> {
    console.log(`\n📄 Crawling pages for: ${subsite.baseUrl}`);
    
    const visited = new Set<string>();
    const queue = [subsite.baseUrl];
    const pages: Page[] = [];
    
    while (queue.length > 0 && pages.length < maxPages) {
      const url = queue.shift()!;
      
      if (visited.has(url) || !this.isAllowed(url)) {
        continue;
      }
      
      visited.add(url);
      const result = await this.fetchPage(url);
      
      if (!result) continue;
      
      const title = this.extractTitle(result.html);
      const links = this.extractLinks(result.html, url);
      const outboundLinks = links.filter(link => !link.startsWith(subsite.baseUrl));
      
      // Create relative path
      const urlObj = new URL(url);
      const baseUrlObj = new URL(subsite.baseUrl);
      const path = urlObj.pathname.replace(baseUrlObj.pathname.replace(/\/$/, ''), '') || '/';
      
      const page: Page = {
        path,
        title,
        url,
        isLive: result.status === 200,
        outboundLinks: outboundLinks.slice(0, 5) // Limit outbound links
      };
      
      pages.push(page);
      
      // Add links under this subsite to queue
      for (const link of links) {
        if (link.startsWith(subsite.baseUrl) && !visited.has(link)) {
          queue.push(link);
        }
      }
    }
    
    subsite.pages = pages;
    console.log(`✅ Crawled ${pages.length} pages`);
  }

  /**
   * Main crawl method
   */
  async crawl(): Promise<CrawlResult> {
    await this.initialize();
    
    console.log(`\n🚀 Starting crawl from: ${this.config.seedUrl}`);
    console.log(`⚙️  Concurrency: ${this.config.maxConcurrency}, Delay: ${this.config.delayMs}ms\n`);
    
    // Discover subdirectories
    const subdirectories = await this.discoverSubdirectories();
    
    // Detect WordPress installations
    console.log('\n🔎 Detecting WordPress installations...');
    for (const subdir of subdirectories) {
      await this.detectSubsite(subdir);
    }
    
    // Crawl pages for each subsite
    console.log('\n📚 Crawling subsite pages...');
    for (const subsite of this.state.subsites.values()) {
      await this.crawlSubsitePages(subsite);
    }
    
    // Build result
    const result: CrawlResult = {
      crawlTimestamp: new Date().toISOString(),
      root: this.config.seedUrl,
      subsiteCount: this.state.subsites.size,
      subsites: Array.from(this.state.subsites.values())
    };
    
    console.log(`\n✅ Crawl complete!`);
    console.log(`📊 Found ${result.subsiteCount} WordPress subsites`);
    console.log(`📄 Total pages: ${result.subsites.reduce((sum, s) => sum + s.pages.length, 0)}`);
    
    return result;
  }
}

