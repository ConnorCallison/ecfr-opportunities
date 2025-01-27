import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, useFetcher } from '@remix-run/react';
import {
  getAnalyses,
  getChapterContent,
  type AnalysisFilter,
} from '../models/analysis.server';
import { useState, useEffect } from 'react';
import { RegulationsModal } from '../components/RegulationsModal';

// Define loader return types
interface ChapterContent {
  content: string;
}

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

type LoaderData = ChapterContent | AnalysisData;

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

// Filter options
const filterOptions: { id: AnalysisFilter; label: string }[] = [
  { id: 'complexity', label: 'Most Complex' },
  { id: 'business', label: 'Highest Business Impact' },
  { id: 'admin', label: 'Highest Admin Cost' },
  { id: 'market', label: 'Highest Market Impact' },
  { id: 'dei', label: 'DEI Heavy' },
  { id: 'automation', label: 'Automation Potential' },
];

// Category definitions for the analysis details
const categories = [
  {
    id: 'complexity',
    label: 'Complexity',
    scoreField: 'complexityScore',
    reasoningField: 'complexityReasoning',
  },
  {
    id: 'business',
    label: 'Business Impact',
    scoreField: 'businessCostScore',
    reasoningField: 'costReasoning',
  },
  {
    id: 'market',
    label: 'Market Impact',
    scoreField: 'marketImpactScore',
    reasoningField: 'impactReasoning',
  },
  {
    id: 'admin',
    label: 'Administrative Impact',
    scoreField: 'administrativeCostScore',
    reasoningField: 'adminReasoning',
  },
  {
    id: 'dei',
    label: 'DEI Analysis',
    scoreField: 'deiScore',
    reasoningField: 'deiReasoning',
  },
  {
    id: 'automation',
    label: 'Automation Potential',
    scoreField: 'automationPotential',
    reasoningField: 'recommendations',
  },
];

export default function Index() {
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

  // Get results and pagination if available
  const results = 'results' in data ? data.results : [];
  const pagination = 'pagination' in data ? data.pagination : null;

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

  // Update modal content when fetcher loads
  useEffect(() => {
    if (fetcher.data && modalContent.isOpen) {
      setModalContent((prev) => ({
        ...prev,
        content: fetcher.data.content || '',
      }));
    }
  }, [fetcher.data, modalContent.isOpen]);

  if (!pagination) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">eCFR Analysis Dashboard</h1>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleFilterChange(id)}
            className={`px-4 py-2 rounded-full ${
              currentFilter === id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Analysis Table */}
      <div className="bg-white shadow rounded-lg">
        {results.map((analysis: Analysis) => (
          <details key={analysis.id} className="border-b last:border-b-0">
            <summary className="p-4 cursor-pointer hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {analysis.titleName}
                  </h3>
                  <p className="text-gray-600">{analysis.chapterName}</p>
                </div>
                <div className="flex gap-4">
                  {categories.map((category) => (
                    <ScorePill
                      key={category.id}
                      label={category.label}
                      score={
                        analysis[
                          category.scoreField as keyof typeof analysis
                        ] as number
                      }
                    />
                  ))}
                </div>
              </div>
            </summary>

            {/* Expanded Content */}
            <div className="p-4 bg-gray-50">
              {/* View Regulations Button */}
              <div className="mb-4">
                <button
                  onClick={() =>
                    handleViewRegulations(
                      analysis.chapterId,
                      `${analysis.titleName} - ${analysis.chapterName}`
                    )
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Regulations
                </button>
              </div>

              {/* Recommendations Section */}
              <div className="mb-6 border-b pb-4">
                <h4 className="text-lg font-semibold mb-3">
                  Key Recommendations
                </h4>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="whitespace-pre-wrap">
                    {analysis.recommendations}
                  </p>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 gap-4">
                {categories.map((category) => (
                  <details
                    key={category.id}
                    className="bg-white rounded-lg shadow-sm"
                  >
                    <summary className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                      <span className="font-semibold">{category.label}</span>
                      <ScorePill
                        label="Score"
                        score={
                          analysis[
                            category.scoreField as keyof typeof analysis
                          ] as number
                        }
                      />
                    </summary>
                    <div className="p-4 border-t">
                      <p className="whitespace-pre-wrap">
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
        onClose={() => setModalContent((prev) => ({ ...prev, isOpen: false }))}
        content={modalContent.content}
        title={modalContent.title}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {pagination.pageCount}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.pageCount}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Score Pill Component
function ScorePill({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm ${getColor(score)}`}>
      {label}: {score}
    </div>
  );
}
