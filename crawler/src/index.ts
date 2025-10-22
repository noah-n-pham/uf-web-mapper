/**
 * Entry point for the UF COE Web Mapper crawler
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Crawler } from './crawler.js';
import { CrawlConfig } from './types.js';

async function main() {
  console.log('🎓 UF College of Education Web Mapper Crawler v1.0\n');
  
  const config: CrawlConfig = {
    seedUrl: 'https://education.ufl.edu/',
    maxConcurrency: 5,
    delayMs: 250,
    userAgent: 'UF-COE-Web-Mapper/1.0 (+mailto:phamkhoi@ufl.edu)',
    outputPath: resolve(process.cwd(), '../public/data.json')
  };
  
  // Allow environment variable override for output path
  if (process.env.OUTPUT_PATH) {
    config.outputPath = resolve(process.cwd(), process.env.OUTPUT_PATH);
  }
  
  console.log(`📍 Output will be saved to: ${config.outputPath}\n`);
  
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

