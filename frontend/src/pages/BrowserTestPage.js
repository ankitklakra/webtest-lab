import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BrowserTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [message, setMessage] = useState('');
  // Remove selectedBrowsers state and all related logic

  const navigate = useNavigate();

  // Check for user info in localStorage
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  // Page type - this determines which tests to display
  const pageType = 'browser'; // Will be used to filter tests

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!userInfo) {
      navigate('/login');
      return;
    }

    // Fetch user's browser tests
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/tests?type=browser', config);

        // Filter tests to only show security tests
        const filteredTests = data.filter(test => test.testType === pageType);
        setTests(filteredTests);

        setTestsLoading(false);
      } catch (error) {
        setTestsError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch tests'
        );
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, [navigate, userInfo, pageType]);

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Add this helper function near the top, after imports
  const formatScore = (score) => {
    if (typeof score === 'number') return Math.round(score * 100);
    return '-';
  };

  // Remove handleBrowserChange and browser selection UI

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      setResults(null);

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

      // First create a test (no browsers param)
      const { data: newTest } = await axios.post(
        '/api/tests',
        {
          url: url,
          testType: 'browser',
          parameters: {}
        },
        config
      );

      // Then run the test
      setMessage('Browser compatibility test initiated. Running test in Chromium...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

      if (runResult.testType === pageType || (pageType === 'browser' && runResult.testType === 'browser')) {
        setTests([runResult, ...tests]);
      }

      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      let msg = err.response?.data?.error || err.response?.data?.message || 'Failed to run browser test';
      if (msg.includes('Waiting failed') || msg.includes('timeout')) {
        msg = 'The website took too long to load or blocked automated testing. Try another site or check your URL.';
      }
      setError(msg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">Browser Compatibility Test (axe-core, Chromium)</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Browser Compatibility & Accessibility</h2>
        <p className="mb-4 text-gray-600">
          Test your website in Chromium for browser compatibility and accessibility issues using real axe-core. Get screenshots, errors, and accessibility results.
        </p>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Running Test...' : 'Run Browser Test'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          {message && <p className="mt-2 text-blue-600">{message}</p>}
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">Running browser tests. This may take several minutes...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Browser Compatibility Results</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Overall Compatibility</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CompatibilityCard
                title="Visual Consistency"
                score={results.overall.visualScore || 0}
              />
              <CompatibilityCard
                title="Functional Compatibility"
                score={results.overall.functionalScore || 0}
              />
              <CompatibilityCard
                title="Performance Consistency"
                score={results.overall.performanceScore || 0}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Browser Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.browsers.map((browser, index) => (
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
          </div>

          {results.screenshots && results.screenshots.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Screenshots Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.screenshots.map((screenshot, index) => (
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

          <div className="flex justify-center mt-6">
            <button
              onClick={() => window.print()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg px-6 py-2 transition duration-300"
            >
              Export Results
            </button>
          </div>
        </div>
      )}

      {/* Recent Browser Tests Section */}
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-4 gap-2 w-full">
          <h2 className="text-xl font-semibold">Recent Browser Tests</h2>
          <button onClick={() => navigate('/tests')} className="text-blue-600 hover:underline text-sm font-medium self-end">View all tests</button>
        </div>
        {testsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : testsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{testsError}</span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No browser compatibility tests found</h2>
            <p className="text-gray-500 mb-6">Run your first browser test using the form above</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">URL</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Browser Score</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(tests.slice(0, 10)).map((test) => {
                  let score = test.results && test.results.browserCompatibility && typeof test.results.browserCompatibility.score === 'number'
                    ? test.results.browserCompatibility.score
                    : undefined;
                  if (typeof score === 'undefined' && test.results && test.results.browserCompatibility && test.results.browserCompatibility.summary) {
                    const totalIssues = test.results.browserCompatibility.summary.totalIssues ?? 0;
                    score = Math.max(0, 1 - (totalIssues / 20));
                  }
                  return (
                    <tr key={test._id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-2 text-sm text-indigo-600 truncate max-w-xs" onClick={() => navigate(`/tests/${test._id}`)}>{test.url}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                      </td>
                      <td className="px-4 py-2 text-sm">{formatDate(test.createdAt)}</td>
                      <td className="px-4 py-2 text-center text-sm">
                        {test.status === 'completed' && typeof score === 'number' ? (
                          <div className="flex items-center w-32 mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  formatScore(score) >= 90 ? 'bg-green-600' :
                                  formatScore(score) >= 70 ? 'bg-yellow-500' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${formatScore(score)}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold ml-1 ${
                              formatScore(score) >= 90 ? 'text-green-700' :
                              formatScore(score) >= 70 ? 'text-yellow-700' :
                              'text-red-700'
                            }`}>
                              {formatScore(score)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          className="text-indigo-600 hover:underline"
                          onClick={() => navigate(`/tests/${test._id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CompatibilityCard = ({ title, score }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-md font-medium mb-2">{title}</h4>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div
            className={`h-2.5 rounded-full ${score >= 90 ? 'bg-green-600' : score >= 70 ? 'bg-yellow-500' : 'bg-red-600'}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className={`text-sm font-medium ${getScoreColor()}`}>{score}%</span>
      </div>
    </div>
  );
};

export default BrowserTestPage; 