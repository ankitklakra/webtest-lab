import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TestDetailPage = () => {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`/api/tests/${id}`, config);
        setTest(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch test details');
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, navigate]);

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const getScoreClass = (score) => {
    if (score >= 0.9) return 'text-green-800 bg-green-100';
    if (score >= 0.5) return 'text-yellow-800 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteTest = async () => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`/api/tests/${id}`, config);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete test');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test not found</h2>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{test.url}</h1>
          <div className="flex items-center mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${test.status === 'completed'
                ? 'bg-green-100 text-green-800' 
                : test.status === 'running' 
                ? 'bg-blue-100 text-blue-800'
                : test.status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              {new Date(test.createdAt).toLocaleString()}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Type: {test.testType.charAt(0).toUpperCase() + test.testType.slice(1)}
            </span>
          </div>
        </div>
        <button
          onClick={handleDeleteTest}
          className="text-red-600 hover:text-red-800"
        >
          Delete Test
        </button>
      </div>

      {test.status === 'pending' || test.status === 'running' ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Test is currently running...</p>
          </div>
        </div>
      ) : test.status === 'failed' ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-semibold">Test Failed</p>
            <p>{test.errorMessage || 'An unknown error occurred during testing.'}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {test.testType === 'all' ? 'Performance Test Results' :
                test.testType === 'accessibility' ? 'Accessibility Test Results (Axe)' :
                  test.testType === 'security' ? 'Security Test Results (OWASP ZAP)' :
                    test.testType === 'browser' ? 'Browser Compatibility Results (Selenium)' :
                      test.testType === 'seo' ? 'SEO Test Results' :
                        'Test Results'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {test.testType === 'all' && (
                <>
              {test.results.performance && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Performance</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.performance.score)}`}>
                    {formatScore(test.results.performance.score)}
                  </div>
                </div>
              )}
              {test.results.accessibility && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Accessibility</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.accessibility.score)}`}>
                    {formatScore(test.results.accessibility.score)}
                  </div>
                </div>
              )}
                  {test.results.performance && test.results.performance.bestPractices && (
                    <div className="text-center p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Best Practices</p>
                      <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.performance.bestPractices)}`}>
                        {formatScore(test.results.performance.bestPractices)}
                      </div>
                    </div>
                  )}
              {test.results.seo && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">SEO</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.seo.score)}`}>
                    {formatScore(test.results.seo.score)}
                  </div>
                </div>
              )}
                </>
              )}

              {test.testType === 'accessibility' && test.results.accessibility && (
                <div className="text-center p-4 bg-gray-50 rounded-md w-full">
                  <p className="text-sm text-gray-500 mb-1">Accessibility Score</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.accessibility.score)}`}>
                    {formatScore(test.results.accessibility.score)}
                  </div>
                </div>
              )}

              {test.testType === 'security' && test.results.security && (
                <div className="text-center p-4 bg-gray-50 rounded-md w-full">
                  <p className="text-sm text-gray-500 mb-1">Security Scan Type</p>
                  <div className="text-xl font-medium">
                    {test.results.security.scanType ? test.results.security.scanType.charAt(0).toUpperCase() + test.results.security.scanType.slice(1) : 'Standard'}
                  </div>
                </div>
              )}

              {test.testType === 'browser' && test.results.browser && test.results.browser.overall && (
                <>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Visual Score</p>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${test.results.browser.overall.visualScore >= 90 ? 'bg-green-100 text-green-800' :
                        test.results.browser.overall.visualScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {test.results.browser.overall.visualScore}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Functional Score</p>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${test.results.browser.overall.functionalScore >= 90 ? 'bg-green-100 text-green-800' :
                        test.results.browser.overall.functionalScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {test.results.browser.overall.functionalScore}%
                    </div>
                  </div>
                <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Performance Score</p>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${test.results.browser.overall.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        test.results.browser.overall.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {test.results.browser.overall.performanceScore}%
                    </div>
                  </div>
                </>
              )}

              {test.testType === 'seo' && test.results.seo && (
                <div className="text-center p-4 bg-gray-50 rounded-md w-full">
                  <p className="text-sm text-gray-500 mb-1">SEO Score</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.seo.score)}`}>
                    {formatScore(test.results.seo.score)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Section - Show only for performance test */}
          {(test.testType === 'all') && test.results.performance && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Lighthouse Results</h2>

              {/* Scores Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Performance Score */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Performance</h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xl font-bold px-3 py-1 rounded-md ${getScoreClass(test.results.performance.score)}`}>
                      {formatScore(test.results.performance.score)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${test.results.performance.score >= 0.9 ? 'bg-green-600' :
                          test.results.performance.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                        }`}
                      style={{ width: `${formatScore(test.results.performance.score)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Accessibility Score */}
                {test.results.accessibility && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Accessibility</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xl font-bold px-3 py-1 rounded-md ${getScoreClass(test.results.accessibility.score)}`}>
                        {formatScore(test.results.accessibility.score)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${test.results.accessibility.score >= 0.9 ? 'bg-green-600' :
                            test.results.accessibility.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                        style={{ width: `${formatScore(test.results.accessibility.score)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Best Practices Score */}
                {test.results.performance.bestPractices && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xl font-bold px-3 py-1 rounded-md ${getScoreClass(test.results.performance.bestPractices)}`}>
                        {formatScore(test.results.performance.bestPractices)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${test.results.performance.bestPractices >= 0.9 ? 'bg-green-600' :
                            test.results.performance.bestPractices >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                        style={{ width: `${formatScore(test.results.performance.bestPractices)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* SEO Score */}
                {test.results.seo && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">SEO</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xl font-bold px-3 py-1 rounded-md ${getScoreClass(test.results.seo.score)}`}>
                        {formatScore(test.results.seo.score)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${test.results.seo.score >= 0.9 ? 'bg-green-600' :
                            test.results.seo.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                        style={{ width: `${formatScore(test.results.seo.score)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Metrics Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Core Web Vitals</h3>
              {test.results.performance.metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {test.results.performance.metrics.FCP && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">First Contentful Paint (FCP)</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.FCP}s</p>
                        <p className="text-xs text-gray-500 mt-1">Time until the browser renders the first bit of content</p>
                    </div>
                  )}
                  {test.results.performance.metrics.LCP && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Largest Contentful Paint (LCP)</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.LCP}s</p>
                        <p className="text-xs text-gray-500 mt-1">Time until the largest content element is rendered</p>
                    </div>
                  )}
                  {test.results.performance.metrics.CLS && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Cumulative Layout Shift (CLS)</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.CLS}</p>
                        <p className="text-xs text-gray-500 mt-1">Measures visual stability (lower is better)</p>
                    </div>
                  )}
                  {test.results.performance.metrics.TTI && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Time to Interactive (TTI)</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.TTI}s</p>
                        <p className="text-xs text-gray-500 mt-1">Time until the page becomes fully interactive</p>
                      </div>
                    )}
                    {test.results.performance.metrics.TBT && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Total Blocking Time (TBT)</p>
                        <p className="text-xl font-medium">{test.results.performance.metrics.TBT}ms</p>
                        <p className="text-xs text-gray-500 mt-1">Sum of time where main thread was blocked</p>
                      </div>
                    )}
                    {test.results.performance.metrics.SI && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-500">Speed Index (SI)</p>
                        <p className="text-xl font-medium">{test.results.performance.metrics.SI}s</p>
                        <p className="text-xs text-gray-500 mt-1">How quickly content is visibly populated</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accessibility Issues Section */}
              {test.results.accessibility && test.results.accessibility.issues && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3">Accessibility Issues</h3>
                  {test.results.accessibility.issues.length > 0 ? (
                    <div className="bg-gray-50 rounded-md p-4">
                      <ul className="divide-y divide-gray-200">
                        {test.results.accessibility.issues.slice(0, 5).map((issue, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-start">
                              <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${issue.impact === 'critical' ? 'bg-red-100 text-red-800' :
                                  issue.impact === 'serious' ? 'bg-orange-100 text-orange-800' :
                                    issue.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                }`}>
                                {issue.impact}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-md font-medium">{issue.description}</h4>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {test.results.accessibility.issues.length > 5 && (
                        <div className="mt-3 text-center">
                          <p className="text-gray-500 text-sm">+ {test.results.accessibility.issues.length - 5} more issues</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600">No accessibility issues detected!</p>
                  )}
                </div>
              )}

              {/* SEO Issues Section */}
              {test.results.seo && test.results.seo.issues && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3">SEO Recommendations</h3>
                  {test.results.seo.issues.length > 0 ? (
                    <div className="bg-gray-50 rounded-md p-4">
                      <ul className="divide-y divide-gray-200">
                        {test.results.seo.issues.slice(0, 5).map((issue, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-start">
                              <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${issue.impact === 'serious'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {issue.impact}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-md font-medium">{issue.description}</h4>
                                {issue.recommendation && (
                                  <p className="mt-1 text-sm text-gray-600">{issue.recommendation}</p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {test.results.seo.issues.length > 5 && (
                        <div className="mt-3 text-center">
                          <p className="text-gray-500 text-sm">+ {test.results.seo.issues.length - 5} more issues</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600">No SEO issues detected!</p>
                  )}
                </div>
              )}

              {/* Best Practices Issues Section */}
              {test.results.performance.bestPracticesIssues && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3">Best Practices Recommendations</h3>
                  {test.results.performance.bestPracticesIssues.length > 0 ? (
                    <div className="bg-gray-50 rounded-md p-4">
                      <ul className="divide-y divide-gray-200">
                        {test.results.performance.bestPracticesIssues.slice(0, 5).map((issue, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-start">
                              <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                                {issue.impact || 'Medium'}
                              </div>
                              <div className="ml-3">
                                <h4 className="text-md font-medium">{issue.title || issue.description}</h4>
                                {issue.description && issue.title && (
                                  <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {test.results.performance.bestPracticesIssues.length > 5 && (
                        <div className="mt-3 text-center">
                          <p className="text-gray-500 text-sm">+ {test.results.performance.bestPracticesIssues.length - 5} more issues</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600">No best practices issues detected!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Security Section - Show only for security test */}
          {(test.testType === 'security') && test.results.security && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Security Results (OWASP ZAP)</h2>

              {test.results.security.scanType && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Scan Type: <span className="font-medium">{test.results.security.scanType.charAt(0).toUpperCase() + test.results.security.scanType.slice(1)}</span>
                  </p>
                </div>
              )}

              {test.results.security.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {test.results.security.summary.high >= 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">High Risk</p>
                      <p className="text-2xl font-bold text-red-600">
                        {test.results.security.summary.high}
                      </p>
                    </div>
                  )}

                  {test.results.security.summary.medium >= 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Medium Risk</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {test.results.security.summary.medium}
                      </p>
                    </div>
                  )}

                  {test.results.security.summary.low >= 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Low Risk</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {test.results.security.summary.low}
                      </p>
                    </div>
                  )}

                  {test.results.security.summary.informational >= 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Informational</p>
                      <p className="text-2xl font-bold text-green-600">
                        {test.results.security.summary.informational}
                      </p>
                    </div>
                  )}

                  {test.results.security.summary.total >= 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Total Alerts</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {test.results.security.summary.total}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <h3 className="text-lg font-medium mb-3">Vulnerability Details</h3>
              {test.results.security.vulnerabilities && test.results.security.vulnerabilities.length > 0 ? (
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {test.results.security.vulnerabilities.map((vuln, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start">
                        <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(vuln.severity)}`}>
                          {vuln.severity}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-medium">{vuln.name}</h4>
                          <p className="mt-1 text-sm text-gray-600">{vuln.description}</p>
                            {vuln.location && (
                              <div className="mt-2 flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Location:</span>
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{vuln.location}</code>
                              </div>
                            )}
                          </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              ) : (
                <p className="text-green-600">No security vulnerabilities detected!</p>
              )}
            </div>
          )}

          {/* Accessibility Section - Show only for accessibility test */}
          {(test.testType === 'accessibility') && test.results.accessibility && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility Results (Axe)</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Overall Accessibility Score</span>
                  <div className={`px-3 py-1 rounded-md font-bold ${getScoreClass(test.results.accessibility.score)}`}>
                    {formatScore(test.results.accessibility.score)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${test.results.accessibility.score >= 0.9 ? 'bg-green-600' :
                        test.results.accessibility.score >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                      }`}
                    style={{ width: `${formatScore(test.results.accessibility.score)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-md p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Violations</p>
                  <p className="text-2xl font-bold text-red-600">
                    {test.results.accessibility.issues ? test.results.accessibility.issues.length : 0}
                  </p>
                </div>

                {test.results.accessibility.passCount && (
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Passed Tests</p>
                    <p className="text-2xl font-bold text-green-600">
                      {test.results.accessibility.passCount}
                    </p>
                  </div>
                )}

                {test.results.accessibility.incompleteCount && (
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Incomplete Tests</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {test.results.accessibility.incompleteCount}
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium mb-3">WCAG Violations</h3>
              {test.results.accessibility.issues && test.results.accessibility.issues.length > 0 ? (
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {test.results.accessibility.issues.map((issue, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start">
                          <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${issue.impact === 'critical' ? 'bg-red-100 text-red-800' :
                              issue.impact === 'serious' ? 'bg-orange-100 text-orange-800' :
                                issue.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.impact}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-medium">{issue.description}</h4>
                          {issue.element && (
                            <div className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                              <code className="text-xs">{issue.element}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              ) : (
                <p className="text-green-600">No accessibility issues detected!</p>
              )}
            </div>
          )}

          {/* Browser Compatibility Section - Show only for browser test */}
          {(test.testType === 'browser') && test.results.browser && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Browser Compatibility Results (Selenium)</h2>

              {test.results.browser.overall && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {test.results.browser.overall.visualScore && (
              <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-md font-medium mb-2">Visual Consistency</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${test.results.browser.overall.visualScore >= 90 ? 'bg-green-600' :
                                test.results.browser.overall.visualScore >= 70 ? 'bg-yellow-500' : 'bg-red-600'
                              }`}
                            style={{ width: `${test.results.browser.overall.visualScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${test.results.browser.overall.visualScore >= 90 ? 'text-green-600' :
                            test.results.browser.overall.visualScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {test.results.browser.overall.visualScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {test.results.browser.overall.functionalScore && (
                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-md font-medium mb-2">Functional Compatibility</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${test.results.browser.overall.functionalScore >= 90 ? 'bg-green-600' :
                                test.results.browser.overall.functionalScore >= 70 ? 'bg-yellow-500' : 'bg-red-600'
                              }`}
                            style={{ width: `${test.results.browser.overall.functionalScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${test.results.browser.overall.functionalScore >= 90 ? 'text-green-600' :
                            test.results.browser.overall.functionalScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {test.results.browser.overall.functionalScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {test.results.browser.overall.performanceScore && (
                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-md font-medium mb-2">Performance Consistency</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${test.results.browser.overall.performanceScore >= 90 ? 'bg-green-600' :
                                test.results.browser.overall.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-600'
                              }`}
                            style={{ width: `${test.results.browser.overall.performanceScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${test.results.browser.overall.performanceScore >= 90 ? 'text-green-600' :
                            test.results.browser.overall.performanceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {test.results.browser.overall.performanceScore}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h3 className="text-lg font-medium mb-3">Browser Results</h3>
              {test.results.browser.browsers && test.results.browser.browsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {test.results.browser.browsers.map((browser, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 py-3 px-4 border-b border-gray-200">
                        <h4 className="font-medium">{browser.name}</h4>
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex justify-between">
                          <span className="text-gray-600">Rendering:</span>
                          <span className={browser.rendering === 'passed' ? 'text-green-600' : 'text-red-600'}>
                            {browser.rendering === 'passed' ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="mb-3 flex justify-between">
                          <span className="text-gray-600">Functionality:</span>
                          <span className={browser.functionality === 'passed' ? 'text-green-600' : 'text-red-600'}>
                            {browser.functionality === 'passed' ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="mb-3 flex justify-between">
                          <span className="text-gray-600">Load Time:</span>
                          <span className="text-gray-800">{browser.loadTime}s</span>
                        </div>
                        {browser.issues && browser.issues.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Issues Detected:</h5>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {browser.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No browser results available.</p>
              )}

              {(test.testType === 'browser') && test.results.browser && test.results.browser.screenshots && test.results.browser.screenshots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Screenshots Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.results.browser.screenshots.map((screenshot, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium mb-2">{screenshot.browser}</h4>
                        <div className="bg-gray-100 p-2 rounded">
                          <img
                            src={screenshot.url}
                            alt={`${screenshot.browser} rendering`}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestDetailPage; 