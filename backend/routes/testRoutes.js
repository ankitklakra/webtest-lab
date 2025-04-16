const express = require('express');
const router = express.Router();
const {
  createTest,
  getTests,
  getTestById,
  runTest,
  deleteTest,
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.route('/')
  .post(protect, createTest)
  .get(protect, getTests);

router.route('/:id')
  .get(protect, getTestById)
  .delete(protect, deleteTest);

router.route('/:id/run')
  .put(protect, runTest);

module.exports = router; 