import { Metadata } from 'next';
import InteractiveDataExplorer from './components/InteractiveDataExplorer';
import { CrawlResult } from './types/data';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const metadata: Metadata = {
  title: 'Interactive Data Explorer | UF College of Education',
  description: 'Advanced visualization of UF College of Education web ecosystem',
};

async function getData(): Promise<CrawlResult> {
  try {
    const filePath = join(process.cwd(), 'public', 'data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading data.json:', error);
    // Return empty data structure if file doesn't exist
    return {
      crawlTimestamp: new Date().toISOString(),
      root: 'https://education.ufl.edu/',
      subsiteCount: 0,
      subsites: [],
    };
  }
}

export default async function MapPage() {
  const data = await getData();

  if (data.subsiteCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
              🎓
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">No Data Available</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The web ecosystem map data is not available. Please run the crawler first to
              generate the data.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                cd crawler && npm install && npm run dev
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <InteractiveDataExplorer data={data} />;
}
