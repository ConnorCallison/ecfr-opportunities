import { OpenAI } from 'openai';
import { db, schema } from '@ecfr-opportunities/database';
import { sql } from 'drizzle-orm';
const { titles, chapters, analyses } = schema;
import * as fs from 'fs/promises';
import * as path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = 'gpt-4o';
const MAX_CHUNK_SIZE = 12000; // Conservative limit for context window

interface AnalyzerConfig {
  titles?: number[]; // Optional list of title numbers to analyze
}

interface AnalysisResult {
  complexityScore: number;
  businessCostScore: number;
  marketImpactScore: number;
  administrativeCostScore: number;
  complexityReasoning: string;
  costReasoning: string;
  impactReasoning: string;
  adminReasoning: string;
  totalScore: number;
  automationPotential: number;
  recommendations: string;
  usedSummary: boolean;
}

async function splitAndSummarizeContent(content: string): Promise<string> {
  // Split content into chunks of roughly MAX_CHUNK_SIZE characters
  const chunks = content.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}`, 'g')) || [];
  const summaries: string[] = [];

  for (const chunk of chunks) {
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

    summaries.push(response.choices[0].message.content);
  }

  // If we had to chunk, create a final combined summary
  if (summaries.length > 1) {
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

    return response.choices[0].message.content;
  }

  return summaries[0] || content;
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
        
        Analyze the provided regulatory text and return a JSON object with the following structure:
        {
          "complexityScore": number, // 1-100 score
          "businessCostScore": number, // 1-100 score
          "marketImpactScore": number, // 1-100 score
          "administrativeCostScore": number, // 1-100 score
          "complexityReasoning": string,
          "costReasoning": string,
          "impactReasoning": string,
          "adminReasoning": string,
          "totalScore": number, // 1-100 weighted average
          "automationPotential": number, // 1-100 score
          "recommendations": string
        }
        
        For each score:
        1 = Minimal impact/complexity
        100 = Extreme impact/complexity
        
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
      process.cwd(),
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
                complexityReasoning: analysis.complexityReasoning,
                costReasoning: analysis.costReasoning,
                impactReasoning: analysis.impactReasoning,
                adminReasoning: analysis.adminReasoning,
                totalScore: analysis.totalScore,
                automationPotential: analysis.automationPotential,
                recommendations: analysis.recommendations,
                modelVersion: MODEL,
                promptVersion: '1.0',
              })
              .onConflictDoUpdate({
                target: analyses.id,
                set: {
                  complexityScore: analysis.complexityScore,
                  businessCostScore: analysis.businessCostScore,
                  marketImpactScore: analysis.marketImpactScore,
                  administrativeCostScore: analysis.administrativeCostScore,
                  complexityReasoning: analysis.complexityReasoning,
                  costReasoning: analysis.costReasoning,
                  impactReasoning: analysis.impactReasoning,
                  adminReasoning: analysis.adminReasoning,
                  totalScore: analysis.totalScore,
                  automationPotential: analysis.automationPotential,
                  recommendations: analysis.recommendations,
                  modelVersion: MODEL,
                  promptVersion: '1.0',
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
