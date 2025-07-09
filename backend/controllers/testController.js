const asyncHandler = require('express-async-handler');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const Test = require('../models/testModel');
const axeCore = require('axe-core');
const chromeLauncher = require('chrome-launcher');
const axios = require('axios');

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private
const createTest = asyncHandler(async (req, res) => {
  const { url, testType, parameters } = req.body;

  if (!url || !testType) {
    res.status(400);
    throw new Error('Please provide a URL and test type');
  }

  // Create test
  const test = await Test.create({
    user: req.user._id,
    url,
    testType,
    parameters
  });

  if (test) {
    res.status(201).json(test);
  } else {
    res.status(400);
    throw new Error('Invalid test data');
  }
});

// @desc    Get all tests for a user
// @route   GET /api/tests
// @access  Private
const getTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(tests);
});

// @desc    Get all tests for a user (paginated)
// @route   GET /api/tests/paginated?page=1&limit=10
// @access  Private
const getAllTestsPaginated = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  const totalCount = await Test.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalCount / limit);

  const tests = await Test.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedTests = tests.map(test => ({
    _id: test._id,
    url: test.url,
    testType: test.testType,
    status: test.status,
    createdAt: test.createdAt,
    score: getTestScore(test)
  }));

  res.json({
    tests: formattedTests,
    totalPages,
    totalCount
  });
});

// @desc    Get a single test
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (test) {
    // Check if test belongs to user or user is admin
    if (test.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to access this test');
    }

    res.json(test);
  } else {
    res.status(404);
    throw new Error('Test not found');
  }
});

// @desc    Run a test
// @route   PUT /api/tests/:id/run
// @access  Private
const runTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  // Check if test belongs to user or user is admin
  if (test.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to run this test');
  }

  // Update test status to running
  test.status = 'running';
  await test.save();

  try {
    let results;
    if (test.testType === 'performance') {
      results = await runTestWithLighthouse(test.url, test.testType, test.parameters);
    } else if (test.testType === 'accessibility') {
      results = await runAxeAccessibilityTest(test.url);
    } else if (test.testType === 'security') {
      results = await runMozillaObservatoryTest(test.url);
    } else if (test.testType === 'browser') {
      results = await runBrowserCompatibilityTest(test.url);
    } else if (test.testType === 'seo') {
      results = await runSeoTestWithLighthouse(test.url);
    } else {
      throw new Error(`Test type '${test.testType}' is not yet supported.`);
    }
    test.results = results;
    test.status = 'completed';
    await test.save();
    res.json(test);
  } catch (error) {
    console.error(`Test error: ${error.message}`);
    test.status = 'failed';
    test.errorMessage = error.message;
    await test.save();
    res.status(500).json({ message: 'Test failed to run', error: error.message });
  }
});

// Helper function to run Lighthouse test for performance
async function runTestWithLighthouse(url, testType, parameters = {}) {
  console.log(`Running ${testType} test for ${url}`);
  
  if (testType === 'performance') {
    // Launch Chrome using chrome-launcher
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
    const opts = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };
    try {
      const runnerResult = await lighthouse(url, opts);
      const lhr = runnerResult.lhr;
      // Extract key metrics
      const metrics = lhr.audits;
      const perfMetrics = {
        FCP: metrics['first-contentful-paint']?.numericValue ? metrics['first-contentful-paint'].numericValue / 1000 : 0, // seconds
        LCP: metrics['largest-contentful-paint']?.numericValue ? metrics['largest-contentful-paint'].numericValue / 1000 : 0, // seconds
        CLS: metrics['cumulative-layout-shift']?.numericValue ?? 0,
        FID: metrics['max-potential-fid']?.numericValue ?? 0, // ms
        TTI: metrics['interactive']?.numericValue ? metrics['interactive'].numericValue / 1000 : 0, // seconds
      };
      const score = typeof lhr.categories.performance.score === 'number' ? lhr.categories.performance.score : 0;
      await chrome.kill();
      return {
        performance: {
          score,
          metrics: perfMetrics
        }
      };
    } catch (err) {
      await chrome.kill();
      throw err;
    }
  }

  // For all other test types, throw an error
  throw new Error(`Test type '${testType}' is not yet supported.`);
}

