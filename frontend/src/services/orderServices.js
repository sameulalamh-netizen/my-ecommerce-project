import api from "./api";

export const createOrder = async (orderData) => {
    const response = await api.post("/order", orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get("/order/my-orders");
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
};

export const cancelOrder = async (orderId) => {
    const response = await api.patch(`/order/${orderId}/cancel`);
    return response.data;
};


export const getShopOrders = async () => {
  const response = await api.get("/order/shop-orders");
  return response.data;
};

export const updateShopOrderStatus = async (orderId, orderStatus) => {
  const response = await api.patch(
    `/order/${orderId}/status`,
    { orderStatus }
  );

  return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get("/order/all-orders");
    
    return response.data;
};