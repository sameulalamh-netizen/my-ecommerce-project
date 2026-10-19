
const mongoose = require("mongoose");
const Order = require("../model/Order");
const User = require("../model/User");

const {
    createPaymentSession,
    validatePayment,
} = require("../services/sslcommerzService");

// Frontend-e redirect
const redirectToFrontend = (res, path, params = {}) => {
    try {
        const frontendURL = process.env.FRONTEND_URL;

        if (!frontendURL) {
            return res.status(500).json({
                success: false,
                message: "FRONTEND_URL is not configured",
            });
        }

        const url = new URL(path, frontendURL);

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        }

        return res.redirect(303, url.toString());
    } catch (error) {
        console.error("Frontend redirect error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to redirect to frontend",
        });
    }
};

// Callback body/query theke value neya
const getCallbackValue = (req, key) => {
    return req.body?.[key] ?? req.query?.[key];
};

// Order-er kono shop order cancelled kina
const hasCancelledShopOrder = (order) => {
    return order.shopOrders?.some(
        (shopOrder) => shopOrder.status === "cancelled"
    ) ?? false;
};

// Validated payment-er por order paid kora
const finalizeValidatedPayment = async (validationResult) => {
    if (!validationResult || typeof validationResult !== "object") {
        return {
            success: false,
            reason: "invalid_validation_response",
        };
    }

    const status = String(
        validationResult.status || ""
    ).toUpperCase();

    if (!["VALID", "VALIDATED"].includes(status)) {
        return {
            success: false,
            reason: "payment_not_valid",
        };
    }

    const transactionId = validationResult.tran_id;

    if (!transactionId) {
        return {
            success: false,
            reason: "missing_transaction_id",
        };
    }

    if (
        String(validationResult.currency || "").toUpperCase() !== "BDT"
    ) {
        return {
            success: false,
            reason: "invalid_currency",
        };
    }

    const paidAmount = Number(validationResult.amount);

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
        return {
            success: false,
            reason: "invalid_amount",
        };
    }

    // Exact transaction ID diye order khunje ber kora
    const order = await Order.findOne({
        "paymentInfo.transactionId": transactionId,
        paymentMethod: "sslcommerz",
    });

    if (!order) {
        return {
            success: false,
            reason: "order_not_found",
        };
    }

    // Amount match check
    const expectedAmount = Number(order.total);

    if (
        !Number.isFinite(expectedAmount) ||
        Math.round(paidAmount * 100) !==
        Math.round(expectedAmount * 100)
    ) {
        console.error("SSLCommerz amount mismatch", {
            transactionId,
            paidAmount,
            expectedAmount,
            orderId: order._id.toString(),
        });

        return {
            success: false,
            reason: "amount_mismatch",
            orderId: order._id,
        };
    }

    // Duplicate verified callback hole abar update noy
    if (order.paymentStatus === "paid") {
        return {
            success: true,
            alreadyPaid: true,
            orderId: order._id,
        };
    }

    if (order.paymentStatus !== "pending") {
        return {
            success: false,
            reason: "payment_status_not_pending",
            orderId: order._id,
        };
    }

    if (order.paymentInfo?.stockRestored) {
        return {
            success: false,
            reason: "stock_already_restored",
            orderId: order._id,
        };
    }

    if (hasCancelledShopOrder(order)) {
        return {
            success: false,
            reason: "order_cancelled",
            orderId: order._id,
        };
    }

    // Atomic update: concurrent callback/cancellation protection
    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            paymentStatus: "pending",
            paymentMethod: "sslcommerz",
            "paymentInfo.transactionId": transactionId,
            "paymentInfo.stockRestored": { $ne: true },
            shopOrders: {
                $not: {
                    $elemMatch: {
                        status: "cancelled",
                    },
                },
            },
        },
        {
            $set: {
                paymentStatus: "paid",
                "paymentInfo.paidAt": new Date(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (updatedOrder) {
        return {
            success: true,
            orderId: updatedOrder._id,
        };
    }

    // Concurrent callback-er por latest status check
    const latestOrder = await Order.findById(order._id);

    if (latestOrder?.paymentStatus === "paid") {
        return {
            success: true,
            alreadyPaid: true,
            orderId: latestOrder._id,
        };
    }

    return {
        success: false,
        reason: "order_status_changed",
        orderId: order._id,
    };
};

// Payment session initiate
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId || "")) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID is required",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.user.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot pay for this order",
            });
        }

        if (order.paymentMethod !== "sslcommerz") {
            return res.status(400).json({
                success: false,
                message: "This order does not use SSLCommerz",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid",
            });
        }

        if (order.paymentStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This order cannot be paid",
            });
        }

        if (order.paymentInfo?.stockRestored) {
            return res.status(400).json({
                success: false,
                message: "Order stock was restored; payment is disabled",
            });
        }

        // Partial ba full cancellation hole payment allow noy
        if (hasCancelledShopOrder(order)) {
            return res.status(400).json({
                success: false,
                message: "Cancelled orders cannot be paid",
            });
        }

        if (!order.paymentInfo?.transactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is missing",
            });
        }

        const totalAmount = Number(order.total);

        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount",
            });
        }

        const user = await User.findById(order.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const shipping = order.shippingAddress || {};

        const paymentData = {
            totalAmount,
            tranId: order.paymentInfo.transactionId,

            customerName: shipping.name || user.name,
            customerPhone: shipping.phone || user.phone,
            customerEmail: user.email,

            customerAddress:
                shipping.address || user.address || "Dhaka",

            customerCity:
                shipping.city || user.city || "Dhaka",

            customerPostcode:
                shipping.postcode || user.postcode || "1000",
        };
        const requiredFields = [
            "customerName",
            "customerPhone",
            "customerEmail",
            "customerAddress",
            "customerCity",
        ];

        const missingField = requiredFields.find((field) => {
            const value = paymentData[field];

            return (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            );
        });

        if (missingField) {
            return res.status(400).json({
                success: false,
                message: `Missing required customer information: ${missingField}`,
            });
        }

        const paymentResponse = await createPaymentSession(paymentData);

        if (
            String(paymentResponse?.status || "").toUpperCase() !==
            "SUCCESS" ||
            !paymentResponse?.GatewayPageURL
        ) {
            console.error("SSLCommerz session creation failed", {
                status: paymentResponse?.status,
                failedReason: paymentResponse?.failedreason,
            });

            return res.status(502).json({
                success: false,
                message: "SSLCommerz session creation failed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment session created",
            data: {
                GatewayPageURL: paymentResponse.GatewayPageURL,
                transactionId: order.paymentInfo.transactionId,
            },
        });
    } catch (error) {
        console.error("Initiate payment error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to initiate payment",
        });
    }
};

