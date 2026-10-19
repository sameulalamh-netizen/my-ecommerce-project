const express = require('express');
const { registerUser,loginUser,logoutUser,updateUserRole,createAdminUser,getProfile} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/profile', authMiddleware, getProfile);

router.get('/admin', authMiddleware, authorizeRole('super_admin'), (req, res) => {
  res.status(200).json({
    success: true,  
    message: 'This is an admin-only route.',
    user: req.user
  });
});

router.patch('/role', authMiddleware, authorizeRole('super_admin'), updateUserRole);

router.post('/superadmin',createAdminUser);

module.exports = router;