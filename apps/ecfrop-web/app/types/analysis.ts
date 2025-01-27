export type AnalysisFilter =
  | 'complexity'
  | 'business'
  | 'admin'
  | 'market'
  | 'dei'
  | 'automation';

export interface Analysis {
  id: string;
  chapterId: string;
  complexityScore: number;
  businessCostScore: number;
  marketImpactScore: number;
  administrativeCostScore: number;
  deiScore: number;
  automationPotential: number;
  complexityReasoning: string;
  costReasoning: string;
  impactReasoning: string;
  adminReasoning: string;
  deiReasoning: string;
  recommendations: string;
  chapterName: string;
  chapterNumber: string;
  titleId: number;
  titleName: string;
}
