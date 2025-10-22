import { Metadata } from 'next';
import GridView from '../components/GridView';
import { CrawlResult } from '../types/data';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const metadata: Metadata = {
  title: 'Web Ecosystem Map | UF College of Education',
  description: 'Interactive visualization of UF College of Education web ecosystem',
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-gray-600 mb-4">
            The web ecosystem map data is not available. Please run the crawler first to
            generate the data.
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm font-mono text-gray-800">
              cd crawler && npm install && npm run dev
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <GridView data={data} />;
}

