import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PerformanceTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [message, setMessage] = useState('');
  const [bestPracticesResults, setBestPracticesResults] = useState(null);

  const navigate = useNavigate();
  
  // Page type - this determines which tests to display
  const pageType = 'all'; // Will be used to filter tests
  
  // Check for user info in localStorage
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Fetch user's performance tests
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/tests', config);
        
        // Filter tests based on page type
        const filteredTests = data.filter(test => 
          test.testType === pageType || 
          (pageType === 'all' && test.testType === 'all')
        );
        
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
      setBestPracticesResults(null);
      
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

      // Create a performance test (testType still 'all')
      setMessage('Initiating performance website testing...');
      const { data: newTest } = await axios.post(
        '/api/tests',
        { url: url, testType: 'all' },
        config
      );

      // Run the test
      setMessage('Running Lighthouse tests. This may take a few minutes...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

      // Add the new test to the tests list if it matches the page type
      if (runResult.testType === pageType || (pageType === 'all' && runResult.testType === 'all')) {
        setTests([runResult, ...tests]);
      }
      
      // Redirect to test detail page
      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      console.error('Performance test error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to run tests'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Performance Website Testing</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Website Performance</h2>
        <p className="mb-4 text-gray-600">
          Analyze your website using Lighthouse to get insights on performance, 
          accessibility, best practices, and SEO.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="https://example.com"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Performance Test'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          {message && <p className="mt-2 text-blue-600">{message}</p>}
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Running performance tests. This may take a few minutes...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance & Lighthouse Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ScoreCard title="Performance" score={results.performance} color="blue" />
            {results.accessibility && <ScoreCard title="Accessibility" score={results.accessibility} color="green" />}
            {results.bestPractices && <ScoreCard title="Best Practices" score={results.bestPractices} color="purple" />}
            {results.seo && <ScoreCard title="SEO" score={results.seo} color="orange" />}
          </div>
          
          {bestPracticesResults && bestPracticesResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Best Practices Issues</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {bestPracticesResults.map((issue, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start">
                        <div className="ml-3">
                          <h4 className="text-md font-medium">{issue.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
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

      {/* Recent Performance Tests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Performance Tests</h2>
        
        {testsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : testsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{testsError}</span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No performance tests found</h2>
            <p className="text-gray-500 mb-6">Run your first performance test using the form above</p>
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
                        {test.results && test.results.performance && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">Performance:</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              test.results.performance.score >= 0.9 ? 'bg-green-100 text-green-800' : 
                              test.results.performance.score >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(test.results.performance.score * 100)}
                            </span>
                          </div>
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

const ScoreCard = ({ title, score, color }) => {
  const getColorClass = () => {
    const scoreColor = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';
    const selectedColor = color || scoreColor;
    
    switch (selectedColor) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-bold px-4 py-2 rounded-full inline-block ${getColorClass()}`}>
        {score}
      </div>
    </div>
  );
};

export default PerformanceTestPage; 