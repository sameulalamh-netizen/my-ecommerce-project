const express = require("express");

const {
    addToCart,
    getMyCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    validateCartStock
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("customer"),
    addToCart
);
router.get(
    "/",
    authMiddleware,
    authorizeRoles("customer"),
    getMyCart
);

router.patch(
    "/:productId",
    authMiddleware,
    authorizeRoles("customer"),
    updateCartQuantity
);

router.get(
    "/validate-stock",
    authMiddleware,
    authorizeRoles("customer"),
    validateCartStock
);

router.delete(
    "/:productId",
    authMiddleware,
    authorizeRoles("customer"),
    removeFromCart
);

router.delete(
    "/",
    authMiddleware,
    authorizeRoles("customer"),
    clearCart
);
module.exports = router;