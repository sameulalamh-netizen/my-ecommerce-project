const express = require('express');
const router = express.Router();
const {createShop,getShops,updateShop,deleteShop} = require('../controllers/shopController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/my-shop', authMiddleware, roleMiddleware('shop_admin'), getShops);
router.patch('/my-shop', authMiddleware, roleMiddleware('shop_admin'), updateShop);
router.delete('/my-shop/:shopId', authMiddleware, roleMiddleware('super_admin'), deleteShop);

module.exports = router;
