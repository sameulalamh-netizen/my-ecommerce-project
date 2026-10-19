const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);


const shopOrderSchema = new mongoose.Schema(
    {
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        _id: false
    }
);


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        shopOrders: {
            type: [shopOrderSchema],
            required: true
        },

        shippingAddress: {
            name: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            },

            address: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },

            postcode: {
                type: String,
                default: "1000",
            },

        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "sslcommerz"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },
        paymentInfo: {
            transactionId: {
                type: String,
                unique: true,
                sparse: true
            },

            paidAt: {
                type: Date
            },

            stockRestored: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;