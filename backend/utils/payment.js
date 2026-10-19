const crypto = require("crypto");

const generateTransactionId = () => {
    const randomPart = crypto.randomBytes(4).toString("hex");

    return `TXN_${Date.now()}_${randomPart}`;
};

module.exports = { generateTransactionId };