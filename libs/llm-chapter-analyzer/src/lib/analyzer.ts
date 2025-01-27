import { OpenAI } from 'openai';
import { db, schema } from '@ecfr-opportunities/database';
import { sql } from 'drizzle-orm';
const { titles, chapters, analyses } = schema;
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the workspace root path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../../../..');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = 'gpt-4o';
const MAX_CHUNK_SIZE = 100000; // Conservative limit for context window

interface AnalyzerConfig {
  titles?: number[]; // Optional list of title numbers to analyze
}

interface AnalysisResult {
  complexityScore: number;
  businessCostScore: number;
  marketImpactScore: number;
  administrativeCostScore: number;
  deiScore: number; // Higher score means more merit-based, lower means more identity-based
  complexityReasoning: string;
  costReasoning: string;
  impactReasoning: string;
  adminReasoning: string;
  deiReasoning: string;
  totalScore: number;
  automationPotential: number;
  recommendations: string;
  usedSummary: boolean;
}

function findNearestSectionBreak(text: string, targetIndex: number): number {
  const sectionMarker = '####';

  // Look forward and backward from the target index for section markers
  const forwardIndex = text.indexOf(sectionMarker, targetIndex);
  const backwardIndex = text.lastIndexOf(sectionMarker, targetIndex);

  // If no section markers found in either direction, return the target index
  if (forwardIndex === -1 && backwardIndex === -1) {
    return targetIndex;
  }

  // If no forward marker, use backward
  if (forwardIndex === -1) {
    return backwardIndex;
  }

  // If no backward marker, use forward
  if (backwardIndex === -1) {
    return forwardIndex;
  }

  // Return the closest marker
  return forwardIndex - targetIndex < targetIndex - backwardIndex
    ? forwardIndex
    : backwardIndex;
}

async function splitAndSummarizeContent(content: string): Promise<string> {
  console.log(`Splitting content of length ${content.length} into chunks...`);

  const chunks: string[] = [];
  let currentPosition = 0;

  while (currentPosition < content.length) {
    // If remaining content is less than max size, add it as final chunk
    if (content.length - currentPosition <= MAX_CHUNK_SIZE) {
      chunks.push(content.slice(currentPosition));
      break;
    }

    // Find the nearest section break to our target chunk size
    const targetEnd = currentPosition + MAX_CHUNK_SIZE;
    const breakPoint = findNearestSectionBreak(content, targetEnd);

    // If no good break point found, use max size
    const chunkEnd =
      breakPoint > currentPosition
        ? breakPoint
        : currentPosition + MAX_CHUNK_SIZE;

    // Add the chunk
    chunks.push(content.slice(currentPosition, chunkEnd));
    currentPosition = chunkEnd;
  }

  console.log(`Created ${chunks.length} chunks based on section boundaries`);

  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Summarizing chunk ${i + 1} of ${chunks.length}...`);
    const chunk = chunks[i];
    console.log(`Chunk ${i + 1} length: ${chunk.length} characters`);
    console.log(`Chunk ${i + 1} starts with: "${chunk.slice(0, 100)}..."`);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at summarizing regulatory text while preserving key details about requirements, scope, and impact.',
        },
        {
          role: 'user',
          content: `Summarize this portion of a federal regulation, focusing on requirements, scope, and potential impact on businesses and administration:

${chunk}`,
        },
      ],
      temperature: 0,
    });

    if (response.choices[0].message.content) {
      const summary = response.choices[0].message.content;
      console.log(
        `Generated summary for chunk ${i + 1}, length: ${
          summary.length
        } characters`
      );
      summaries.push(summary);
    } else {
      console.warn(`No summary generated for chunk ${i + 1}`);
    }
  }

  // If we had to chunk, create a final combined summary
  if (summaries.length > 1) {
    console.log(
      `Combining ${summaries.length} summaries into final overview...`
    );
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at combining regulatory summaries into a coherent overview.',
        },
        {
          role: 'user',
          content: `Combine these summaries of a federal regulation chapter into a single coherent overview, focusing on requirements, scope, and potential impact:

${summaries.join('\n\n')}`,
        },
      ],
      temperature: 0,
    });

    const combinedSummary = response.choices[0].message.content;
    if (!combinedSummary) {
      console.warn(
        'Failed to generate combined summary, returning original content'
      );
      return content;
    }
    console.log(
      `Generated final combined summary, length: ${combinedSummary.length} characters`
    );
    return combinedSummary;
  }

  if (summaries.length === 0) {
    console.warn('No summaries generated, returning original content');
    return content;
  }

  console.log(
    `Returning single summary, length: ${summaries[0].length} characters`
  );
  return summaries[0];
}

async function analyzeChapter(content: string): Promise<AnalysisResult> {
  const needsSummarization = content.length > MAX_CHUNK_SIZE;
  const textToAnalyze = needsSummarization
    ? await splitAndSummarizeContent(content)
    : content;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert at analyzing regulatory text and providing detailed insights about its complexity, costs, and impact.
        You MUST optimize for maximum government efficiency, minimum GDP burden, and merit-based policies while ensuring that the regulations are sensible and in the public interest.
        
        Analyze the provided regulatory text and return a JSON object with the following structure:
        {
          "complexityScore": number, // 1-100 score
          "businessCostScore": number, // 1-100 score
          "marketImpactScore": number, // 1-100 score
          "administrativeCostScore": number, // 1-100 score
          "deiScore": number, // 1-100 score, where 100 = purely merit-based, 1 = heavily identity-based
          "complexityReasoning": string,
          "costReasoning": string,
          "impactReasoning": string,
          "adminReasoning": string,
          "deiReasoning": string, // explain how the regulation handles merit vs identity-based policies
          "totalScore": number, // 1-100 weighted average
          "automationPotential": number, // 1-100 score
          "recommendations": string // list of recommendations for optimization of efficiency and merit-based policies
        }
        
        For each score:
        1 = Minimal impact/complexity (except deiScore where 1 = heavily identity-based)
        100 = Extreme impact/complexity (except deiScore where 100 = purely merit-based)
        
        For deiScore specifically:
        - Score 100: Regulation is purely merit-based, focusing on qualifications, performance, and objective criteria
        - Score 75-99: Mostly merit-based with some consideration of broader access but no explicit preferences
        - Score 50-74: Mixed approach with both merit and identity considerations
        - Score 25-49: Significant identity-based considerations with some merit factors
        - Score 1-24: Heavily identity-based with minimal focus on merit
        
        Provide detailed reasoning for each score in the reasoning fields.`,
      },
      {
        role: 'user',
        content: textToAnalyze,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });
  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error('No response content received from OpenAI');
  }
  const result = JSON.parse(response);
  return {
    ...result,
    usedSummary: needsSummarization,
  };
}

