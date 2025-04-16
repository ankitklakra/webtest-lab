import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import puppeteer from 'puppeteer';

// let lighthouse;
// try {
//   lighthouse = require('lighthouse');
// } catch (error) {
//   console.error('Failed to import Lighthouse:', error);
// }

const TestPage = () => {
  const [url, setUrl] = useState('');
  const [testType, setTestType] = useState('performance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  
  const navigate = useNavigate();

  // Fetch user's tests when the component mounts
  useEffect(() => {
    const fetchTests = async () => {
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

        const { data } = await axios.get('/api/tests', config);
        setTests(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tests');
      }
    };

    fetchTests();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

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

      // First create a test
      const { data: newTest } = await axios.post(
        '/api/tests',
        { url, testType },
        config
      );

      // Then run the test
      setMessage('Test created. Running now...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

      // Add the new test to the tests list
      setTests([runResult, ...tests]);
      setSelectedTest(runResult);
      setMessage('Test completed successfully!');
    } catch (err) {
      console.error('Test error details:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Server error when running the test. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSelect = async (testId) => {
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

      const { data } = await axios.get(`/api/tests/${testId}`, config);
      setSelectedTest(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch test details');
    }
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const getScoreClass = (score) => {
    if (score >= 0.9) return 'text-green-800 bg-green-100';
    if (score >= 0.5) return 'text-yellow-800 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Website Testing</h1>
      
      {/* Test Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test a Website</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="testType" className="block text-gray-700 mb-2">
              Test Type
            </label>
            <select
              id="testType"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="performance">Performance</option>
              <option value="accessibility">Accessibility</option>
              <option value="seo">SEO</option>
              <option value="security">Security</option>
              <option value="all">All Tests</option>
            </select>
          </div>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {message && <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">{message}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Running Test...' : 'Run Test'}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Test History */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test History</h2>
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests have been run yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <ul className="divide-y divide-gray-200">
                {tests.map((test) => (
                  <li key={test._id} className="py-3">
                    <button
                      onClick={() => handleTestSelect(test._id)}
                      className="w-full text-left hover:bg-gray-50 p-2 rounded-md"
                    >
                      <p className="font-medium truncate">{test.url}</p>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(test.createdAt).toLocaleString()}
                        </span>
                        <span 
                          className={`text-sm px-2 py-1 rounded-full ${
                            test.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : test.status === 'running' 
                              ? 'bg-blue-100 text-blue-800'
                              : test.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {!selectedTest ? (
            <p className="text-gray-500">Select a test to view results.</p>
          ) : selectedTest.status === 'pending' || selectedTest.status === 'running' ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedTest.status === 'failed' ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">Test Failed</p>
              <p>{selectedTest.errorMessage || 'An unknown error occurred during testing.'}</p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-lg font-medium mb-2">
                  <a href={selectedTest.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedTest.url}
                  </a>
                </p>
                <p className="text-sm text-gray-500">
                  Tested on {new Date(selectedTest.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Performance Score */}
              {selectedTest.results.performance && (
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Performance</h3>
                  <div className="flex items-center mb-3">
                    <div 
                      className={`text-lg font-bold px-3 py-1 rounded-md mr-3 ${getScoreClass(selectedTest.results.performance.score)}`}
                    >
                      {formatScore(selectedTest.results.performance.score)}
                    </div>
                    <span className="text-gray-700">Overall Score</span>
                  </div>

                  {selectedTest.results.performance.metrics && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTest.results.performance.metrics.FCP && (
                          <div>
                            <p className="text-sm text-gray-500">First Contentful Paint</p>
                            <p className="font-medium">{selectedTest.results.performance.metrics.FCP}s</p>
                          </div>
                        )}
                        {selectedTest.results.performance.metrics.LCP && (
                          <div>
                            <p className="text-sm text-gray-500">Largest Contentful Paint</p>
                            <p className="font-medium">{selectedTest.results.performance.metrics.LCP}s</p>
                          </div>
                        )}
                        {selectedTest.results.performance.metrics.CLS && (
                          <div>
                            <p className="text-sm text-gray-500">Cumulative Layout Shift</p>
                            <p className="font-medium">{selectedTest.results.performance.metrics.CLS}</p>
                          </div>
                        )}
                        {selectedTest.results.performance.metrics.TTI && (
                          <div>
                            <p className="text-sm text-gray-500">Time to Interactive</p>
                            <p className="font-medium">{selectedTest.results.performance.metrics.TTI}s</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other scores (accessibility, seo, security) */}
              <div className="grid grid-cols-3 gap-4">
                {selectedTest.results.accessibility && (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Accessibility</p>
                    <div 
                      className={`inline-block px-3 py-1 rounded-md font-bold ${getScoreClass(selectedTest.results.accessibility.score)}`}
                    >
                      {formatScore(selectedTest.results.accessibility.score)}
                    </div>
                  </div>
                )}
                {selectedTest.results.seo && (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">SEO</p>
                    <div 
                      className={`inline-block px-3 py-1 rounded-md font-bold ${getScoreClass(selectedTest.results.seo.score)}`}
                    >
                      {formatScore(selectedTest.results.seo.score)}
                    </div>
                  </div>
                )}
                {selectedTest.results.security && (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Security</p>
                    <div 
                      className={`inline-block px-3 py-1 rounded-md font-bold ${getScoreClass(selectedTest.results.security.score)}`}
                    >
                      {formatScore(selectedTest.results.security.score)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage; 