import type { Analysis } from '../types/analysis';
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
    <details className="group [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden">
      <summary className="p-6 cursor-pointer hover:bg-gray-50 border-b border-gray-100 list-none">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <svg
              className="w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {analysis.titleName}
              </h3>
              <p className="text-gray-600">{analysis.chapterName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <ScorePill
                key={category.id}
                label={category.label}
                score={
                  analysis[
                    category.scoreField as keyof typeof analysis
                  ] as number
                }
                emoji={category.emoji}
              />
            ))}
          </div>
        </div>
      </summary>

      <div className="p-6 bg-gray-50 border-b border-gray-100">
        {/* View Regulations Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() =>
              onViewRegulations(
                analysis.chapterId,
                `${analysis.titleName} - ${analysis.chapterName}`
              )
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            <span className="">View Regulation Text</span>
          </button>
        </div>

        {/* Recommendations Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Key Recommendations</span>
          </h4>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="whitespace-pre-wrap text-gray-700">
              {analysis.recommendations}
            </p>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-gray-500">
              Approximated metrics
            </h4>
            <hr className="border-gray-200" />
          </div>
          {categories.map((category) => (
            <details
              key={category.id}
              className="group/category bg-white rounded-xl shadow-sm [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden"
            >
              <summary className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center list-none">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 group-open/category:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="font-semibold flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.label}</span>
                  </span>
                </div>
                <ScorePill
                  label="Score"
                  score={
                    analysis[
                      category.scoreField as keyof typeof analysis
                    ] as number
                  }
                  emoji={category.emoji}
                />
              </summary>
              <div className="p-4 border-t border-gray-100">
                <p className="whitespace-pre-wrap text-gray-700">
                  {
                    analysis[
                      category.reasoningField as keyof typeof analysis
                    ] as string
                  }
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </details>
  );
}
