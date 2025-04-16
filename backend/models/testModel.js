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
      enum: ['performance', 'security', 'accessibility', 'seo', 'all'],
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
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
          },
        ],
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