import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative pt-24 pb-16 sm:pb-24">
          {/* Hero section */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-8">
              <span className="block">Federal Regulation</span>
              <span className="block text-blue-600">Analysis Platform</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12">
              Leveraging AI to analyze federal regulations, identify complexity,
              assess business impact, and provide actionable recommendations for
              regulatory optimization.
            </p>
            <Link
              to="/analysis"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all gap-2"
            >
              <span>View Analysis</span>
              <span className="text-2xl">📊</span>
            </Link>
          </div>

          {/* Features section */}
          <div className="mt-32">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🧩</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Complexity Analysis
                </h3>
                <p className="text-gray-600">
                  Evaluate the intricacy of regulations using advanced AI
                  algorithms to identify areas for simplification.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Business Impact
                </h3>
                <p className="text-gray-600">
                  Assess the economic implications of regulations on businesses
                  and market dynamics.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Smart Recommendations
                </h3>
                <p className="text-gray-600">
                  Get actionable insights and recommendations for improving
                  regulatory efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="mt-32">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Titles Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  1000+
                </div>
                <div className="text-gray-600">Chapters Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  5000+
                </div>
                <div className="text-gray-600">Recommendations Generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
