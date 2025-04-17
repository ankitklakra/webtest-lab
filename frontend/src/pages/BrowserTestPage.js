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
  const [selectedBrowsers, setSelectedBrowsers] = useState({
    chrome: true,
    firefox: true,
    edge: false,
    safari: false
  });

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

  // Handle browser checkbox change
  const handleBrowserChange = (browserName) => {
    setSelectedBrowsers({
      ...selectedBrowsers,
      [browserName]: !selectedBrowsers[browserName]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!Object.values(selectedBrowsers).some(selected => selected)) {
      setError('Please select at least one browser');
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

      // First create a test
      const { data: newTest } = await axios.post(
        '/api/tests',
        {
          url: url,
          testType: 'browser',
          parameters: {
            browsers: Object.keys(selectedBrowsers).filter(b => selectedBrowsers[b])
          }
        },
        config
      );

      // Then run the test
      setMessage('Browser compatibility test initiated. Running Selenium tests...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

       // Add the new test to the tests list if it matches the page type
       if (runResult.testType === pageType || (pageType === 'browser' && runResult.testType === 'browser')) {
        setTests([runResult, ...tests]);
      }

      // Redirect to test detail page
      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      console.error('Browser test error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to run browser test'
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browser Compatibility Testing</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Website Across Browsers</h2>
        <p className="mb-4 text-gray-600">
          Analyze your website using Selenium to check how it renders and functions on different browsers.
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

          <div className="mb-4">
            <p className="font-medium mb-2">Select browsers to test:</p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  checked={selectedBrowsers.chrome}
                  onChange={() => handleBrowserChange('chrome')}
                />
                <span className="ml-2">Chrome</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  checked={selectedBrowsers.firefox}
                  onChange={() => handleBrowserChange('firefox')}
                />
                <span className="ml-2">Firefox</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  checked={selectedBrowsers.edge}
                  onChange={() => handleBrowserChange('edge')}
                />
                <span className="ml-2">Edge</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  checked={selectedBrowsers.safari}
                  onChange={() => handleBrowserChange('safari')}
                />
                <span className="ml-2">Safari</span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Browser Tests'}
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
        <h2 className="text-xl font-semibold mb-4">Recent Browser Tests</h2>

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
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No browser tests found</h2>
            <p className="text-gray-500 mb-6">Run your first browser compatibility test using the form above</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test) => (
                <li key={test._id}>
                  <div
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6 cursor-pointer"
                    onClick={() => navigate(`/tests/${test._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {test.url}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            test.status
                          )}`}
                        >
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {test.parameters && test.parameters.browsers && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="mr-1">Browsers tested:</span>
                            {test.parameters.browsers.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Created: {formatDate(test.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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