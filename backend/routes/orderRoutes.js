const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateShopOrderStatus,
    getShopOrders,
    getAllOrders,
    updateOrderStatusByAdmin
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorizeRoles("customer"),
    createOrder
);
router.get(
    "/my-orders",
    protect,
    authorizeRoles("customer"),
    getMyOrders
);

router.get(
    "/shop-orders",
    protect,
    authorizeRoles("shop_admin"),
    getShopOrders
);

router.get(
    "/all-orders",
    protect,
    authorizeRoles("super_admin"),
    getAllOrders
);

router.get(
    "/:orderId",
    protect,
    authorizeRoles("customer"),
    getOrderById
);

router.patch(
    "/:orderId/cancel",
    protect,
    authorizeRoles("customer"),
    cancelOrder
);

router.patch(
    "/:orderId/status",
    protect,
    authorizeRoles("shop_admin"),
    updateShopOrderStatus
);
router.patch(
    "/admin-orders/:orderId/shop/:shopId/status",
    protect,
    authorizeRoles("super_admin"),
    updateOrderStatusByAdmin
);

module.exports = router;