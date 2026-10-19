const mongoose = require("mongoose");
const Cart = require("../model/Cart");
const Product = require("../model/product");
const Order = require("../model/Order");
const Shop = require("../model/Shop");
const { generateTransactionId } = require("../utils/payment");
const {
    canChangeOrderStatus
} = require("../utils/orderStatus");


const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const {
            name,
            phone,
            address,
            city,
            postcode,
            paymentMethod
        } = req.body;

        if (!name || !phone || !address || !city) {
            throw new Error("Shipping information is required");
        }

        if (!["cod", "sslcommerz"].includes(paymentMethod)) {
            throw new Error("Invalid payment method");
        }

        const cart = await Cart.findOne({
            user: req.user.userId
        }).session(session);

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        const shopOrdersMap = new Map();

        let total = 0;

        for (const cartItem of cart.items) {

            const product = await Product.findById(
                cartItem.product
            ).session(session);

            if (!product) {
                throw new Error(
                    "A product in your cart no longer exists"
                );
            }

            if (product.stock < cartItem.quantity) {
                throw new Error(
                    `Insufficient stock for ${product.name}`
                );
            }

            const amount =
                product.price * cartItem.quantity;

            total += amount;

            const shopId = product.shop.toString();

            const orderItem = {
                product: product._id,
                shop: product.shop,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                amount: amount
            };

            if (!shopOrdersMap.has(shopId)) {
                shopOrdersMap.set(shopId, {
                    shop: product.shop,
                    items: [],
                    subtotal: 0,
                    status: "pending"
                });
            }

            const shopOrder =
                shopOrdersMap.get(shopId);

            shopOrder.items.push(orderItem);

            shopOrder.subtotal += amount;
        }

        const shopOrders =
            Array.from(shopOrdersMap.values());

        const transactionId =
            paymentMethod === "sslcommerz"
                ? generateTransactionId()
                : undefined;


        const order = await Order.create(
            [
                {
                    user: req.user.userId,

                    shopOrders: shopOrders,

                    shippingAddress: {
                        name,
                        phone,
                        address,
                        city,
                        postcode: postcode || "1000"
                    },

                    total: total,

                    paymentMethod: paymentMethod,
                    paymentInfo: {
                        transactionId
                    }
                }
            ],
            {
                session
            }
        );

        for (const cartItem of cart.items) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: cartItem.product,
                    stock: {
                        $gte: cartItem.quantity
                    }
                },
                {
                    $inc: {
                        stock: -cartItem.quantity
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!updatedProduct) {
                throw new Error(
                    "Insufficient stock or product no longer exists"
                );
            }
        }
        cart.items = [];

        await cart.save({
            session
        });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order[0]
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Create order error:", error);

        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to create order",
        });
    } finally {
        await session.endSession();
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userId
        })
            .populate("shopOrders.shop", "name logo")
            .populate(
                "shopOrders.items.product",
                "name image price"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("shopOrders.shop", "name logo")
            .populate(
                "shopOrders.items.product",
                "name image price"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (
            order.user.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this order"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message
        });
    }
};



const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            const error = new Error("Invalid order ID");
            error.statusCode = 400;
            throw error;
        }

        const order = await Order.findById(orderId).session(session);

        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            throw error;
        }

        if (
            order.user.toString() !== req.user.userId.toString()
        ) {
            const error = new Error("You cannot cancel this order");
            error.statusCode = 403;
            throw error;
        }

        if (
            order.paymentStatus === "paid" ||
            order.shopOrders.length === 0 ||
            order.shopOrders.some(
                (shopOrder) => shopOrder.status !== "pending"
            )
        ) {
            const error = new Error(
                "This order can no longer be cancelled"
            );
            error.statusCode = 400;
            throw error;
        }

        if (order.paymentInfo?.stockRestored) {
            const error = new Error(
                "Stock has already been restored"
            );
            error.statusCode = 400;
            throw error;
        }

        // Stock restore
        for (const shopOrder of order.shopOrders) {
            for (const item of shopOrder.items) {
                const product = await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: item.quantity,
                        },
                    },
                    { session }
                );

                if (!product) {
                    const error = new Error(
                        `Product not found: ${item.product}`
                    );
                    error.statusCode = 400;
                    throw error;
                }
            }

            shopOrder.status = "cancelled";
        }

        // COD payment ekhono collect hoyni.
        // SSLCommerz order cancel hole pending payment retry bondho.
        if (order.paymentMethod === "sslcommerz") {
            order.paymentStatus = "failed";
        }

        order.paymentInfo.stockRestored = true;

        await order.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Order cancelled and stock restored",
            data: order,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to cancel order",
        });
    } finally {
        await session.endSession();
    }
};




const getShopOrders = async (req, res) => {
    try {
        const shop = await Shop.findOne({
            owner: req.user.userId
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found"
            });
        }

        const orders = await Order.find({
            "shopOrders.shop": shop._id
        })
            .populate("user", "name email")
            .populate(
                "shopOrders.shop",
                "name logo"
            )
            .populate(
                "shopOrders.items.product",
                "name image"
            )
            .sort({ createdAt: -1 });

        const shopOrders = [];

        orders.forEach((order) => {
            const shopOrder = order.shopOrders.find(
                (item) =>
                    // item.shop যেহেতু একটি Object, তাই item.shop._id ব্যবহার করতে হবে
                    item.shop?._id?.toString() === shop._id.toString() ||
                    item.shop?.toString() === shop._id.toString()
            );

            if (shopOrder) {
                shopOrders.push({
                    orderId: order._id,
                    customer: order.user,
                    items: shopOrder.items,
                    subtotal: shopOrder.subtotal,
                    status: shopOrder.status,
                    shippingAddress: order.shippingAddress,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt
                });
            }
        });

        res.status(200).json({
            success: true,
            message: "Shop orders fetched successfully",
            data: shopOrders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch shop orders",
            error: error.message
        });
    }
};



const updateShopOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const allowedStatuses = [
            "confirmed",
            "processing",
            "shipped",
            "delivered",
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const shop = await Shop.findOne({
            owner: req.user.userId,
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const shopOrder = order.shopOrders.find(
            (item) => item.shop.toString() === shop._id.toString()
        );

        if (!shopOrder) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this order",
            });
        }

        const currentStatus = shopOrder.status;

        if (!canChangeOrderStatus(currentStatus, orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${orderStatus}`,
            });
        }

        shopOrder.status = orderStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Shop order status updated successfully",
            data: order,
        });
    } catch (error) {
        console.error("Update shop order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update shop order status",
            error: error.message,
        });
    }
};



const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("shopOrders.shop", "name description")
            .populate(
                "shopOrders.items.product",
                "name price image"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateOrderStatusByAdmin = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const shopOrder = order.shopOrders.find(
            (item) => item.shop.toString() === shopId
        );

        if (!shopOrder) {
            return res.status(404).json({
                success: false,
                message: "Shop order not found"
            });
        }

        const currentStatus = shopOrder.status;

        if (!canChangeOrderStatus(currentStatus, status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${status}`
            });
        }

        shopOrder.status = status;

        // COD: sob shop delivered hole payment paid hobe
        if (
            order.paymentMethod === "cod" &&
            order.shopOrders.every(
                (item) => item.status === "delivered"
            )
        ) {
            order.paymentStatus = "paid";
            order.paymentInfo.paidAt = new Date();
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });
    } catch (error) {
        console.error("Admin order status update error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};
module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateShopOrderStatus,
    getShopOrders,
    getAllOrders,
    updateOrderStatusByAdmin
};