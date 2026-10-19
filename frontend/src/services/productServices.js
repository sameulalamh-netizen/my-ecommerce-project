import api from "./api";

export const getShopProducts = async () => {
    const response = await api.get("/shop-products");
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post("/products", productData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await api.patch(
        `/products/${productId}`,
        productData
    );

    return response.data;
};

export const deleteProduct = async (productId) => {
    const response = await api.delete(`/products/${productId}`);

    return response.data;
};

export const getProductById = async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
};



export const getAllProducts = async (params = {}) => {
    const response = await api.get("/all-products", {
        params: {
            limit: 100,
            ...params,
        },
    });

    return response.data;
};
