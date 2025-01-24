import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export interface ConversionResult {
  title: number;
  chapter: string;
  success: boolean;
  error?: string;
}

function handleText(text: string | any): string {
  if (!text) return '';
  if (Array.isArray(text)) return text.map((t) => handleText(t)).join(' ');
  if (typeof text === 'object') return handleText(text._);
  return text.toString().replace(/\n+/g, ' ').trim();
}

// Convert XML elements to markdown
function elementToMarkdown(element: any, depth = 0): string {
  if (!element) return '';

  let md = '';
  const indent = '  '.repeat(depth);

  // Handle HEAD elements first as they contain titles
  if (element.HEAD) {
    md += `${indent}${handleText(element.HEAD[0])}\n\n`;
  }

  // Handle different division types (DIV1-DIV8)
  if (element.$ && element.$.TYPE) {
    switch (element.$.TYPE) {
      case 'CHAPTER':
        md += `# Chapter ${element.$.N}\n\n`;
        break;
      case 'SUBCHAP':
        md += `## Subchapter ${element.$.N}\n\n`;
        break;
      case 'PART':
        md += `### Part ${element.$.N}\n\n`;
        break;
      case 'SECTION':
        md += `#### § ${element.$.N}\n\n`;
        break;
    }
  }

  // Handle authority citations
  if (element.AUTH) {
    md += `**Authority:** `;
    element.AUTH.forEach((auth: any) => {
      if (auth.HED) md += `${handleText(auth.HED[0])} `;
      if (auth.PSPACE) md += `${handleText(auth.PSPACE[0])}\n\n`;
    });
  }

  // Handle source citations
  if (element.SOURCE) {
    md += `**Source:** `;
    element.SOURCE.forEach((source: any) => {
      if (source.HED) md += `${handleText(source.HED[0])} `;
      if (source.PSPACE) md += `${handleText(source.PSPACE[0])}\n\n`;
    });
  }

  // Handle paragraphs
  if (element.P) {
    element.P.forEach((p: any) => {
      if (typeof p === 'string') {
        md += `${indent}${handleText(p)}\n\n`;
      } else if (p._ || typeof p === 'object') {
        // Handle paragraphs with text and inline elements
        let text = p._ || '';

        // Handle emphasized text
        if (p.E) {
          p.E.forEach((e: any) => {
            const emphText = typeof e === 'string' ? e : e._;
            if (emphText) {
              text = text.replace(emphText, `*${emphText}*`);
            }
          });
        }

        // Handle italic text
        if (p.I) {
          (Array.isArray(p.I) ? p.I : [p.I]).forEach((i: any) => {
            const italicText = typeof i === 'string' ? i : i._;
            if (italicText) {
              text = text.replace(italicText, `_${italicText}_`);
            }
          });
        }

        md += `${indent}${handleText(text)}\n\n`;
      }
    });
  }

  // Handle citations
  if (element.CITA) {
    element.CITA.forEach((cita: any) => {
      if (cita._) {
        md += `> ${handleText(cita._)}\n\n`;
      }
    });
  }

  // Recursively process nested divisions
  ['DIV1', 'DIV2', 'DIV3', 'DIV4', 'DIV5', 'DIV6', 'DIV7', 'DIV8'].forEach(
    (divKey) => {
      if (element[divKey]) {
        element[divKey].forEach((div: any) => {
          md += elementToMarkdown(div, depth + 1);
        });
      }
    }
  );

  return md;
}

export async function convertChapterToMarkdown(
  titleNumber: number,
  chapterNumber: string,
  inputDir: string,
  outputDir: string
): Promise<ConversionResult> {
  try {
    const inputPath = path.join(
      inputDir,
      `title-${titleNumber}`,
      `chapter-${chapterNumber}.json`
    );
    const outputPath = path.join(
      outputDir,
      `title-${titleNumber}`,
      `chapter-${chapterNumber}.md`
    );

    // Create output directory
    await mkdir(path.dirname(outputPath), { recursive: true });

    // Read chapter JSON
    const chapterContent = JSON.parse(await readFileAsync(inputPath, 'utf-8'));

    // Convert to markdown
    const markdown = elementToMarkdown(chapterContent.content);

    // Add metadata header
    const frontMatter = `---
title: ${chapterContent.title.trim()}
chapter: ${chapterNumber}
title_number: ${titleNumber}
---

`;

    // Write markdown file
    await writeFileAsync(outputPath, frontMatter + markdown);
    console.log(
      `✅ Converted Chapter ${chapterNumber} from Title ${titleNumber}`
    );

    return {
      title: titleNumber,
      chapter: chapterNumber,
      success: true,
    };
  } catch (error: any) {
    console.error(
      `❌ Failed to convert Chapter ${chapterNumber} from Title ${titleNumber}:`,
      error.message
    );
    return {
      title: titleNumber,
      chapter: chapterNumber,
      success: false,
      error: error.message,
    };
  }
}

export async function convertAllChapters(): Promise<ConversionResult[]> {
  const inputDir = path.join(
    process.cwd(),
    'libs/ecfr-split/src/results/chapters'
  );
  const outputDir = path.join(
    process.cwd(),
    'libs/ecfr-markdown/src/results/markdown'
  );

  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    const results: ConversionResult[] = [];

    // Process all titles
    for (let title = 1; title <= 50; title++) {
      const titleDir = path.join(inputDir, `title-${title}`);

      // Skip if title directory doesn't exist
      if (!fs.existsSync(titleDir)) continue;

      // Get all chapter files
      const files = await fs.promises.readdir(titleDir);
      const chapterFiles = files.filter(
        (f) => f.startsWith('chapter-') && f.endsWith('.json')
      );

      // Convert each chapter
      for (const file of chapterFiles) {
        const chapterNumber = file.replace('chapter-', '').replace('.json', '');
        const result = await convertChapterToMarkdown(
          title,
          chapterNumber,
          inputDir,
          outputDir
        );
        results.push(result);
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to process chapters:', error);
    throw error;
  }
}

// This will be our main entry point for the build command
export async function main() {
  console.log('Starting eCFR markdown conversion...');

  try {
    const results = await convertAllChapters();
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\nConversion Summary:`);
    console.log(`✅ Successfully converted: ${successful} chapters`);
    console.log(`❌ Failed conversions: ${failed} chapters`);

    if (failed > 0) {
      console.log('\nFailed chapters:');
      results
        .filter((r) => !r.success)
        .forEach((r) =>
          console.log(`- Title ${r.title} Chapter ${r.chapter}: ${r.error}`)
        );
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
