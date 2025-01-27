import { db, schema } from '../index.js';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { titles, chapters } = schema;

async function bootstrap() {
  try {
    console.log('Starting database bootstrap...');

    // Get the absolute path to the workspace root
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const workspaceRoot = path.resolve(__dirname, '../../../../..');

    // First find all JSON files to get chapter metadata
    const jsonGlobPattern = path.join(
      workspaceRoot,
      'libs/ecfr-split/src/results/chapters/title-*/chapter-*.json'
    );
    console.log('Looking for JSON files matching:', jsonGlobPattern);

    // Find all chapter JSON files
    const chapterFiles = await glob(jsonGlobPattern);
    console.log(`Found ${chapterFiles.length} chapter files`);
    if (chapterFiles.length === 0) {
      console.log('No files found. Current working directory:', process.cwd());
      console.log('Workspace root:', workspaceRoot);
    } else {
      console.log('First few files found:');
      chapterFiles.slice(0, 3).forEach((file) => console.log('  -', file));
    }

    // Track unique titles
    const titleMap = new Map<number, string>();

    // Process each chapter file
    for (const jsonFilePath of chapterFiles) {
      // Extract title number from path
      const titleMatch = jsonFilePath.match(/title-(\d+)/);
      if (!titleMatch) continue;
      const titleId = parseInt(titleMatch[1], 10);

      // Extract chapter number from path
      const chapterMatch = jsonFilePath.match(/chapter-([^.]+)\.json/);
      if (!chapterMatch) continue;
      const chapterNumber = chapterMatch[1];

      // Read and parse chapter JSON file for metadata
      const jsonContent = await readFile(jsonFilePath, 'utf-8');
      const chapterData = JSON.parse(jsonContent);

      // Extract chapter title and clean it up
      const chapterTitle =
        chapterData.title?.replace(/^CHAPTER [IVX\d]+—/, '').trim() ||
        `Chapter ${chapterNumber}`;

      // Extract title name if not already tracked
      if (!titleMap.has(titleId)) {
        const titleName = `Title ${titleId}`;
        titleMap.set(titleId, titleName);
      }

      // Generate a stable ID for the chapter
      const chapterId = `${titleId}-chapter-${chapterNumber}`;
      // Construct path to corresponding markdown file
      const markdownPath = path.join(
        workspaceRoot,
        'libs/ecfr-markdown/src/results/markdown',
        `title-${titleId}`,
        `chapter-${chapterNumber}.md`
      );

      // Read markdown content
      let markdownContent;
      try {
        markdownContent = await readFile(markdownPath, 'utf-8');
      } catch (error) {
        console.warn(
          `Warning: Could not read markdown for Title ${titleId} Chapter ${chapterNumber}`
        );
        continue;
      }

      // Insert or update title
      await db
        .insert(titles)
        .values({
          id: titleId,
          name: titleMap.get(titleId)!,
        })
        .onConflictDoUpdate({
          target: titles.id,
          set: {
            name: titleMap.get(titleId)!,
            updatedAt: new Date(),
          },
        });

      // Insert or update chapter with markdown content
      await db
        .insert(chapters)
        .values({
          id: chapterId,
          titleId,
          number: chapterNumber,
          name: chapterTitle,
          content: markdownContent, // Use markdown content instead of JSON
        })
        .onConflictDoUpdate({
          target: chapters.id,
          set: {
            titleId,
            number: chapterNumber,
            name: chapterTitle,
            content: markdownContent, // Use markdown content instead of JSON
            updatedAt: new Date(),
          },
        });

      console.log(
        `Processed Title ${titleId}, Chapter ${chapterNumber}: ${chapterTitle}`
      );
    }

    console.log('Bootstrap complete!');
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();
