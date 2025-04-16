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
  const [vulnerabilities, setVulnerabilities] = useState([]);
  
  const navigate = useNavigate();
  
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
        
        const { data } = await axios.get('/api/tests?type=security', config);
        setTests(data);
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
  }, [navigate, userInfo]);
  
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
  
  // Function to run security test
  const handleSecurityTest = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMessage('');
    setVulnerabilities([]);
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
        { url: securityUrl, testType: 'security' },
        config
      );

      // Then run the test
      setSecurityMessage('Security scan initiated. Running test...');
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );

      // Add the new test to the tests list
      setTests([runResult, ...tests]);
      setSecurityMessage('Security scan completed!');
      
      // Extract security vulnerabilities
      if (runResult.results && runResult.results.security) {
        setVulnerabilities(runResult.results.security.vulnerabilities || []);
      }
    } catch (err) {
      console.error('Security test error:', err);
      setSecurityError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to run security test'
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Security Testing</h1>
      
      {/* Security Testing Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Vulnerability Scanner</h2>
        <p className="text-gray-600 mb-4">
          Scan your website for security vulnerabilities using our OWASP ZAP-like scanner.
        </p>
        
        <form onSubmit={handleSecurityTest} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="url"
                value={securityUrl}
                onChange={(e) => setSecurityUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md"
              disabled={securityLoading}
            >
              {securityLoading ? 'Scanning...' : 'Scan for Vulnerabilities'}
            </button>
          </div>
          
          {securityError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {securityError}
            </div>
          )}
          
          {securityMessage && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-md">
              {securityMessage}
            </div>
          )}
        </form>
        
        {/* Vulnerability Results */}
        {vulnerabilities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Found {vulnerabilities.length} Vulnerabilities</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <ul className="divide-y divide-gray-200">
                {vulnerabilities.map((vuln, index) => (
                  <li key={index} className="py-4">
                    <div className="flex items-start">
                      <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-md font-medium">{vuln.name}</h4>
                        <p className="mt-1 text-sm text-gray-600">{vuln.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Security Tests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Security Tests</h2>
        
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test) => (
                <li key={test._id}>
                  <div className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
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
                          Type: Security
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

export default SecurityTestPage; 