import type { Analysis } from '../types/analysis';
import { ScoreRadar } from './ScoreRadar';
import { ScorePill } from './ScorePill';

export const categories = [
  {
    id: 'complexity',
    label: 'Complexity',
    scoreField: 'complexityScore',
    reasoningField: 'complexityReasoning',
    emoji: '🧩',
  },
  {
    id: 'business',
    label: 'Business Impact',
    scoreField: 'businessCostScore',
    reasoningField: 'costReasoning',
    emoji: '💼',
  },
  {
    id: 'market',
    label: 'Market Impact',
    scoreField: 'marketImpactScore',
    reasoningField: 'impactReasoning',
    emoji: '📈',
  },
  {
    id: 'admin',
    label: 'Administrative Impact',
    scoreField: 'administrativeCostScore',
    reasoningField: 'adminReasoning',
    emoji: '📊',
  },
  {
    id: 'dei',
    label: 'DEI Analysis',
    scoreField: 'deiScore',
    reasoningField: 'deiReasoning',
    emoji: '🤝',
  },
  {
    id: 'automation',
    label: 'Automation Potential',
    scoreField: 'automationPotential',
    reasoningField: 'recommendations',
    emoji: '🤖',
  },
];

interface AnalysisDetailsProps {
  analysis: Analysis;
  onViewRegulations: (chapterId: string, title: string) => void;
}

export function AnalysisDetails({
  analysis,
  onViewRegulations,
}: AnalysisDetailsProps) {
  return (
    <details className="group/category bg-white rounded-xl shadow-sm [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden divide-y divide-gray-100">
      <summary className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 pr-8 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4 md:justify-start md:max-w-[50%]">
          <svg
            className="w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 group-open/category:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <div className="flex-1">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">Title {analysis.titleId}</p>
              <h3 className="text-xl font-semibold text-gray-900">
                {analysis.chapterName}
              </h3>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col gap-2 md:min-w-[450px]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="hidden md:block h-60">
              <ScoreRadar analysis={analysis} compact />
            </div>
            <div className="w-full overflow-x-auto md:w-auto md:min-w-[225px] flex flex-row md:flex-col gap-2 md:gap-1 md:items-end pb-2 md:pb-0">
              {categories.map((category) => (
                <div key={category.id} className="flex-shrink-0">
                  <ScorePill
                    label={category.label}
                    score={
                      analysis[category.scoreField as keyof Analysis] as number
                    }
                    emoji={category.emoji}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </summary>

      <div className="px-6 pb-6">
        <div className="mb-8">
          <ScoreRadar analysis={analysis} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y divide-gray-100">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`py-6 ${
                index % 2 === 0 && index === categories.length - 1
                  ? 'md:border-b md:border-gray-100'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <span>{category.emoji}</span>
                  <span>{category.label}</span>
                </h4>
                <ScorePill
                  label={category.label}
                  score={
                    analysis[category.scoreField as keyof Analysis] as number
                  }
                  emoji={category.emoji}
                />
              </div>
              <p className="text-sm text-gray-600">
                {analysis[category.reasoningField as keyof Analysis]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center pt-6 border-t border-gray-100">
          <button
            onClick={() =>
              onViewRegulations(
                analysis.chapterId,
                `${analysis.chapterNumber} - ${analysis.chapterName}`
              )
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            <span>View Regulation Text</span>
          </button>
        </div>
      </div>
    </details>
  );
}
