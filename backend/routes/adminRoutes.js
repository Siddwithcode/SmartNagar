const express = require('express');
const {
  getDashboardStats,
  getAnalytics,
  getTopCitizens,
  getAdminIssues,
  deleteIssue,
  bulkAction,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('Admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/citizens', getTopCitizens);
router.get('/issues', getAdminIssues);
router.delete('/issues/:id', deleteIssue);
router.post('/issues/bulk', bulkAction);

module.exports = router;
