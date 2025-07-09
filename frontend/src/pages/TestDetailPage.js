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

  // const getSeverityClass = (severity) => {
  //   switch (severity.toLowerCase()) {
  //     case 'high':
  //       return 'bg-red-100 text-red-800';
  //     case 'medium':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'low':
  //       return 'bg-blue-100 text-blue-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

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
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2 w-full">
        <div className="w-full">
          <Link to="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold break-all">{test.url}</h1>
          <div className="flex flex-wrap items-center mt-2 gap-2">
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
            <span className="text-sm text-gray-500">
              {new Date(test.createdAt).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              Type: {test.testType.charAt(0).toUpperCase() + test.testType.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 print:hidden w-full sm:w-auto"
          >
            Export as PDF
          </button>
          <button
            onClick={handleDeleteTest}
            className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 print:hidden w-full sm:w-auto"
          >
            Delete Test
          </button>
        </div>
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


          {/* Performance Section - Show only for performance test */}
            {(test.testType === 'performance') && test.results.performance && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Performance Results</h2>

                {/* Linear Progress Bar for Performance Score */}
                <div className="mb-6">
                  <span className="text-gray-700 font-medium block mb-2">Performance Score</span>
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className={`h-2.5 rounded-full ${test.results.performance.score >= 0.9 ? 'bg-green-600' :
                            test.results.performance.score >= 0.7 ? 'bg-yellow-500' :
                              'bg-red-600'
                          }`}
                        style={{ width: `${formatScore(test.results.performance.score)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ml-1 ${test.results.performance.score >= 0.9 ? 'text-green-700' :
                        test.results.performance.score >= 0.7 ? 'text-yellow-700' :
                          'text-red-700'
                      }`}>
                      {formatScore(test.results.performance.score)}%
                    </span>
                    </div>
                  </div>

                {/* Scores Overview */}
                {/* (Remove the old score bar from here, keep only metrics/cards below) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Performance Score Card (remove the bar from here) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Performance</h3>
                    <span className={`text-xs font-semibold ${test.results.performance.score >= 0.9 ? 'text-green-700' :
                        test.results.performance.score >= 0.7 ? 'text-yellow-700' :
                          'text-red-700'
                      }`}>
                      {formatScore(test.results.performance.score)}%
                    </span>
                  </div>
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

                        </div>
                      )}

            {/* Security Section - Show only for security test */}
            {(test.testType === 'security') && test.results.security && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Security Results</h2>

                {/* Linear Progress Bar for Security Score */}
                {typeof test.results.security.score !== 'undefined' && (
                  <div className="mb-6">
                    <span className="text-gray-700 font-medium block mb-2">Security Score</span>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className={`h-2.5 rounded-full ${(test.results.security.score / 100) >= 0.9 ? 'bg-green-600' :
                              (test.results.security.score / 100) >= 0.7 ? 'bg-yellow-500' :
                                'bg-red-600'
                            }`}
                          style={{ width: `${test.results.security.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-semibold ml-1 ${(test.results.security.score / 100) >= 0.9 ? 'text-green-700' :
                          (test.results.security.score / 100) >= 0.7 ? 'text-yellow-700' :
                            'text-red-700'
                        }`}>
                        {test.results.security.score}%
                      </span>
                    </div>
                </div>
              )}
                <div className="flex flex-wrap gap-6 mb-4">
                  {test.results.security.score !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Score</p>
                      <p className="text-2xl font-bold text-blue-600">{test.results.security.score}</p>
                    </div>
                  )}
                  {test.results.security.grade && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Grade</p>
                      <p className="text-2xl font-bold text-green-600">{test.results.security.grade}</p>
                    </div>
                  )}
                  {test.results.security.statusCode && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Status Code</p>
                      <p className="text-2xl font-bold text-gray-700">{test.results.security.statusCode}</p>
                    </div>
                  )}
                  {test.results.security.algorithmVersion && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Algorithm Version</p>
                      <p className="text-2xl font-bold text-gray-700">{test.results.security.algorithmVersion}</p>
                    </div>
                  )}
                  {test.results.security.scannedAt && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Scanned At</p>
                      <p className="text-2xl font-bold text-gray-700">{new Date(test.results.security.scannedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-6 mb-4">
                  {test.results.security.testsPassed !== undefined && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Tests Passed</p>
                      <p className="text-2xl font-bold text-green-600">{test.results.security.testsPassed}</p>
                    </div>
                  )}
                  {test.results.security.testsFailed !== undefined && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Tests Failed</p>
                      <p className="text-2xl font-bold text-red-600">{test.results.security.testsFailed}</p>
                    </div>
                  )}
                  {test.results.security.testsQuantity !== undefined && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-800 mb-1">Total Tests</p>
                      <p className="text-2xl font-bold text-gray-700">{test.results.security.testsQuantity}</p>
                    </div>
                  )}
                </div>
                {test.results.security.detailsUrl && (
                  <div className="mt-4">
                    <a
                      href={test.results.security.detailsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Full Report on MDN Observatory
                    </a>
                              </div>
              )}
            </div>
          )}

          {/* Accessibility Section - Show only for accessibility test */}
          {(test.testType === 'accessibility') && test.results.accessibility && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Accessibility Results</h2>
              <div className="mb-4">
                  <span className="text-gray-700 font-medium block mb-2">Overall Accessibility Score</span>
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className={`h-2.5 rounded-full ${test.results.accessibility.score >= 0.9 ? 'bg-green-600' :
                            test.results.accessibility.score >= 0.7 ? 'bg-yellow-500' :
                              'bg-red-600'
                      }`}
                    style={{ width: `${formatScore(test.results.accessibility.score)}%` }}
                  ></div>
                    </div>
                    <span className={`text-xs font-semibold ml-1 ${test.results.accessibility.score >= 0.9 ? 'text-green-700' :
                        test.results.accessibility.score >= 0.7 ? 'text-yellow-700' :
                          'text-red-700'
                      }`}>
                      {formatScore(test.results.accessibility.score)}%
                    </span>
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
                            <div className="ml-3 w-full">
                          <h4 className="text-md font-medium">{issue.description}</h4>
                          {issue.element && (
                            <div className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                              <code className="text-xs">{issue.element}</code>
                            </div>
                          )}
                              {/* Detailed axe-core info */}
                              <div className="mt-2 text-xs text-gray-700">
                                <div><b>Rule:</b> {issue.ruleId}</div>
                                <div><b>Help:</b> {issue.help}</div>
                                <div><b>Tags:</b> {issue.tags && issue.tags.join(', ')}</div>
                                {issue.nodes && issue.nodes.length > 0 && (
                                  <div className="mt-2">
                                    <b>Affected Nodes:</b>
                                    <ul className="list-disc ml-5">
                                      {issue.nodes.map((node, nidx) => (
                                        <li key={nidx} className="mb-1">
                                          <div><b>Target:</b> {node.target && node.target.join(', ')}</div>
                                          <div><b>HTML:</b> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{node.html}</code></div>
                                          {node.failureSummary && <div><b>Failure:</b> {node.failureSummary}</div>}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
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
            {(test.testType === 'browser') && test.results.browserCompatibility && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Browser Compatibility Results</h2>

                {/* Linear Progress Bar for Browser Compatibility Score */}
                {(() => {
                  // Try to use score if present, else calculate from totalIssues
                  let score = test.results.browserCompatibility.score;
                  if (typeof score === 'undefined') {
                    const totalIssues = test.results.browserCompatibility.summary?.totalIssues ?? 0;
                    // Assume max 20 issues for 0% (customize as needed)
                    score = Math.max(0, 1 - (totalIssues / 20));
                  }
                  const percent = Math.round(score * 100);
                  return (
                    <div className="mb-6">
                      <span className="text-gray-700 font-medium block mb-2">Browser Compatibility Score</span>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${score >= 0.9 ? 'bg-green-600' :
                                score >= 0.7 ? 'bg-yellow-500' :
                                  'bg-red-600'
                              }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ml-1 ${score >= 0.9 ? 'text-green-700' :
                            score >= 0.7 ? 'text-yellow-700' :
                              'text-red-700'
                          }`}>
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Issues</p>
                    <p className="text-2xl font-bold text-red-600">{test.results.browserCompatibility.summary?.totalIssues ?? '-'}</p>
                        </div>
                  <div className="bg-gray-50 rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Error Count</p>
                    <p className="text-2xl font-bold text-yellow-600">{test.results.browserCompatibility.summary?.errorCount ?? '-'}</p>
                    </div>
                </div>
                {/* Issues Table */}
                {test.results.browserCompatibility.issues && test.results.browserCompatibility.issues.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3">Axe-core Issues</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Rule</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Impact</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Element</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Help</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tags</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {test.results.browserCompatibility.issues.map((issue, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm">{issue.ruleId}</td>
                              <td className="px-4 py-2 text-sm">{issue.impact}</td>
                              <td className="px-4 py-2 text-sm">{issue.element}</td>
                              <td className="px-4 py-2 text-sm">{issue.description}</td>
                              <td className="px-4 py-2 text-sm">{issue.help}</td>
                              <td className="px-4 py-2 text-sm">{issue.tags && issue.tags.join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
                )}
                {/* Screenshot(s) */}
                {test.results.browserCompatibility.screenshots && test.results.browserCompatibility.screenshots.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3">Screenshot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {test.results.browserCompatibility.screenshots.map((shot, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium mb-2">{shot.browser}</h4>
                        <div className="bg-gray-100 p-2 rounded">
                          <img
                              src={shot.url}
                              alt={`${shot.browser} rendering`}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                {/* Errors */}
                {test.results.browserCompatibility.errors && test.results.browserCompatibility.errors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3">JavaScript Errors</h3>
                    <ul className="list-disc ml-6 text-red-600">
                      {test.results.browserCompatibility.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* SEO Section - Show only for SEO test */}
            {(test.testType === 'seo') && test.results.seo && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">SEO Results</h2>
                <div className="mb-4">
                  <span className="text-gray-700 font-medium block mb-2">SEO Score</span>
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className={`h-2.5 rounded-full ${test.results.seo.score >= 0.9 ? 'bg-green-600' :
                            test.results.seo.score >= 0.7 ? 'bg-yellow-500' :
                              'bg-red-600'
                          }`}
                        style={{ width: `${formatScore(test.results.seo.score)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-semibold ml-1 ${test.results.seo.score >= 0.9 ? 'text-green-700' :
                        test.results.seo.score >= 0.7 ? 'text-yellow-700' :
                          'text-red-700'
                      }`}>
                      {formatScore(test.results.seo.score)}%
                    </span>
                  </div>
                </div>
                {test.results.seo.issues && test.results.seo.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">SEO Issues</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Impact</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {test.results.seo.issues.map((issue, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm">{issue.description}</td>
                              <td className="px-4 py-2 text-sm">{issue.impact}</td>
                              <td className="px-4 py-2 text-sm">{issue.recommendation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default TestDetailPage; 