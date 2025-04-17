import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AccessibilityTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  
  // Check for user info in localStorage
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
  
  // Page type - this determines which tests to display
  const pageType = 'accessibility'; // Will be used to filter tests
  
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Fetch user's accessibility tests
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/tests?type=accessibility', config);
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
  
  // Function to get violation impact color
  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'serious':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'minor':
        return 'bg-blue-100 text-blue-800';
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
        { url: url, testType: 'accessibility' },
        config
      );

      // Then run the test
      setMessage('Accessibility test initiated. Running Axe DevTools scan...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

       // Add the new test to the tests list if it matches the page type
       if (runResult.testType === pageType || (pageType === 'accessibility' && runResult.testType === 'accessibility')) {
        setTests([runResult, ...tests]);
      }

      // Redirect to test detail page
      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      console.error('Accessibility test error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to run accessibility test'
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Accessibility Testing</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Website Accessibility</h2>
        <p className="mb-4 text-gray-600">
          Analyze your website using Axe DevTools to find accessibility issues and ensure compliance with WCAG standards.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="https://example.com"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Running Test...' : 'Run Accessibility Test'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          {message && <p className="mt-2 text-blue-600">{message}</p>}
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Running accessibility tests. This may take a minute...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Accessibility Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <ScoreCard 
              title="Accessibility Score" 
              score={results.score} 
              color="green" 
            />
            <StatCard 
              title="Violations" 
              count={results.violationCount} 
              iconColor="red" 
            />
            <StatCard 
              title="Passed" 
              count={results.passCount} 
              iconColor="green" 
            />
            <StatCard 
              title="Incomplete" 
              count={results.incompleteCount} 
              iconColor="yellow" 
            />
          </div>
          
          {results.issues && results.issues.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Accessibility Issues</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Issue</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Impact</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Element</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {results.issues.map((issue, index) => (
                      <tr key={index}>
                        <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {issue.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getImpactColor(issue.impact)}`}>
                            {issue.impact}
                          </span>
                        </td>
                        <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 truncate max-w-xs">
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{issue.element}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* Recent Accessibility Tests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Accessibility Tests</h2>
        
        {testsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : testsError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{testsError}</span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No accessibility tests found</h2>
            <p className="text-gray-500 mb-6">Run your first accessibility test using the form above</p>
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
                        <p className="flex items-center text-sm text-gray-500">
                          {test.results && test.results.accessibility && (
                            <span className="mr-4">
                              Accessibility Score: {Math.round(test.results.accessibility.score * 100)}
                            </span>
                          )}
                        </p>
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
    
    const colorMap = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500'
    };
    
    return colorMap[selectedColor] || colorMap.green;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="relative h-36 w-36 mx-auto">
        <div className={`absolute inset-0 rounded-full ${getColorClass()} bg-opacity-20 flex items-center justify-center`}>
          <div className={`text-3xl font-bold ${getColorClass().replace('bg-', 'text-')}`}>{score}</div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, iconColor }) => {
  const getIconColorClass = () => {
    const colorMap = {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      orange: 'text-orange-500',
      red: 'text-red-500'
    };
    
    return colorMap[iconColor] || 'text-gray-500';
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-bold my-2 ${getIconColorClass()}`}>{count}</div>
    </div>
  );
};

export default AccessibilityTestPage; 