import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, useFetcher } from '@remix-run/react';
import { getAnalyses } from '../models/analysis.server';
import type { Analysis, AnalysisFilter } from '../types/analysis';
import { useState, useEffect } from 'react';
import { RegulationsModal } from '../components/RegulationsModal';
import { FilterOptions } from '../components/FilterOptions';
import { AnalysisDetails } from '../components/AnalysisDetails';
import { InfoModal } from '../components/InfoModal';

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
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && modalContent.isOpen) {
      const data = fetcher.data as { content: string };
      setModalContent((prev) => ({
        ...prev,
        content: data.content,
      }));
    }
  }, [fetcher.data, fetcher.state, modalContent.isOpen]);

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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Analysis Dashboard
              </h1>
              <p className="text-gray-600">
                Explore and analyze federal regulations
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Score Guide</span>
            </button>
          </div>

          <FilterOptions
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Analysis Table */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          {data.results.map((analysis) => (
            <AnalysisDetails
              key={analysis.id}
              analysis={analysis}
              onViewRegulations={handleViewRegulations}
            />
          ))}
        </div>

        {/* Modals */}
        <RegulationsModal
          isOpen={modalContent.isOpen}
          onClose={() =>
            setModalContent((prev) => ({ ...prev, isOpen: false }))
          }
          content={modalContent.content}
          title={modalContent.title}
        />

        <InfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
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
