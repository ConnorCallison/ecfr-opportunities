import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, useFetcher } from '@remix-run/react';
import { getAnalyses, type AnalysisFilter } from '../models/analysis.server';
import { useState, useEffect } from 'react';
import { RegulationsModal } from '../components/RegulationsModal';

// Define loader return types
interface Analysis {
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

interface AnalysisData {
  results: Analysis[];
  pagination: {
    total: number;
    pageCount: number;
    page: number;
    pageSize: number;
  };
}

// Loader function to fetch data
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filter =
    (url.searchParams.get('filter') as AnalysisFilter) || 'complexity';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = 10;

  const data = await getAnalyses({ filter, page, pageSize });
  return json<AnalysisData>(data);
}

// Filter options with emojis
const filterOptions: { id: AnalysisFilter; label: string; emoji: string }[] = [
  { id: 'complexity', label: 'Most Complex', emoji: '🧩' },
  { id: 'business', label: 'Highest Business Impact', emoji: '💼' },
  { id: 'admin', label: 'Highest Admin Cost', emoji: '📊' },
  { id: 'market', label: 'Highest Market Impact', emoji: '📈' },
  { id: 'dei', label: 'DEI Heavy', emoji: '🤝' },
  { id: 'automation', label: 'Automation Potential', emoji: '🤖' },
];

// Category definitions for the analysis details
const categories = [
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

export default function Analysis() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter =
    (searchParams.get('filter') as AnalysisFilter) || 'complexity';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const fetcher = useFetcher<{ content: string }>();
  const [modalContent, setModalContent] = useState<{
    isOpen: boolean;
    content: string;
    title: string;
  }>({
    isOpen: false,
    content: '',
    title: '',
  });

  // Update modal content when fetcher loads
  useEffect(() => {
    if (fetcher.data && modalContent.isOpen) {
      setModalContent((prev) => ({
        ...prev,
        content: fetcher.data.content || '',
      }));
    }
  }, [fetcher.data, modalContent.isOpen]);

  // Handle filter change
  const handleFilterChange = (filter: AnalysisFilter) => {
    setSearchParams((prev) => {
      prev.set('filter', filter);
      prev.set('page', '1');
      return prev;
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', page.toString());
      return prev;
    });
  };

  // Handle viewing regulations
  const handleViewRegulations = async (chapterId: string, title: string) => {
    setModalContent({
      isOpen: true,
      content: 'Loading...',
      title,
    });

    fetcher.load(`/api/chapter/${chapterId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Explore and analyze federal regulations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filterOptions.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => handleFilterChange(id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                currentFilter === id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:scale-105'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Analysis Table */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          {data.results.map((analysis: Analysis) => (
            <details key={analysis.id} className="group">
              <summary className="p-6 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {analysis.titleName}
                    </h3>
                    <p className="text-gray-600">{analysis.chapterName}</p>
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

              {/* Expanded Content */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                {/* View Regulations Button */}
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() =>
                      handleViewRegulations(
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
                  {categories.map((category) => (
                    <details
                      key={category.id}
                      className="bg-white rounded-xl shadow-sm group"
                    >
                      <summary className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span>{category.label}</span>
                        </span>
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
          ))}
        </div>

        {/* Regulations Modal */}
        <RegulationsModal
          isOpen={modalContent.isOpen}
          onClose={() =>
            setModalContent((prev) => ({ ...prev, isOpen: false }))
          }
          content={modalContent.content}
          title={modalContent.title}
        />

        {/* Pagination */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-6 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white rounded-lg shadow-sm">
            Page {currentPage} of {data.pagination.pageCount}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === data.pagination.pageCount}
            className="px-6 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Score Pill Component
function ScorePill({
  label,
  score,
  emoji,
}: {
  label: string;
  score: number;
  emoji: string;
}) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getColor(
        score
      )}`}
    >
      <span>{emoji}</span>
      <span>
        {label}: {score}
      </span>
    </div>
  );
}
