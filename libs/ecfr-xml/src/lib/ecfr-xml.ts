import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import pLimit from 'p-limit';

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

export interface DownloadResult {
  title: number;
  success: boolean;
  error?: string;
}

export async function downloadECFRTitle(
  title: number,
  outputDir: string
): Promise<DownloadResult> {
  const url = `https://www.govinfo.gov/bulkdata/ECFR/title-${title}/ECFR-title${title}.xml`;
  const outputPath = path.join(outputDir, `title-${title}.xml`);

  try {
    const response = await axios.get(url, { responseType: 'text' });
    await writeFileAsync(outputPath, response.data);
    console.log(`✅ Successfully downloaded Title ${title}`);
    return { title, success: true };
  } catch (error: any) {
    console.error(`❌ Failed to download Title ${title}:`, error.message);
    return { title, success: false, error: error.message };
  }
}

export async function downloadAllTitles(): Promise<DownloadResult[]> {
  // Use absolute path to the package's src/results directory
  const outputDir = path.join(
    process.cwd(),
    'libs/ecfr-xml/src/results/xml-data'
  );

  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Create a limit of 5 concurrent downloads
    const limit = pLimit(5);

    // Create an array of limited download promises
    const downloads = Array.from({ length: 50 }, (_, i) => i + 1).map((title) =>
      limit(() => {
        console.log(`🔄 Queuing download of Title ${title}...`);
        return downloadECFRTitle(title, outputDir);
      })
    );

    return await Promise.all(downloads);
  } catch (error) {
    console.error('Failed to create output directory:', error);
    throw error;
  }
}

// This will be our main entry point for the build command
export async function main() {
  console.log('Starting eCFR XML download...');
  console.log('Downloads will be processed with a concurrency of 5...\n');

  try {
    const results = await downloadAllTitles();
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\nDownload Summary:`);
    console.log(`✅ Successfully downloaded: ${successful} titles`);
    console.log(`❌ Failed downloads: ${failed} titles`);

    if (failed > 0) {
      console.log('\nFailed titles:');
      results
        .filter((r) => !r.success)
        .forEach((r) => console.log(`- Title ${r.title}: ${r.error}`));
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
