const allowedTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing"],
    processing: ["shipped"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: []
};

const canChangeOrderStatus = (currentStatus, newStatus) => {
    if (!allowedTransitions[currentStatus]) {
        return false;
    }

    return allowedTransitions[currentStatus].includes(
        newStatus
    );
};

module.exports = {
    allowedTransitions,
    canChangeOrderStatus
};