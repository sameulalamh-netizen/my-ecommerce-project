
import api from "./api";

// Super Admin shob seller application load korbe
export const getSellerApplications = async () => {
    const response = await api.get("/seller/applications");
    return response.data;
};

// Seller application approve
export const approveSellerApplication = async (applicationId) => {
    const response = await api.patch("/seller/approve", {
        applicationId,
    });
    return response.data;
};

// Seller application reject
export const rejectSellerApplication = async (applicationId) => {
    const response = await api.patch("/seller/reject", {
        applicationId,
    });
    return response.data;
};


export const applyForSeller = async (shopName, shopDescription) => {
    const response = await api.post("/seller/apply", {
        shopName,
        shopDescription,
    });

    return response.data;
};
