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
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              test.status === 'completed' 
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
            <h2 className="text-xl font-semibold mb-4">Test Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {test.results.seo && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">SEO</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.seo.score)}`}>
                    {formatScore(test.results.seo.score)}
                  </div>
                </div>
              )}
              {test.results.security && (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Security</p>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getScoreClass(test.results.security.score)}`}>
                    {formatScore(test.results.security.score)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Section */}
          {test.results.performance && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
              {test.results.performance.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {test.results.performance.metrics.FCP && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">First Contentful Paint</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.FCP}s</p>
                    </div>
                  )}
                  {test.results.performance.metrics.LCP && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Largest Contentful Paint</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.LCP}s</p>
                    </div>
                  )}
                  {test.results.performance.metrics.CLS && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Cumulative Layout Shift</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.CLS}</p>
                    </div>
                  )}
                  {test.results.performance.metrics.TTI && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Time to Interactive</p>
                      <p className="text-xl font-medium">{test.results.performance.metrics.TTI}s</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Security Section */}
          {test.results.security && test.results.security.vulnerabilities && test.results.security.vulnerabilities.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Security Vulnerabilities</h2>
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
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Accessibility Section */}
          {test.results.accessibility && test.results.accessibility.issues && test.results.accessibility.issues.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility Issues</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {test.results.accessibility.issues.map((issue, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start">
                        <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          issue.impact === 'serious' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
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
            </div>
          )}

          {/* SEO Section */}
          {test.results.seo && test.results.seo.issues && test.results.seo.issues.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">SEO Recommendations</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="divide-y divide-gray-200">
                  {test.results.seo.issues.map((issue, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start">
                        <div className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          issue.impact === 'serious' 
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestDetailPage; 