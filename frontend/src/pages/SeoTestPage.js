import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SeoTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');

  const navigate = useNavigate();
  const pageType = 'seo';

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || userInfo.token}`,
          },
        };
        const { data } = await axios.get('/api/tests?type=seo', config);
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
  }, [navigate, pageType]);

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
      // Create test
      const { data: newTest } = await axios.post(
        '/api/tests',
        {
          url: url,
          testType: 'seo',
          parameters: {}
        },
        config
      );
      setMessage('SEO test initiated. Running Lighthouse SEO analysis...');
      // Run the test
      const { data: runResult } = await axios.put(
        `/api/tests/${newTest._id}/run`,
        {},
        config
      );
      if (runResult.testType === pageType) {
        setTests([runResult, ...tests]);
      }
      navigate(`/tests/${runResult._id}`);
    } catch (err) {
      let msg = err.response?.data?.error || err.response?.data?.message || 'Failed to run SEO test';
      if (msg.includes('Waiting failed') || msg.includes('timeout')) {
        msg = 'The website took too long to load or blocked automated testing. Try another site or check your URL.';
      }
      setError(msg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

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

  const formatScore = (score) => {
    if (typeof score === 'number') return Math.round(score * 100);
    return '-';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">SEO Test (Google Lighthouse)</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Website SEO Audit</h2>
        <p className="mb-4 text-gray-600">
          Run a real Google Lighthouse SEO audit to check your website’s search engine optimization, discover issues, and get improvement recommendations.
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
              {loading ? 'Running Test...' : 'Run SEO Test'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          {message && <p className="mt-2 text-blue-600">{message}</p>}
        </form>
      </div>
      <div className="mb-8">
        <div className="flex flex-row justify-between items-center mb-4 gap-2 w-full">
          <h2 className="text-xl font-semibold">Recent SEO Tests</h2>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No SEO tests found</h2>
            <p className="text-gray-500 mb-6">Run your first SEO test using the form above</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">URL</th>
                  <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-2 md:px-4 py-2 text-center text-xs md:text-sm font-semibold text-gray-700">SEO Score</th>
                  <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(tests.slice(0, 10)).map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-blue-600 truncate max-w-xs" onClick={() => navigate(`/tests/${test._id}`)}>{test.url}</td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm">{formatDate(test.createdAt)}</td>
                    <td className="px-2 md:px-4 py-2 text-center text-xs md:text-sm">
                      {test.status === 'completed' && test.results && test.results.seo && typeof test.results.seo.score === 'number' ? (
                        <div className="flex items-center w-32 mx-auto">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                formatScore(test.results.seo.score) >= 90 ? 'bg-green-600' :
                                formatScore(test.results.seo.score) >= 70 ? 'bg-yellow-500' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${formatScore(test.results.seo.score)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold ml-1 ${
                            formatScore(test.results.seo.score) >= 90 ? 'text-green-700' :
                            formatScore(test.results.seo.score) >= 70 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {formatScore(test.results.seo.score)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                      <button
                        className="text-indigo-600 hover:underline"
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

export default SeoTestPage; 