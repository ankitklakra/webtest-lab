import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TestTypeCard from '../components/dashboard/TestTypeCard';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentTests, setRecentTests] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    failedTests: 0,
    pendingTests: 0,
    avgPerformance: 0
  });
  
  // Use refs to track if component is mounted and if data is already being fetched
  const isMounted = useRef(true);
  const isDataFetching = useRef(false);
  
  const navigate = useNavigate();
  
  // Check for user info in localStorage only once
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;
    
  // Define fetchDashboardData outside useEffect to avoid recreating it on every render
  const fetchDashboardData = useCallback(async () => {
    // If data is already being fetched, don't start another fetch
    if (isDataFetching.current) return;
    
    // Mark that we're fetching data
    isDataFetching.current = true;
    
    try {      
      // Get user token from localStorage
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
      
      // Fetch dashboard statistics from the API
      const { data } = await axios.get('/api/tests/stats', config);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Update state with the fetched data
        setStats({
          totalTests: data.stats.totalTests,
          completedTests: data.stats.completedTests,
          failedTests: data.stats.failedTests,
          pendingTests: data.stats.pendingTests,
          avgPerformance: data.stats.avgPerformance
        });
        
        setRecentTests(data.recentTests);
        
        // Set loading to false AFTER all state updates
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (isMounted.current) {
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to fetch dashboard data'
        );
        setLoading(false);
      }
    } finally {
      // Mark that we're done fetching data
      isDataFetching.current = false;
    }
  }, [navigate]);
  
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // If user is not logged in, redirect to login
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Fetch dashboard data only once
    fetchDashboardData();
    
    // Cleanup function
    return () => {
      // Mark component as unmounted to prevent state updates after unmount
      isMounted.current = false;
    };
  }, [navigate, fetchDashboardData, userInfo]);
  
  // Test type information - Memoize this array to prevent recreation on each render
  const testTypes = useMemo(() => [
    {
      title: "Performance Testing",
      description: "Analyze load times, rendering performance, and overall speed with Google Lighthouse integration.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      route: "/performance-test",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Security Scanning",
      description: "Identify security vulnerabilities and potential threats with OWASP ZAP-like security analysis.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      route: "/security-test",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600"
    },
    {
      title: "Accessibility Testing",
      description: "Evaluate WCAG compliance and identify accessibility issues for diverse user needs.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      route: "/accessibility-test",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "Browser Testing",
      description: "Test functionality and appearance across different browsers using Selenium automation.",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      route: "/browser-test",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    }
  ], []);

  // Extract the LoadingSpinner component to avoid re-renders
  const LoadingSpinner = React.memo(() => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ));
  
  // Memoize these functions so they don't get recreated on every render
  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);
  
  const getStatusClass = useCallback((status) => {
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
  }, []);


  
  // Memoize the content to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }
    
    return (
      <>
        {/* Stats cards */}
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

        {/* Test Type Cards */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testTypes.map((testType, index) => (
              <TestTypeCard key={index} {...testType} />
            ))}
          </div>
        </div>
        
        {/* Recent Tests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tests</h2>
            <Link to="/tests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all tests
            </Link>
          </div>
          
          {recentTests.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {test.url}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {test.testType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(test.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {test.status === 'completed' ? (
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                test.score >= 90 ? 'text-green-600' : 
                                test.score >= 70 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {test.score}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/tests/${test.id}`} 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              
            </div>
          )}
        </div>
      </>
    );
  }, [stats, testTypes, recentTests, error, loading, formatDate, getStatusClass]);

  // Since the whole UI is stable, we just return it directly
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Page title section with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Dashboard
              </h1>
              {userInfo && (
                <p className="mt-1 text-blue-100">
                  Welcome back, {userInfo.name || 'User'}
                </p>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent}
      </div>
    </div>
  );
};

// Use React.memo to prevent re-renders if props don't change
export default React.memo(DashboardPage); 