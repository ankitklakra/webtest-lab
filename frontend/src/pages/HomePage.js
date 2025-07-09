import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section with animated gradient background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 animate-gradient-x"></div>
        
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:py-28 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[60vh]">
          <div className="md:w-2/3 xl:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
              <span className="block">WebTest Lab</span>
              <span className="block text-blue-200 text-2xl md:text-3xl mt-2">Performance. Security. SEO. Accessibility.</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl">
              WebTest Lab empowers you to optimize, secure, and grow your web presence with real-world testing tools like Google Lighthouse, axe-core, Puppeteer, and Mozilla Observatory. Get actionable insights in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-blue-700 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl md:py-4 md:text-lg md:px-10"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-blue-700 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl md:py-4 md:text-lg md:px-10"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl md:py-4 md:text-lg md:px-10"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative blobs */}
        <div className="hidden lg:block absolute -right-20 -bottom-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="hidden lg:block absolute -right-48 -bottom-8 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Features Section with cards */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Platform Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Test, analyze, and improve your website
            </p>
            <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
              One platform for all your web quality needs. No setup, no code required.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Performance Testing */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 flex flex-col h-full">
                <div className="flex-shrink-0 mb-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-500 text-white shadow-md">
                    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Audits</h3>
                  <p className="text-base text-gray-600 flex-grow">Analyze speed, load times, and UX with Google Lighthouse. Identify bottlenecks and boost performance.</p>
                </div>
              </div>

              {/* Security Scanning */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-red-200 flex flex-col h-full">
                <div className="flex-shrink-0 mb-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-500 text-white shadow-md">
                    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Security Scanning</h3>
                  <p className="text-base text-gray-600 flex-grow">Scan for vulnerabilities and best practices using Mozilla Observatory. Get a clear security grade and actionable fixes.</p>
                </div>
              </div>

              {/* SEO Analysis */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-yellow-200 flex flex-col h-full">
                <div className="flex-shrink-0 mb-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-yellow-500 text-white shadow-md">
                    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">SEO Analysis</h3>
                  <p className="text-base text-gray-600 flex-grow">Improve search visibility and ranking with Lighthouse-powered SEO audits and recommendations.</p>
                </div>
              </div>

              {/* Accessibility Testing */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 flex flex-col h-full">
                <div className="flex-shrink-0 mb-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-500 text-white shadow-md">
                    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Accessibility Audits</h3>
                  <p className="text-base text-gray-600 flex-grow">Detect accessibility issues and WCAG violations using axe-core. Make your site usable for everyone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-lg text-gray-600">Get started in 3 easy steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="mb-4 text-blue-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Sign up & log in</h3>
              <p className="text-gray-600 text-center">Create your free account to access all testing tools.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="mb-4 text-green-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Enter your website</h3>
              <p className="text-gray-600 text-center">Add your site URL and choose the tests you want to run.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="mb-4 text-purple-500">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Get instant results</h3>
              <p className="text-gray-600 text-center">View detailed reports and recommendations to improve your site.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Why WebTest Lab?
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by developers & businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-blue-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Comprehensive Testing</h3>
              <p className="text-gray-600">All-in-one platform for performance, security, accessibility, and SEO testing.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-blue-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Results</h3>
              <p className="text-gray-600">Get detailed reports and actionable insights in minutes, not hours.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-blue-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Track your site's performance over time with historical data analysis.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block mb-1">Ready to optimize your website?</span>
            <span className="block text-blue-200">Start your free test now.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200 max-w-2xl mx-auto">
            Join thousands of users who trust WebTest Lab for fast, actionable web quality insights.
          </p>
          <div className="mt-8 flex justify-center">
            
            <Link
              to={isLoggedIn ? "/dashboard" : "/register"}
              className="ml-4 inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-all duration-300"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 