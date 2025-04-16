import React, { useState } from 'react';

const SeoTestPage = () => {
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
      
      // Simulating API call with timeout
      setTimeout(() => {
        setResults({
          score: 82,
          metaTags: {
            title: 'Sample Website Title',
            description: 'This is a sample meta description that appears in search results.',
            hasKeywords: true,
            hasCanonical: true,
            robotsTxt: 'Present but needs optimization'
          },
          contentAnalysis: {
            wordCount: 1250,
            keywordDensity: 'Good',
            headingStructure: 'Well structured',
            imageAlt: 'Missing on 3 images',
            internalLinks: 12,
            externalLinks: 5,
            brokenLinks: 2
          },
          mobileOptimization: {
            isMobileFriendly: true,
            viewport: 'Properly configured',
            tapTargets: 'Some targets too small',
            fontSize: 'Appropriate'
          },
          pagespeed: {
            score: 78,
            fcp: '1.8s',
            lcp: '2.9s',
            cls: '0.12'
          },
          issues: [
            { 
              severity: 'high', 
              title: 'Missing alt text on 3 images', 
              description: 'All images should have descriptive alt text for accessibility and SEO.'
            },
            { 
              severity: 'medium', 
              title: '2 broken links detected', 
              description: 'Fix or remove broken links to improve user experience and SEO.'
            },
            { 
              severity: 'medium', 
              title: 'Meta description is too short', 
              description: 'Increase meta description length to between 140-160 characters for better CTR.'
            },
            { 
              severity: 'low', 
              title: 'Consider adding schema markup', 
              description: 'Schema markup helps search engines understand your content better.'
            }
          ]
        });
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError('Failed to run SEO test');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SEO Testing</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Website SEO</h2>
        <p className="mb-4 text-gray-600">
          Analyze your website's search engine optimization factors including meta tags, content analysis, 
          mobile optimization, and more.
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
            <p className="text-gray-600">Running SEO tests. This may take a minute...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">SEO Results</h2>
            <div className="flex items-center">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${getSeoScoreColorClass(results.score)}`}>
                <span className="text-2xl font-bold text-white">{results.score}</span>
              </div>
              <span className="ml-3 font-medium">Overall Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SeoSection 
              title="Meta Tags" 
              items={[
                { label: 'Title', value: results.metaTags.title },
                { label: 'Description', value: results.metaTags.description },
                { label: 'Keywords', value: results.metaTags.hasKeywords ? 'Present' : 'Missing' },
                { label: 'Canonical URL', value: results.metaTags.hasCanonical ? 'Present' : 'Missing' },
                { label: 'Robots.txt', value: results.metaTags.robotsTxt }
              ]}
            />
            
            <SeoSection 
              title="Content Analysis" 
              items={[
                { label: 'Word Count', value: results.contentAnalysis.wordCount },
                { label: 'Keyword Density', value: results.contentAnalysis.keywordDensity },
                { label: 'Heading Structure', value: results.contentAnalysis.headingStructure },
                { label: 'Image Alt Text', value: results.contentAnalysis.imageAlt },
                { label: 'Internal Links', value: results.contentAnalysis.internalLinks },
                { label: 'External Links', value: results.contentAnalysis.externalLinks },
                { label: 'Broken Links', value: results.contentAnalysis.brokenLinks }
              ]}
            />
            
            <SeoSection 
              title="Mobile Optimization" 
              items={[
                { label: 'Mobile Friendly', value: results.mobileOptimization.isMobileFriendly ? 'Yes' : 'No' },
                { label: 'Viewport', value: results.mobileOptimization.viewport },
                { label: 'Tap Targets', value: results.mobileOptimization.tapTargets },
                { label: 'Font Size', value: results.mobileOptimization.fontSize }
              ]}
            />
            
            <SeoSection 
              title="Page Speed Metrics" 
              items={[
                { label: 'PageSpeed Score', value: results.pagespeed.score },
                { label: 'First Contentful Paint', value: results.pagespeed.fcp },
                { label: 'Largest Contentful Paint', value: results.pagespeed.lcp },
                { label: 'Cumulative Layout Shift', value: results.pagespeed.cls }
              ]}
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Issues & Recommendations</h3>
            {results.issues.map((issue, index) => (
              <div key={index} className="border-l-4 pl-4 py-3 mb-4" style={{ borderColor: getSeverityColor(issue.severity) }}>
                <div className="flex items-center mb-1">
                  <div className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: getSeverityColor(issue.severity) }}></div>
                  <h4 className="font-medium">{issue.title}</h4>
                  <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: getSeverityBgColor(issue.severity) }}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{issue.description}</p>
              </div>
            ))}
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

const SeoSection = ({ title, items }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-5">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions
const getSeoScoreColorClass = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

const getSeverityColor = (severity) => {
  if (severity === 'high') return '#ef4444';
  if (severity === 'medium') return '#f59e0b';
  return '#3b82f6';
};

const getSeverityBgColor = (severity) => {
  if (severity === 'high') return '#fee2e2';
  if (severity === 'medium') return '#fef3c7';
  return '#dbeafe';
};

export default SeoTestPage; 