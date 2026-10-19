
import api from "./api";

export const getCategories = async () => {
    const response = await api.get("/category");
    return response.data;
};

export const createCategory = async (formData) => {
    const response = await api.post("/category", formData);
    return response.data;
};

export const updateCategory = async (categoryId, formData) => {
    const response = await api.patch(
        `/category/${categoryId}`,
        formData
    );
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    const response = await api.delete(
        `/category/${categoryId}`
    );
    return response.data;
};
