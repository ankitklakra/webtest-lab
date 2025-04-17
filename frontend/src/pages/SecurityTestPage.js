import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecurityTestPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [securityUrl, setSecurityUrl] = useState('');
  const [scanType, setScanType] = useState('baseline');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanSummary, setScanSummary] = useState(null);
  
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
  
  // Function to run security test
  const handleSecurityTest = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityMessage('');
    setVulnerabilities([]);
    setScanSummary(null);
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
          testType: 'security',
          parameters: {
            scanType: scanType
          }
        },
        config
      );

      // Then run the test
      setSecurityMessage(`Security scan initiated. Running OWASP ZAP ${scanType} scan...`);
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

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'informational':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Security Testing with OWASP ZAP</h1>
      
      {/* Security Testing Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Vulnerability Scanner</h2>
        <p className="text-gray-600 mb-4">
          Scan your website for security vulnerabilities using OWASP ZAP (Zed Attack Proxy), an industry-standard security tool.
        </p>
        
        <form onSubmit={handleSecurityTest} className="mb-6">
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={securityUrl}
              onChange={(e) => setSecurityUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">Scan Type</span>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-red-600"
                  value="baseline"
                  checked={scanType === 'baseline'}
                  onChange={() => setScanType('baseline')}
                />
                <span className="ml-2">Baseline Scan (Fast)</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-red-600"
                  value="active"
                  checked={scanType === 'active'}
                  onChange={() => setScanType('active')}
                />
                <span className="ml-2">Active Scan (Thorough)</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-red-600"
                  value="full"
                  checked={scanType === 'full'}
                  onChange={() => setScanType('full')}
                />
                <span className="ml-2">Full Scan (Comprehensive)</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md transition duration-200"
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
        
        {securityLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="ml-4 text-gray-600">Running ZAP security scan. This may take several minutes...</p>
          </div>
        )}
        
        {/* Scan Summary */}
        {scanSummary && (
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-medium mb-3">Scan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard title="High Risk" count={scanSummary.high || 0} color="red" />
              <SummaryCard title="Medium Risk" count={scanSummary.medium || 0} color="yellow" />
              <SummaryCard title="Low Risk" count={scanSummary.low || 0} color="blue" />
              <SummaryCard title="Informational" count={scanSummary.informational || 0} color="green" />
            </div>
          </div>
        )}
        
        {/* Vulnerability Results */}
        {vulnerabilities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Found {vulnerabilities.length} Vulnerabilities</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Vulnerability</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Severity</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vulnerabilities.map((vuln, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <div className="font-medium">{vuln.name}</div>
                        <div className="mt-1 text-xs text-gray-500">{vuln.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </td>
                      <td className="whitespace-normal px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {vuln.location || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
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
      </div>
      
      {/* Recent Security Tests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Security Tests</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
                          {test.parameters && test.parameters.scanType && (
                            <span className="mr-2 capitalize">{test.parameters.scanType} Scan</span>
                          )}
                          {test.results && test.results.security && test.results.security.summary && (
                            <span className="text-red-600 font-medium">
                              {test.results.security.summary.high || 0} High,{' '}
                              {test.results.security.summary.medium || 0} Medium
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

const SummaryCard = ({ title, count, color }) => {
  const getColorClasses = () => {
    const colorMap = {
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  return (
    <div className={`border rounded-lg p-4 ${getColorClasses()}`}>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold mt-2">{count}</p>
    </div>
  );
};

export default SecurityTestPage; 