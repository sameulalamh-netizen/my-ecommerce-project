const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');


const { getProducts,createProduct ,updateProduct,deleteProduct,getAllProducts,getProductbyId} = require('../controllers/productControllers');

const router = express.Router();

router.get('/shop-products',authMiddleware, authorizeRole('shop_admin'), getProducts);
router.post('/products',authMiddleware, authorizeRole('shop_admin'), upload.single('image'), createProduct);
router.patch('/products/:productId',authMiddleware, authorizeRole('shop_admin'), upload.single('image'), updateProduct);
router.delete('/products/:productId',authMiddleware, authorizeRole('shop_admin'), deleteProduct);
router.get('/all-products', getAllProducts); // Public route to get all products
router.get('/products/:productId', getProductbyId); // Public route to get a product by ID


module.exports = router;