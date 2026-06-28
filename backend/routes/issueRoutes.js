const express = require('express');
const { reportIssue, getIssues, verifyIssue, updateIssueStatus } = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, uploadImage, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getIssues);

router.post(
  '/report',
  protect,
  upload.single('image'),
  handleUploadError,
  uploadImage,
  reportIssue
);

router.patch('/:id/verify', protect, verifyIssue);
router.patch('/:id/status', protect, authorize('Admin'), updateIssueStatus);

module.exports = router;
