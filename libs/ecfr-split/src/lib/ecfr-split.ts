import * as fs from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const parseXmlAsync = promisify(parseString);

export interface Chapter {
  number: string;
  title: string;
  content: any;
}

export interface SplitResult {
  title: number;
  chapters: Chapter[];
  success: boolean;
  error?: string;
}

function findChapters(obj: any): any[] {
  const chapters: any[] = [];

  // Base case: if this is not an object or array, return empty array
  if (typeof obj !== 'object' || obj === null) {
    return chapters;
  }

  // If this is a chapter div, add it
  if (obj.$ && obj.$.TYPE === 'CHAPTER') {
    chapters.push(obj);
  }

  // Recursively search all properties
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      // If property is an array, search each element
      obj[key].forEach((item: any) => {
        chapters.push(...findChapters(item));
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // If property is an object, search it
      chapters.push(...findChapters(obj[key]));
    }
  }

  return chapters;
}

export async function splitTitleIntoChapters(
  titleNumber: number,
  inputDir: string,
  outputDir: string
): Promise<SplitResult> {
  try {
    const inputPath = path.join(inputDir, `title-${titleNumber}.xml`);
    const titleOutputDir = path.join(outputDir, `title-${titleNumber}`);

    // Create output directory for this title
    await mkdir(titleOutputDir, { recursive: true });

    // Read and parse XML
    const xmlContent = await readFileAsync(inputPath, 'utf-8');
    const result: any = await parseXmlAsync(xmlContent);

    // Write parsed XML to temp file for inspection
    const tempOutputPath = path.join(
      outputDir,
      `title-${titleNumber}-parsed.json`
    );
    await writeFileAsync(tempOutputPath, JSON.stringify(result, null, 2));
    console.log(`📝 Wrote parsed XML to ${tempOutputPath}`);

    // Find all chapters recursively
    const divs = findChapters(result);
    const chapters: Chapter[] = [];

    for (const div of divs) {
      const chapter: Chapter = {
        number: div.$.N,
        title: div.HEAD?.[0] || '',
        content: div,
      };

      // Save chapter to its own file
      const chapterPath = path.join(
        titleOutputDir,
        `chapter-${chapter.number}.json`
      );
      await writeFileAsync(chapterPath, JSON.stringify(chapter, null, 2));
      chapters.push(chapter);

      console.log(
        `✅ Extracted Chapter ${chapter.number} from Title ${titleNumber}`
      );
    }

    return {
      title: titleNumber,
      chapters,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ Failed to split Title ${titleNumber}:`, error.message);
    return {
      title: titleNumber,
      chapters: [],
      success: false,
      error: error.message,
    };
  }
}

export async function splitAllTitles(): Promise<SplitResult[]> {
  const inputDir = path.join(
    process.cwd(),
    'libs/ecfr-xml/src/results/xml-data'
  );
  const outputDir = path.join(
    process.cwd(),
    'libs/ecfr-split/src/results/chapters'
  );

  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Process all 50 titles
    const splits = Array.from({ length: 50 }, (_, i) => i + 1).map((title) =>
      splitTitleIntoChapters(title, inputDir, outputDir)
    );

    return await Promise.all(splits);
  } catch (error) {
    console.error('Failed to create output directory:', error);
    throw error;
  }
}

// This will be our main entry point for the build command
export async function main() {
  console.log('Starting eCFR chapter splitting...');

  try {
    const results = await splitAllTitles();
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalChapters = results.reduce(
      (sum, r) => sum + r.chapters.length,
      0
    );

    console.log(`\nSplit Summary:`);
    console.log(`✅ Successfully processed: ${successful} titles`);
    console.log(`📚 Total chapters extracted: ${totalChapters}`);
    console.log(`❌ Failed splits: ${failed} titles`);

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
