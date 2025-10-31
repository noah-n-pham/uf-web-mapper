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
   * Extract all unique first-level subdirectory patterns from URLs
   */
  private extractAllSubdirectoryPatterns(urls: Set<string>): Set<string> {
    const patterns = new Set<string>();
    const rootPath = new URL(this.config.seedUrl).pathname.replace(/\/$/, '');
    
    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        // Extract first-level subdirectory after root
        const relativePath = path.replace(rootPath, '').replace(/^\//, '');
        const parts = relativePath.split('/').filter(Boolean);
        
        if (parts.length > 0) {
          patterns.add(parts[0]);
        }
      } catch {
        // Invalid URL
      }
    }
    
    return patterns;
  }

  /**
   * Aggressively discover ALL subdirectories by deep crawling and pattern extraction
   */
  private async discoverSubdirectories(): Promise<Set<string>> {
    console.log('\n📂 Discovering ALL subdirectories (comprehensive scan)...');
    const subdirs = new Set<string>();
    const allUrls = new Set<string>();
    const visited = new Set<string>();
    const queue = [this.config.seedUrl];
    
    // Phase 1: Deep crawl to collect ALL URLs (no depth limit, but page limit for time)
    console.log('🔍 Phase 1: Deep crawling for all URLs...');
    const maxPagesToCheck = 200; // Increased for comprehensive discovery
    let pagesChecked = 0;
    
    while (queue.length > 0 && pagesChecked < maxPagesToCheck) {
      const currentUrl = queue.shift()!;
      
      if (visited.has(currentUrl) || !this.isAllowed(currentUrl)) {
        continue;
      }
      
      visited.add(currentUrl);
      allUrls.add(currentUrl);
      pagesChecked++;
      
      if (pagesChecked % 50 === 0) {
        console.log(`   Crawled ${pagesChecked} pages, found ${allUrls.size} unique URLs...`);
      }
      
      const result = await this.fetchPage(currentUrl);
      if (!result) continue;
      
      const links = this.extractLinks(result.html, currentUrl);
      
      for (const link of links) {
        allUrls.add(link);
        const subdir = getSubdirectory(link, this.config.seedUrl);
        if (subdir) {
          const baseUrl = new URL(subdir, this.config.seedUrl).href;
          subdirs.add(baseUrl);
        }
        
        // Add to queue for further exploration
        if (!visited.has(link) && isUnderRoot(link, this.config.seedUrl)) {
          queue.push(link);
        }
      }
    }
    
    console.log(`✅ Crawled ${pagesChecked} pages, collected ${allUrls.size} unique URLs`);
    console.log(`✅ Found ${subdirs.size} subdirectories from links`);
    
    // Phase 2: Extract ALL unique subdirectory patterns from collected URLs
    console.log('\n🔍 Phase 2: Extracting subdirectory patterns from all URLs...');
    const patterns = this.extractAllSubdirectoryPatterns(allUrls);
    console.log(`✅ Found ${patterns.size} unique subdirectory patterns`);
    
    // Phase 3: Test each pattern to see if it exists
    console.log('\n🔍 Phase 3: Testing all patterns for existence...');
    let testedCount = 0;
    for (const pattern of patterns) {
      const testUrl = `${this.config.seedUrl.replace(/\/$/, '')}/${pattern}/`;
      
      // Skip if already found
      if (subdirs.has(testUrl)) continue;
      
      try {
        await this.enforceDelay();
        const response = await fetch(testUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok || response.status === 301 || response.status === 302) {
          subdirs.add(testUrl);
          testedCount++;
        }
      } catch {
        // Pattern doesn't exist
      }
    }
    
    console.log(`✅ Found ${testedCount} additional subdirectories from pattern testing`);
    console.log(`✅ TOTAL: ${subdirs.size} potential subdirectories discovered`);
    
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
      
      // Check for canonical URL mismatch
      if (detection.canonicalUrl) {
        console.log(`⚠️  Canonical URL differs: ${detection.canonicalUrl}`);
      }
      
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
        pages: [],
        canonicalUrl: detection.canonicalUrl
      };
      
      this.state.subsites.set(baseUrl, subsite);
    } else {
      console.log(`ℹ️  Not a WordPress site (checked: wp-json, wp-content, meta)`);
    }
  }

  /**
   * Fetch pages from WordPress REST API
   */
  private async fetchPagesFromAPI(subsite: Subsite): Promise<Page[]> {
    const pages: Page[] = [];
    const baseUrl = subsite.baseUrl.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/wp-json/wp/v2/pages`;
    
    try {
      // First request to get total count
      await this.enforceDelay();
      const response = await fetch(`${apiUrl}?per_page=100`, {
        method: 'GET',
        headers: { 'User-Agent': this.config.userAgent },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        console.log(`⚠️  API not accessible, falling back to crawling`);
        return this.crawlSubsitePagesLegacy(subsite);
      }
      
      const totalPages = parseInt(response.headers.get('X-WP-Total') || '0');
      const totalApiPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      
      console.log(`   API reports ${totalPages} pages across ${totalApiPages} API page(s)`);
      
      // Fetch all pages from API
      for (let apiPage = 1; apiPage <= totalApiPages && apiPage <= 10; apiPage++) {
        await this.enforceDelay();
        
        const pageResponse = await fetch(`${apiUrl}?per_page=100&page=${apiPage}`, {
          method: 'GET',
          headers: { 'User-Agent': this.config.userAgent },
          signal: AbortSignal.timeout(15000)
        });
        
        if (!pageResponse.ok) continue;
        
        const pageData = await pageResponse.json() as any[];
        
        for (const wpPage of pageData) {
          const pageUrl = wpPage.link || '';
          const urlObj = new URL(pageUrl);
          const baseUrlObj = new URL(baseUrl);
          const path = urlObj.pathname.replace(baseUrlObj.pathname.replace(/\/$/, ''), '') || '/';
          
          pages.push({
            path,
            title: wpPage.title?.rendered || null,
            url: pageUrl,
            isLive: true,
            outboundLinks: [] // Could extract from content if needed
          });
        }
      }
      
      return pages;
      
    } catch (error) {
      console.log(`⚠️  API error, falling back to crawling`);
      return this.crawlSubsitePagesLegacy(subsite);
    }
  }

  /**
   * Legacy crawling method (fallback when API not available)
   */
  private async crawlSubsitePagesLegacy(subsite: Subsite, maxPages: number = 50): Promise<Page[]> {
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
        outboundLinks: outboundLinks.slice(0, 5)
      };
      
      pages.push(page);
      
      // Add links under this subsite to queue
      for (const link of links) {
        if (link.startsWith(subsite.baseUrl) && !visited.has(link)) {
          queue.push(link);
        }
      }
    }
    
    return pages;
  }

  /**
   * Crawl pages within a subsite using WordPress API
   */
  private async crawlSubsitePages(subsite: Subsite): Promise<void> {
    console.log(`\n📄 Crawling pages for: ${subsite.baseUrl}`);
    
    const pages = await this.fetchPagesFromAPI(subsite);
    
    subsite.pages = pages;
    console.log(`✅ Found ${pages.length} pages`);
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
   * Detect and flag subsites that are aliases (point to the same canonical URL)
   */
  private detectAliases(): void {
    const subsiteArray = Array.from(this.state.subsites.values());
    
    for (const subsite of subsiteArray) {
      if (subsite.canonicalUrl) {
        // Normalize URLs for comparison
        const normalizedCanonical = subsite.canonicalUrl.replace(/\/$/, '');
        
        // Check if the canonical URL matches any other subsite's baseUrl
        for (const otherSubsite of subsiteArray) {
          const normalizedOtherBase = otherSubsite.baseUrl.replace(/\/$/, '');
          
          if (normalizedCanonical === normalizedOtherBase && subsite.id !== otherSubsite.id) {
            // This is an alias pointing to another subsite
            subsite.isAlias = true;
            subsite.aliasTarget = otherSubsite.baseUrl;
            console.log(`   ➜ ${subsite.baseUrl} is an alias for ${otherSubsite.baseUrl}`);
            break;
          }
        }
        
        // Even if no matching subsite found, if canonical differs, note it
        if (!subsite.isAlias) {
          console.log(`   ⚠️  ${subsite.baseUrl} has canonical URL ${subsite.canonicalUrl} (no matching subsite found)`);
        }
      }
    }
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
    
    // Detect aliases (subsites with canonical URLs pointing to other subsites)
    console.log('\n🔗 Detecting aliases...');
    this.detectAliases();
    
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

