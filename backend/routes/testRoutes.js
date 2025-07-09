const express = require('express');
const router = express.Router();
const {
  createTest,
  getTests,
  getTestById,
  runTest,
  deleteTest,
  getDashboardStats,
  getAllTestsPaginated
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.route('/')
  .post(protect, createTest)
  .get(protect, getTests);

// Get dashboard statistics
router.route('/stats')
  .get(protect, getDashboardStats);

// Add paginated tests endpoint
router.route('/paginated')
  .get(protect, getAllTestsPaginated);

router.route('/:id')
  .get(protect, getTestById)
  .delete(protect, deleteTest);

router.route('/:id/run')
  .put(protect, runTest);

module.exports = router; 