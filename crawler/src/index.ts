/**
 * Entry point for the UF COE Web Mapper crawler
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Crawler } from './crawler.js';
import { CrawlConfig } from './types.js';

async function main() {
  console.log('🎓 UF College of Education Web Mapper Crawler v1.0\n');
  
  // Get configuration from environment variables with sensible defaults
  const contactEmail = process.env.CRAWLER_CONTACT_EMAIL || 'crawler@example.com';
  const userAgent = process.env.CRAWLER_USER_AGENT || `UF-COE-Web-Mapper/1.0 (+mailto:${contactEmail})`;
  const seedUrl = process.env.SEED_URL || 'https://education.ufl.edu/';
  const maxConcurrency = parseInt(process.env.MAX_CONCURRENCY || '5', 10);
  const delayMs = parseInt(process.env.DELAY_MS || '250', 10);
  
  const config: CrawlConfig = {
    seedUrl,
    maxConcurrency,
    delayMs,
    userAgent,
    outputPath: resolve(process.cwd(), process.env.OUTPUT_PATH || '../public/data.json')
  };
  
  console.log(`📍 Seed URL: ${config.seedUrl}`);
  console.log(`📍 Output will be saved to: ${config.outputPath}`);
  console.log(`📍 User-Agent: ${config.userAgent}\n`);
  
  const crawler = new Crawler(config);
  
  try {
    const result = await crawler.crawl();
    
    // Write result to file
    await writeFile(
      config.outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 Data saved to: ${config.outputPath}`);
    console.log('\n🎉 Done!\n');
    
  } catch (error) {
    console.error('\n❌ Crawler failed:', error);
    process.exit(1);
  }
}

main();