// Helper function to run Axe-core accessibility test
async function runAxeAccessibilityTest(url) {
  const puppeteer = require('puppeteer');
  const axeCore = require('axe-core');
  let browser;
  try {
    browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
    await page.addScriptTag({ path: require.resolve('axe-core') });
    // Wait for axe to be available in the page context
    await page.waitForFunction('window.axe !== undefined');
    const axeResults = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        resultTypes: ['violations', 'passes', 'incomplete']
          });
        });
          await browser.close();
    // Format results for the schema
        const accessibilityIssues = axeResults.violations.map(violation => ({
      description: violation.description || violation.help,
      impact: violation.impact || 'unknown',
      element: violation.nodes && violation.nodes.length > 0 ? violation.nodes[0].html : '',
      ruleId: violation.id,
      help: violation.help,
      tags: violation.tags,
      nodes: violation.nodes.map(node => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary
      }))
    }));
        return {
          accessibility: {
        score: (
          axeResults.passes.length /
          (axeResults.passes.length + axeResults.violations.length)
        ).toFixed(2),
            issues: accessibilityIssues,
            passCount: axeResults.passes.length,
            incompleteCount: axeResults.incomplete.length
          }
        };
      } catch (error) {
    if (browser) await browser.close();
        throw error;
      }
    }
    
// Helper function to run Mozilla Observatory security test
async function runMozillaObservatoryTest(url) {
  const { hostname } = new URL(url);
  try {
    // Start scan and get results from v2 API
    const response = await axios.post(`https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${hostname}`);
    const data = response.data;
    // Parse new v2 fields
        return {
          security: {
        score: data.score ?? 0,
        grade: data.grade ?? '',
        detailsUrl: data.details_url ?? '',
        algorithmVersion: data.algorithm_version ?? null,
        scannedAt: data.scanned_at ? new Date(data.scanned_at) : null,
        statusCode: data.status_code ?? null,
        testsFailed: data.tests_failed ?? null,
        testsPassed: data.tests_passed ?? null,
        testsQuantity: data.tests_quantity ?? null
          }
        };
      } catch (error) {
    throw new Error('Mozilla Observatory scan failed: ' + (error.response?.data?.error || error.message));
  }
}

// Helper function to run browser compatibility test
async function runBrowserCompatibilityTest(url) {
  const puppeteer = require('puppeteer');
  let browser;
  try {
    console.log('[BrowserTest] Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    console.log(`[BrowserTest] Navigating to ${url} ...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('[BrowserTest] Injecting axe-core...');
    await page.addScriptTag({ path: require.resolve('axe-core') });
    // Wait for axe to be available in the page context
    await page.waitForFunction('window.axe !== undefined');
    console.log('[BrowserTest] Running axe-core for browser compatibility (accessibility) issues...');
    const axeResults = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        resultTypes: ['violations']
      });
    });
    const issues = axeResults.violations.map(violation => ({
      description: violation.description || violation.help,
      impact: violation.impact || 'unknown',
      element: violation.nodes && violation.nodes.length > 0 ? violation.nodes[0].html : '',
      ruleId: violation.id,
      help: violation.help,
      tags: violation.tags,
      nodes: violation.nodes.map(node => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary
      }))
    }));
    console.log(`[BrowserTest] Axe-core evaluation complete. Issues found: ${issues.length}`);
    // Take screenshot
    console.log('[BrowserTest] Taking screenshot...');
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = screenshotBuffer.toString('base64');
    // Collect JS errors
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    console.log('[BrowserTest] Closing browser...');
    await browser.close();
    return {
      browserCompatibility: {
        issues,
        screenshots: [
          {
            browser: 'Puppeteer (Chromium)',
            url: `data:image/png;base64,${screenshotBase64}`
          }
        ],
        errors,
        summary: {
          totalIssues: issues.length,
          errorCount: errors.length
        }
      }
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error('[BrowserTest] ERROR:', error.stack || error);
      throw error;
  }
}

