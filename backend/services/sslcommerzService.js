
const axios = require("axios");

const createPaymentSession = async (paymentData) => {
    try {
        const {
            SSLCOMMERZ_STORE_ID,
            SSLCOMMERZ_STORE_PASSWORD,
            SSLCOMMERZ_INIT_URL,
        } = process.env;

        if (
            !SSLCOMMERZ_STORE_ID ||
            !SSLCOMMERZ_STORE_PASSWORD ||
            !SSLCOMMERZ_INIT_URL
        ) {
            throw new Error("SSLCommerz configuration is missing");
        }

        if (
            !Number.isFinite(Number(paymentData.totalAmount)) ||
            Number(paymentData.totalAmount) <= 0
        ) {
            throw new Error("Invalid payment amount");
        }

        const requiredFields = [
            "tranId",
            "customerName",
            "customerPhone",
            "customerEmail",
            "customerAddress",
            "customerCity",
        ];

        for (const field of requiredFields) {
            if (
                paymentData[field] === undefined ||
                paymentData[field] === null ||
                String(paymentData[field]).trim() === ""
            ) {
                throw new Error(`Missing payment field: ${field}`);
            }
        }

        const backendURL = process.env.BACKEND_URL;

        if (!backendURL) {
            throw new Error("BACKEND_URL is missing");
        }

        const paymentPayload = {
            store_id: SSLCOMMERZ_STORE_ID,
            store_passwd: SSLCOMMERZ_STORE_PASSWORD,

            total_amount: Number(paymentData.totalAmount).toFixed(2),
            currency: "BDT",
            tran_id: paymentData.tranId,

            cus_name: paymentData.customerName,
            cus_email: paymentData.customerEmail,
            cus_phone: paymentData.customerPhone,
            cus_add1: paymentData.customerAddress,
            cus_city: paymentData.customerCity,
            cus_country: "Bangladesh",
            cus_postcode: String(paymentData.customerPostcode || 1000),

            shipping_method: "Courier",
            ship_name: paymentData.customerName,
            ship_add1: paymentData.customerAddress,
            ship_city: paymentData.customerCity,
            ship_country: "Bangladesh",
            ship_postcode: String(paymentData.customerPostcode || 1000),

            product_name: "E-commerce Order",
            product_category: "General",
            product_profile: "general",
            num_of_item: String(paymentData.numOfItem || 1),

            success_url: `${backendURL}/api/payment/success`,
            fail_url: `${backendURL}/api/payment/fail`,
            cancel_url: `${backendURL}/api/payment/cancel`,
            ipn_url: `${backendURL}/api/payment/ipn`,
        };

        const formData = new URLSearchParams();

        for (const [key, value] of Object.entries(paymentPayload)) {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        }

        const response = await axios.post(
            SSLCOMMERZ_INIT_URL,
            formData.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 20000,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "SSLCommerz initialization error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


const validatePayment = async (valId) => {
    try {
        const {
            SSLCOMMERZ_STORE_ID,
            SSLCOMMERZ_STORE_PASSWORD,
            SSLCOMMERZ_VALIDATION_URL,
        } = process.env;

        if (
            !SSLCOMMERZ_STORE_ID ||
            !SSLCOMMERZ_STORE_PASSWORD ||
            !SSLCOMMERZ_VALIDATION_URL
        ) {
            throw new Error("SSLCommerz validation configuration is missing");
        }

        if (!valId) {
            throw new Error("Payment validation ID is missing");
        }

        const response = await axios.get(
            SSLCOMMERZ_VALIDATION_URL,
            {
                params: {
                    val_id: valId,
                    store_id: SSLCOMMERZ_STORE_ID,
                    store_passwd: SSLCOMMERZ_STORE_PASSWORD,
                    format: "json",
                },
                timeout: 20000,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "SSLCommerz validation error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


module.exports = {
    createPaymentSession,
    validatePayment,
};