// Success callback: validation API diye verify
const paymentSuccess = async (req, res) => {
    try {


        // Step 2: Get validation ID
        const valId = getCallbackValue(req, "val_id");

        if (!valId) {
            console.error(
                "SSLCommerz callback failed: validation ID is missing"
            );

            return redirectToFrontend(res, "/payment/failed", {
                reason: "missing_validation_id",
            });
        }

        console.log("Validation ID received successfully.");

        // Step 3: Verify payment with SSLCommerz
        let validationResult;

        try {
            validationResult = await validatePayment(valId);

            console.log("SSLCommerz validation response:", {
                status: validationResult?.status,
                tran_id: validationResult?.tran_id,
                amount: validationResult?.amount,
                currency: validationResult?.currency,
            });
        } catch (validationError) {
            console.error(
                "SSLCommerz validation request failed:",
                validationError.response?.data ||
                validationError.message
            );

            return redirectToFrontend(res, "/payment/failed", {
                reason: "validation_request_failed",
            });
        }

        // Step 4: Finalize the validated payment
        const result = await finalizeValidatedPayment(validationResult);

        if (!result.success) {
            console.error("Payment verification rejected:", {
                reason: result.reason,
                orderId: result.orderId,
            });

            return redirectToFrontend(res, "/payment/failed", {
                reason: result.reason || "payment_verification_failed",
                orderId: result.orderId,
            });
        }

        // Step 5: Payment successful
        console.log("Payment verified successfully:", {
            orderId: result.orderId,
        });

        return redirectToFrontend(res, "/payment/success", {
            orderId: result.orderId,
        });

    } catch (error) {
        console.error("Payment success callback error:", {
            message: error.message,
            stack: error.stack,
        });

        return redirectToFrontend(res, "/payment/failed", {
            reason: "verification_error",
        });
    }
};

// Fail callback: unverified callback diye status change noy
const paymentFail = async (req, res) => {
    try {
        const transactionId = getCallbackValue(req, "tran_id");

        if (!transactionId) {
            return redirectToFrontend(res, "/payment/failed", {
                reason: "missing_transaction_id",
            });
        }

        const order = await Order.findOne({
            "paymentInfo.transactionId": transactionId,
            paymentMethod: "sslcommerz",
        });

        if (!order) {
            return redirectToFrontend(res, "/payment/failed", {
                reason: "order_not_found",
            });
        }

        if (order.paymentStatus === "paid") {
            return redirectToFrontend(res, "/payment/success", {
                orderId: order._id,
            });
        }

        return redirectToFrontend(res, "/payment/failed", {
            orderId: order._id,
            reason: "payment_not_completed",
        });
    } catch (error) {
        console.error("Payment fail callback error:", error.message);

        return redirectToFrontend(res, "/payment/failed", {
            reason: "server_error",
        });
    }
};

// Cancel callback: status/stock ekhane change noy
const paymentCancel = async (req, res) => {
    try {
        const transactionId = getCallbackValue(req, "tran_id");

        if (!transactionId) {
            return redirectToFrontend(res, "/payment/cancelled", {
                reason: "missing_transaction_id",
            });
        }

        const order = await Order.findOne({
            "paymentInfo.transactionId": transactionId,
            paymentMethod: "sslcommerz",
        });

        if (!order) {
            return redirectToFrontend(res, "/payment/cancelled", {
                reason: "order_not_found",
            });
        }

        if (order.paymentStatus === "paid") {
            return redirectToFrontend(res, "/payment/success", {
                orderId: order._id,
            });
        }

        return redirectToFrontend(res, "/payment/cancelled", {
            orderId: order._id,
            reason: "payment_cancelled",
        });
    } catch (error) {
        console.error("Payment cancel callback error:", error.message);

        return redirectToFrontend(res, "/payment/cancelled", {
            reason: "server_error",
        });
    }
};

// IPN: payment validate kore order update
const paymentIPN = async (req, res) => {
    try {
        const valId = getCallbackValue(req, "val_id");

        if (!valId) {
            return res.status(400).json({
                success: false,
                message: "Validation ID is missing",
            });
        }

        const validationResult = await validatePayment(valId);
        const result = await finalizeValidatedPayment(validationResult);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Payment could not be verified",
                reason: result.reason,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified",
            orderId: result.orderId,
        });
    } catch (error) {
        console.error("Payment IPN error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to process payment notification",
        });
    }
};

module.exports = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIPN,
};