// Helper function to run Lighthouse SEO test
async function runSeoTestWithLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
  const opts = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['seo'],
    port: chrome.port,
  };
  try {
    const runnerResult = await lighthouse(url, opts);
    const lhr = runnerResult.lhr;
    const seoScore = typeof lhr.categories.seo.score === 'number' ? lhr.categories.seo.score : 0;
    // Collect issues from failed audits
    const issues = Object.values(lhr.audits)
      .filter(audit => audit.score !== 1)
      .map(audit => ({
        description: audit.title,
        impact: audit.scoreDisplayMode,
        recommendation: audit.description
      }));
    await chrome.kill();
    return {
      seo: {
        score: seoScore,
        issues
      }
    };
  } catch (err) {
    await chrome.kill();
    throw err;
  }
}


// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private
const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  // Check if test belongs to user or user is admin
  if (test.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this test');
  }

  await Test.deleteOne({ _id: test._id });
  res.json({ message: 'Test removed' });
});

// @desc    Get dashboard statistics
// @route   GET /api/tests/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get all tests for the user
    const tests = await Test.find({ user: req.user._id });
    // Calculate statistics
    const totalTests = tests.length;
    const completedTests = tests.filter(test => test.status === 'completed').length;
    const failedTests = tests.filter(test => test.status === 'failed').length;
    const pendingTests = tests.filter(test => test.status === 'pending' || test.status === 'running').length;
    // Calculate average performance score (for tests that have performance results)
    let performanceTotal = 0;
    let performanceCount = 0;
    tests.forEach(test => {
      if (test.results && test.results.performance && test.results.performance.score) {
        performanceTotal += test.results.performance.score * 100; // Convert from 0-1 to 0-100
        performanceCount++;
      }
    });
    const avgPerformance = performanceCount > 0 
      ? Math.round(performanceTotal / performanceCount) 
      : 0;
    // Get recent tests (latest 10)
    const recentTests = await Test.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    // Format recent tests for frontend
    const formattedRecentTests = Array.isArray(recentTests) ? recentTests.map(test => ({
      id: test._id,
      url: test.url,
      testType: test.testType,
      status: test.status,
      createdAt: test.createdAt,
      score: getTestScore(test)
    })) : [];
    // Return dashboard stats with safe defaults
    res.json({
      stats: {
        totalTests: typeof totalTests === 'number' ? totalTests : 0,
        completedTests: typeof completedTests === 'number' ? completedTests : 0,
        failedTests: typeof failedTests === 'number' ? failedTests : 0,
        pendingTests: typeof pendingTests === 'number' ? pendingTests : 0,
        avgPerformance: typeof avgPerformance === 'number' ? avgPerformance : 0
      },
      recentTests: Array.isArray(formattedRecentTests) ? formattedRecentTests : []
    });
  } catch (error) {
    // Always return safe defaults on error
    res.status(200).json({
      stats: {
        totalTests: 0,
        completedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        avgPerformance: 0
      },
      recentTests: []
    });
  }
});

// Helper function to extract the main score from a test based on its type
const getTestScore = (test) => {
  if (!test.results || test.status !== 'completed') {
    return null;
  }
  switch (test.testType) {
    case 'performance':
      return test.results.performance && typeof test.results.performance.score === 'number'
        ? Math.round(test.results.performance.score * 100) 
        : null;
    case 'accessibility':
      return test.results.accessibility && typeof test.results.accessibility.score === 'number'
        ? Math.round(test.results.accessibility.score * 100) 
        : null;
    case 'security':
      return test.results.security && typeof test.results.security.score === 'number'
        ? Math.round(test.results.security.score)
        : null;
    case 'seo':
      return test.results.seo && typeof test.results.seo.score === 'number'
        ? Math.round(test.results.seo.score * 100)
        : null;
    case 'browser':
      if (test.results.browserCompatibility && test.results.browserCompatibility.summary) {
        const totalIssues = test.results.browserCompatibility.summary.totalIssues || 0;
        return Math.max(0, Math.round(100 - (totalIssues * 5)));
      }
      // fallback to old browser.overall.visualScore if present
      if (test.results.browser && test.results.browser.overall && typeof test.results.browser.overall.visualScore === 'number') {
        return test.results.browser.overall.visualScore;
      }
      return null;
    case 'all':
      return test.results.performance && typeof test.results.performance.score === 'number'
        ? Math.round(test.results.performance.score * 100)
        : null;
    default:
      return null;
  }
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  runTest,
  deleteTest,
  getDashboardStats,
  getAllTestsPaginated
}; 