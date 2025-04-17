const mongoose = require('mongoose');

const testSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    url: {
      type: String,
      required: [true, 'Please provide a URL to test'],
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Please provide a valid URL',
      ],
    },
    testType: {
      type: String,
      required: true,
      enum: ['performance', 'security', 'accessibility', 'seo', 'browser', 'all'],
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    parameters: {
      browsers: [String],
      options: mongoose.Schema.Types.Mixed
    },
    results: {
      performance: {
        score: {
          type: Number,
          default: 0,
        },
        metrics: {
          FCP: Number, // First Contentful Paint
          LCP: Number, // Largest Contentful Paint
          CLS: Number, // Cumulative Layout Shift
          FID: Number, // First Input Delay
          TTI: Number, // Time to Interactive
        },
      },
      security: {
        score: {
          type: Number,
          default: 0,
        },
        vulnerabilities: [
          {
            name: String,
            severity: String,
            description: String,
            location: String,
          },
        ],
        summary: {
          high: Number,
          medium: Number,
          low: Number,
          informational: Number,
          total: Number
        },
        scanType: {
          type: String,
          enum: ['baseline', 'active', 'full']
        }
      },
      accessibility: {
        score: {
          type: Number,
          default: 0,
        },
        issues: [
          {
            description: String,
            impact: String,
            element: String,
          },
        ],
        passCount: Number,
        incompleteCount: Number
      },
      seo: {
        score: {
          type: Number,
          default: 0,
        },
        issues: [
          {
            description: String,
            impact: String,
            recommendation: String,
          },
        ],
      },
      browser: {
        browsers: [
          {
            name: String,
            rendering: String,
            functionality: String,
            loadTime: Number,
            issues: [String]
          }
        ],
        screenshots: [
          {
            browser: String,
            url: String
          }
        ],
        overall: {
          visualScore: Number,
          functionalScore: Number,
          performanceScore: Number
        }
      }
    },
    errorMessage: {
      type: String,
    },
    schedule: {
      isScheduled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      nextRun: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', testSchema); 