const express = require('express');

const{applyForSeller, getSellerApplications,approveSellerApplication,rejectSellerApplication} = require('../controllers/sellerController');

const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/apply', authMiddleware,authorizeRole('customer'), applyForSeller);
router.get('/applications', authMiddleware, authorizeRole('super_admin'), getSellerApplications);
router.patch('/approve', authMiddleware, authorizeRole('super_admin'), approveSellerApplication);
router.patch('/reject', authMiddleware, authorizeRole('super_admin'), rejectSellerApplication);

module.exports = router;