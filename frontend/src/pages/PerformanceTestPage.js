import React, { useState } from 'react';

const PerformanceTestPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Placeholder for actual Lighthouse API integration
      // In a real implementation, this would call your backend API
      // which would then trigger Lighthouse tests
      
      // Simulating API call with timeout
      setTimeout(() => {
        setResults({
          performance: 87,
          accessibility: 92,
          bestPractices: 95,
          seo: 90,
          pwa: 65,
          firstContentfulPaint: '1.2s',
          speedIndex: '2.1s',
          largestContentfulPaint: '2.8s',
          timeToInteractive: '3.5s',
          totalBlockingTime: '210ms',
          cumulativeLayoutShift: '0.05'
        });
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError('Failed to run performance test');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Performance Testing</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Website Performance</h2>
        <p className="mb-4 text-gray-600">
          Analyze your website using Lighthouse to get insights on performance, accessibility, 
          best practices, SEO, and PWA.
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
              {loading ? 'Running Test...' : 'Run Test'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Running performance tests. This may take a minute...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <ScoreCard title="Performance" score={results.performance} color="blue" />
            <ScoreCard title="Accessibility" score={results.accessibility} color="green" />
            <ScoreCard title="Best Practices" score={results.bestPractices} color="purple" />
            <ScoreCard title="SEO" score={results.seo} color="orange" />
            <ScoreCard title="PWA" score={results.pwa} color="gray" />
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <MetricCard 
              title="First Contentful Paint" 
              value={results.firstContentfulPaint} 
              description="Time until the first content is painted" 
            />
            <MetricCard 
              title="Speed Index" 
              value={results.speedIndex} 
              description="How quickly content is visually displayed" 
            />
            <MetricCard 
              title="Largest Contentful Paint" 
              value={results.largestContentfulPaint} 
              description="Time until largest content element is painted" 
            />
            <MetricCard 
              title="Time to Interactive" 
              value={results.timeToInteractive} 
              description="Time until page becomes fully interactive" 
            />
            <MetricCard 
              title="Total Blocking Time" 
              value={results.totalBlockingTime} 
              description="Sum of time blocked from responding to input" 
            />
            <MetricCard 
              title="Cumulative Layout Shift" 
              value={results.cumulativeLayoutShift} 
              description="Measure of visual stability" 
            />
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
  );
};

const ScoreCard = ({ title, score, color }) => {
  const getColorClass = () => {
    const scoreColor = score >= 90 ? 'green' : score >= 50 ? 'orange' : 'red';
    const selectedColor = color || scoreColor;
    
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500'
    };
    
    return colorMap[selectedColor] || colorMap.blue;
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

const MetricCard = ({ title, value, description }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h4 className="font-semibold text-md">{title}</h4>
      <div className="text-2xl font-bold my-2">{value}</div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default PerformanceTestPage; 