export async function analyzeAllChapters(config: AnalyzerConfig = {}) {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');

    // Get all markdown files
    const markdownDir = path.join(
      workspaceRoot,
      'libs/ecfr-markdown/src/results/markdown'
    );

    console.log('Looking for markdown files in:', markdownDir);

    // Get all title directories
    const titleDirs = await fs.readdir(markdownDir);
    console.log('Found title directories:', titleDirs);

    for (const titleDir of titleDirs) {
      try {
        // Extract title number
        const titleId = parseInt(titleDir.replace('title-', ''));
        console.log(`Processing Title ${titleId}...`);

        // Skip if not in the configured titles list
        if (config.titles && !config.titles.includes(titleId)) {
          console.log(`Skipping Title ${titleId} - not in configured list`);
          continue;
        }

        // Read all markdown files in this title directory
        const titlePath = path.join(markdownDir, titleDir);
        const files = await fs.readdir(titlePath);
        console.log(`Found ${files.length} files in Title ${titleId}:`, files);

        for (const file of files) {
          try {
            if (!file.endsWith('.md')) continue;

            // Extract chapter from filename
            const chapterNumber = file.replace('.md', '');
            console.log(`Processing Chapter ${chapterNumber}...`);

            // Read markdown content
            const content = await fs.readFile(
              path.join(titlePath, file),
              'utf-8'
            );
            console.log(`Read ${content.length} characters from ${file}`);

            // Upsert title record
            console.log('Upserting title record...');
            await db
              .insert(titles)
              .values({
                id: titleId,
                name: `Title ${titleId}`,
              })
              .onConflictDoUpdate({
                target: titles.id,
                set: {
                  name: `Title ${titleId}`,
                },
              });

            // Upsert chapter record
            const chapterId = `${titleId}-${chapterNumber}`;
            console.log('Upserting chapter record...');
            await db
              .insert(chapters)
              .values({
                id: chapterId,
                titleId,
                number: chapterNumber,
                name: `Chapter ${chapterNumber}`,
                content,
              })
              .onConflictDoUpdate({
                target: chapters.id,
                set: {
                  content,
                },
              });

            // Generate analysis
            console.log(
              `Analyzing Title ${titleId} Chapter ${chapterNumber}...`
            );
            const analysis = await analyzeChapter(content);
            if (analysis.usedSummary) {
              console.log(
                `Note: Chapter was too large, analysis based on summary`
              );
            }

            // Upsert analysis
            console.log('Upserting analysis record...');
            await db
              .insert(analyses)
              .values({
                id: `analysis-${chapterId}`,
                chapterId,
                complexityScore: analysis.complexityScore,
                businessCostScore: analysis.businessCostScore,
                marketImpactScore: analysis.marketImpactScore,
                administrativeCostScore: analysis.administrativeCostScore,
                deiScore: analysis.deiScore,
                complexityReasoning: analysis.complexityReasoning,
                costReasoning: analysis.costReasoning,
                impactReasoning: analysis.impactReasoning,
                adminReasoning: analysis.adminReasoning,
                deiReasoning: analysis.deiReasoning,
                totalScore: analysis.totalScore,
                automationPotential: analysis.automationPotential,
                recommendations: analysis.recommendations,
                modelVersion: MODEL,
                promptVersion: '1.1',
              })
              .onConflictDoUpdate({
                target: analyses.id,
                set: {
                  complexityScore: analysis.complexityScore,
                  businessCostScore: analysis.businessCostScore,
                  marketImpactScore: analysis.marketImpactScore,
                  administrativeCostScore: analysis.administrativeCostScore,
                  deiScore: analysis.deiScore,
                  complexityReasoning: analysis.complexityReasoning,
                  costReasoning: analysis.costReasoning,
                  impactReasoning: analysis.impactReasoning,
                  adminReasoning: analysis.adminReasoning,
                  deiReasoning: analysis.deiReasoning,
                  totalScore: analysis.totalScore,
                  automationPotential: analysis.automationPotential,
                  recommendations: analysis.recommendations,
                  modelVersion: MODEL,
                  promptVersion: '1.1',
                },
              });

            console.log(
              `Completed analysis for Title ${titleId} Chapter ${chapterNumber}`
            );
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing title directory ${titleDir}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in analyzeAllChapters:', error);
  }
}
