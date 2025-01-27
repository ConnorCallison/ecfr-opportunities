import { db, schema } from '@ecfr-opportunities/database';
import { desc, gt, sql, eq, asc } from 'drizzle-orm';
import type { AnalysisFilter } from '../types/analysis';
const { analyses, chapters, titles } = schema;

export interface AnalysisQueryParams {
  filter: AnalysisFilter;
  page: number;
  pageSize: number;
}

// New method to fetch chapter content
export async function getChapterContent(chapterId: string) {
  const [result] = await db
    .select({ content: chapters.content })
    .from(chapters)
    .where(eq(chapters.id, chapterId));

  return result?.content || '';
}

export async function getAnalyses({
  filter,
  page,
  pageSize,
}: AnalysisQueryParams) {
  const offset = (page - 1) * pageSize;

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql`count(*)` })
    .from(analyses)
    .where(gt(analyses.complexityScore, 1));

  // Get paginated and filtered results
  const query = db
    .select({
      id: analyses.id,
      chapterId: analyses.chapterId,
      complexityScore: analyses.complexityScore,
      businessCostScore: analyses.businessCostScore,
      marketImpactScore: analyses.marketImpactScore,
      administrativeCostScore: analyses.administrativeCostScore,
      deiScore: analyses.deiScore,
      automationPotential: analyses.automationPotential,
      complexityReasoning: analyses.complexityReasoning,
      costReasoning: analyses.costReasoning,
      impactReasoning: analyses.impactReasoning,
      adminReasoning: analyses.adminReasoning,
      deiReasoning: analyses.deiReasoning,
      recommendations: analyses.recommendations,
      chapterName: chapters.name,
      chapterNumber: chapters.number,
      titleId: chapters.titleId,
      titleName: titles.name,
    })
    .from(analyses)
    .where(gt(analyses.complexityScore, 1))
    .innerJoin(chapters, eq(analyses.chapterId, chapters.id))
    .innerJoin(titles, eq(chapters.titleId, titles.id))
    .limit(pageSize)
    .offset(offset);

  // Apply ordering based on filter
  const results = await (filter === 'dei'
    ? query.orderBy(asc(analyses.deiScore))
    : filter === 'complexity'
    ? query.orderBy(desc(analyses.complexityScore))
    : filter === 'business'
    ? query.orderBy(desc(analyses.businessCostScore))
    : filter === 'admin'
    ? query.orderBy(desc(analyses.administrativeCostScore))
    : filter === 'market'
    ? query.orderBy(desc(analyses.marketImpactScore))
    : query.orderBy(desc(analyses.automationPotential)));

  return {
    results,
    pagination: {
      total: Number(count),
      pageCount: Math.ceil(Number(count) / pageSize),
      page,
      pageSize,
    },
  };
}
