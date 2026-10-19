import api from "./api";

export const initiatePayment = async (orderId) => {
    const response = await api.post("/payment/initiate", {
        orderId,
    });

    return response.data;
};