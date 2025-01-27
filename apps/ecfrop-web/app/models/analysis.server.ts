import { db, schema } from '@ecfr-opportunities/database';
import { desc, gt, sql, eq } from 'drizzle-orm';
const { analyses, chapters, titles } = schema;

export type AnalysisFilter =
  | 'complexity'
  | 'business'
  | 'admin'
  | 'market'
  | 'dei'
  | 'automation';

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

  // Determine sort column based on filter
  const sortColumn = {
    complexity: analyses.complexityScore,
    business: analyses.businessCostScore,
    admin: analyses.administrativeCostScore,
    market: analyses.marketImpactScore,
    dei: analyses.deiScore,
    automation: analyses.automationPotential,
  }[filter];

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyses)
    .where(gt(analyses.complexityScore, 1));

  // Get paginated and filtered results
  const results = await db
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
    .innerJoin(chapters, sql`${analyses.chapterId} = ${chapters.id}`)
    .innerJoin(titles, sql`${chapters.titleId} = ${titles.id}`)
    .orderBy(desc(sortColumn))
    .limit(pageSize)
    .offset(offset);

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
