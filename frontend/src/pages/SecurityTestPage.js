import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecurityTestPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [securityUrl, setSecurityUrl] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  
  const navigate = useNavigate();
  
  // Page type - this determines which tests to display
  const pageType = 'security';
  
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
    
    // Fetch user's tests
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
        
        // Filter tests to only show security tests
        const filteredTests = data.filter(test => test.testType === pageType);
        setTests(filteredTests);
        
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch tests'
        );
        setLoading(false);
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

  const formatScore = (score) => {
    if (typeof score === 'number') return Math.round(score);
    return '-';
  };
  
  // Function to run security test
  const handleSecurityTest = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMessage('');
    setSecurityLoading(true);
    
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
        { 
          url: securityUrl, 
          testType: 'security'
        },
        config
      );

      // Then run the test
      setSecurityMessage('Security scan initiated. Running MDN Observatory scan...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

      // Redirect user to the test details page
      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      console.error('Security test error:', err);
      setSecurityError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to run security test'
      );
      setSecurityLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">Security Test (Mozilla Observatory)</h1>
      
      {/* Security Testing Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Website Security Scan</h2>
        <p className="mb-4 text-gray-600">
          Scan your website for security best practices and vulnerabilities using the Mozilla Observatory v2 API. Get a real security score and actionable recommendations.
        </p>
        <form onSubmit={handleSecurityTest} className="mb-6">
          <div className="mb-4">
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={securityUrl}
              onChange={(e) => setSecurityUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={securityLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 transition duration-300 disabled:opacity-50"
            >
              {securityLoading ? 'Running Security Test...' : 'Run Security Test'}
            </button>
          </div>
          {securityError && <p className="mt-2 text-red-600">{securityError}</p>}
          {securityMessage && <p className="mt-2 text-blue-600">{securityMessage}</p>}
        </form>
      </div>

      {/* Recent Security Tests Section */}
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-4 gap-2 w-full">
          <h2 className="text-xl font-semibold">Recent Security Tests</h2>
          <button onClick={() => navigate('/tests')} className="text-blue-600 hover:underline text-sm font-medium self-end">View all tests</button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No security tests found</h2>
            <p className="text-gray-500 mb-6">Run your first security test using the form above</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">URL</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Security Score</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(tests.slice(0, 10)).map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-2 text-sm text-blue-600 truncate max-w-xs" onClick={() => navigate(`/tests/${test._id}`)}>{test.url}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                    </td>
                    <td className="px-4 py-2 text-sm">{formatDate(test.createdAt)}</td>
                    <td className="px-4 py-2 text-center text-sm">
                      {test.status === 'completed' && test.results && test.results.security && typeof test.results.security.score === 'number' ? (
                        <div className="flex items-center w-32 mx-auto">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                formatScore(test.results.security.score) >= 90 ? 'bg-green-600' :
                                formatScore(test.results.security.score) >= 70 ? 'bg-yellow-500' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${formatScore(test.results.security.score)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold ml-1 ${
                            formatScore(test.results.security.score) >= 90 ? 'text-green-700' :
                            formatScore(test.results.security.score) >= 70 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {formatScore(test.results.security.score)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => navigate(`/tests/${test._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTestPage; 