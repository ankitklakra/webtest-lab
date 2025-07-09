import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PAGE_SIZE = 10;

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AllTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    failedTests: 0,
    pendingTests: 0,
    avgPerformance: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch overview stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('/api/tests/stats', config);
        setStats(data.stats);
      } catch (err) {
        // ignore stats error for now
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const { data } = await axios.get(`/api/tests/paginated?page=${page}&limit=${PAGE_SIZE}`, config);
        setTests(data.tests);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(
          err.response?.data?.message || err.response?.data?.error || 'Failed to fetch tests'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [page, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">&larr; Back</button>
      <h1 className="text-3xl font-bold mb-6">All Tests</h1>
      {/* Overview Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Tests</p>
                <p className="text-2xl font-bold text-gray-800">{stats.failedTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgPerformance}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{test.url}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{test.testType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(test.status)}`}>{test.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(test.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {test.status === 'completed' && typeof test.score === 'number' ? (
                          <div className="flex items-center w-32 mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  test.score >= 90 ? 'bg-green-600' :
                                  test.score >= 70 ? 'bg-yellow-500' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${test.score}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold ml-1 ${
                              test.score >= 90 ? 'text-green-700' :
                              test.score >= 70 ? 'text-yellow-700' :
                              'text-red-700'
                            }`}>
                              {test.score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4"
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
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${page === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllTestsPage; 