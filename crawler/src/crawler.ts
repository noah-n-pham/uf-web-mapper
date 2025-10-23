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
   * Check common WordPress Multisite subdirectory patterns
   */
  private async checkCommonSubdirectories(): Promise<Set<string>> {
    const commonPatterns = [
      'educational-technology',
      'education-technology',
      'edtech',
      'special-education',
      'specialeducation',
      'higher-education',
      'highereducation',
      'curriculum',
      'counseling',
      'school-psychology',
      'schoolpsychology',
      'edleadership',
      'educational-leadership',
      'elearning',
      'e-learning',
      'lastinger',
      'coe-research',
      'graduate',
      'undergraduate',
      'online-programs',
      'cep',
      'ese',
      'erme',
    ];
    
    const foundSubdirs = new Set<string>();
    
    for (const pattern of commonPatterns) {
      const testUrl = `${this.config.seedUrl.replace(/\/$/, '')}/${pattern}/`;
      
      try {
        await this.enforceDelay();
        const response = await fetch(testUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok || response.status === 301 || response.status === 302) {
          foundSubdirs.add(testUrl);
        }
      } catch {
        // Pattern doesn't exist
      }
    }
    
    return foundSubdirs;
  }

  /**
   * Discover subdirectories by crawling multiple levels
   */
  private async discoverSubdirectories(): Promise<Set<string>> {
    console.log('\n📂 Discovering subdirectories...');
    const subdirs = new Set<string>();
    const visited = new Set<string>();
    const queue = [this.config.seedUrl];
    
    // Crawl up to 3 levels deep to find all subdirectories
    let depth = 0;
    const maxDepth = 3;
    const maxPagesToCheck = 100;
    let pagesChecked = 0;
    
    while (queue.length > 0 && depth < maxDepth && pagesChecked < maxPagesToCheck) {
      const currentUrl = queue.shift()!;
      
      if (visited.has(currentUrl) || !this.isAllowed(currentUrl)) {
        continue;
      }
      
      visited.add(currentUrl);
      pagesChecked++;
      
      const result = await this.fetchPage(currentUrl);
      if (!result) continue;
      
      const links = this.extractLinks(result.html, currentUrl);
      
      for (const link of links) {
        const subdir = getSubdirectory(link, this.config.seedUrl);
        if (subdir) {
          const baseUrl = new URL(subdir, this.config.seedUrl).href;
          subdirs.add(baseUrl);
          
          // Add to queue for further exploration if not visited
          if (!visited.has(link) && isUnderRoot(link, this.config.seedUrl)) {
            queue.push(link);
          }
        }
      }
      
      depth++;
    }
    
    console.log(`✅ Found ${subdirs.size} subdirectories from crawling`);
    
    // Also check common patterns
    console.log('🔍 Checking common WordPress subdirectory patterns...');
    const commonSubdirs = await this.checkCommonSubdirectories();
    
    for (const subdir of commonSubdirs) {
      subdirs.add(subdir);
    }
    
    console.log(`✅ Total: ${subdirs.size} potential subdirectories`);
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
  private async crawlSubsitePages(subsite: Subsite, maxPages: number = 100): Promise<void> {
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
   * Check if a subdirectory is a separate WordPress installation
   * by comparing its WordPress signals to the root site
   */
  private async isSeparateWordPressInstall(subdirUrl: string): Promise<boolean> {
    // Check if subdir has its own wp-json endpoint (most reliable)
    try {
      const subdirWpJson = `${subdirUrl.replace(/\/$/, '')}/wp-json/`;
      const response = await fetch(subdirWpJson, {
        method: 'GET',
        headers: { 'User-Agent': this.config.userAgent },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data: any = await response.json();
          // Check if the wp-json endpoint reports this subdir as its URL
          if (data && data.url && data.url.includes(subdirUrl.replace(/\/$/, ''))) {
            return true; // Separate installation
          }
        }
      }
    } catch {
      // wp-json not available for this subdir
    }
    
    // Check if subdir has its own wp-content path
    try {
      const response = await fetch(subdirUrl, {
        method: 'GET',
        headers: { 'User-Agent': this.config.userAgent },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const html = await response.text();
        const subdirPath = new URL(subdirUrl).pathname.replace(/\/$/, '');
        
        // Look for wp-content URLs that include this subdirectory path
        // e.g., /subdir/wp-content/ indicates separate installation
        const separateWpContentPattern = new RegExp(`${subdirPath}/wp-content/`, 'i');
        if (separateWpContentPattern.test(html)) {
          return true; // Has its own wp-content
        }
      }
    } catch {
      // Error checking
    }
    
    return false; // Likely just a page of the root site
  }

  /**
   * Main crawl method
   */
  async crawl(): Promise<CrawlResult> {
    await this.initialize();
    
    console.log(`\n🚀 Starting crawl from: ${this.config.seedUrl}`);
    console.log(`⚙️  Concurrency: ${this.config.maxConcurrency}, Delay: ${this.config.delayMs}ms\n`);
    
    // First, detect the ROOT WordPress installation
    console.log('🔎 Detecting root WordPress installation...');
    const rootDetection = await detectWordPress(this.config.seedUrl, this.config.userAgent);
    
    if (rootDetection.isWordPress) {
      console.log(`✅ Root site is WordPress (via ${rootDetection.method}, confidence: ${rootDetection.confidence})`);
      
      // Create root subsite entry
      const result = await this.fetchPage(this.config.seedUrl);
      const title = result ? this.extractTitle(result.html) : null;
      
      const rootSubsite: Subsite = {
        id: generateId(this.config.seedUrl),
        baseUrl: this.config.seedUrl,
        title: title || 'UF College of Education',
        detectionMethod: rootDetection.method,
        detectionConfidence: rootDetection.confidence,
        isLive: result !== null && result.status === 200,
        pages: []
      };
      
      this.state.subsites.set(this.config.seedUrl, rootSubsite);
    } else {
      console.log('⚠️  Root site is not WordPress or cannot be detected');
    }
    
    // Discover subdirectories
    const subdirectories = await this.discoverSubdirectories();
    
    // Detect SEPARATE WordPress installations (not just pages)
    console.log('\n🔎 Detecting separate WordPress installations in subdirectories...');
    for (const subdir of subdirectories) {
      console.log(`\n🔍 Checking: ${subdir}`);
      
      // Check if this is a separate WordPress installation
      const isSeparate = await this.isSeparateWordPressInstall(subdir);
      
      if (isSeparate) {
        await this.detectSubsite(subdir);
      } else {
        console.log(`ℹ️  Not a separate WordPress installation (likely a page of root site)`);
      }
    }
    
    // Crawl pages for each subsite (including root)
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
    console.log(`📊 Found ${result.subsiteCount} WordPress site(s) (including root)`);
    console.log(`📄 Total pages: ${result.subsites.reduce((sum, s) => sum + s.pages.length, 0)}`);
    
    return result;
  }
}

