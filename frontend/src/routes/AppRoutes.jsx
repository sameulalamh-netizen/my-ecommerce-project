
import { Routes, Route } from "react-router-dom";

import RoleRoute from "../components/RoleRoute";
import ProtectedRoute from "../components/ProtectedRoute";

import ShopDashboard from "../pages/ShopDasboaard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";
import ProductDetails from "../pages/ProductDetails";
import Checkout from "../pages/Checkout";
import OrderDetails from "../pages/OrderDetails";
import MyOrders from "../pages/Myorder";
import AddProductForm from "../components/AddProduct";
import EditProductForm from "../components/EditProductForm";
import ShopOrder from "../pages/ShopOrder";
import AllOrders from "../pages/AllOrder";
import SellerApplications from "../pages/SellerApplication";
import ApplyForSeller from "../pages/ApplyForSeller";
import CategoryManagement from "../pages/CategoryMangement";

import MainLayout from "../layouts/MainLayouts";

// Payment result pages
import PaymentSuccess from "../pages/PaymentSucces";
import PaymentFailed from "../pages/PaymentFailled";
import PaymentCancelled from "../pages/PaymentCancelled";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public pages */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/products/:productId"
                    element={<ProductDetails />}
                />

                {/* Payment result pages */}
                <Route
                    path="/payment/success"
                    element={<PaymentSuccess />}
                />

                <Route
                    path="/payment/failed"
                    element={<PaymentFailed />}
                />

                <Route
                    path="/payment/cancelled"
                    element={<PaymentCancelled />}
                />

                {/* Protected pages */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/checkout"
                        element={<Checkout />}
                    />

                    <Route
                        path="/order/:orderId"
                        element={<OrderDetails />}
                    />

                    <Route
                        path="/my-orders"
                        element={<MyOrders />}
                    />

                    <Route
                        path="/edit-product/:productId"
                        element={<EditProductForm />}
                    />

                    <Route
                        path="/shop-orders"
                        element={<ShopOrder />}
                    />

                    <Route
                        path="/apply-seller"
                        element={
                            <RoleRoute allowedRoles={["customer"]}>
                                <ApplyForSeller />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="/super-admin/categories"
                        element={
                            <RoleRoute allowedRoles={["super_admin"]}>
                                <CategoryManagement />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="/order/all-orders"
                        element={
                            <RoleRoute allowedRoles={["super_admin"]}>
                                <AllOrders />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="/super-admin/seller-applications"
                        element={
                            <RoleRoute allowedRoles={["super_admin"]}>
                                <SellerApplications />
                            </RoleRoute>
                        }
                    />

                    <Route
                        element={
                            <RoleRoute allowedRoles={["shop_admin"]} />
                        }
                    >
                        <Route
                            path="/shop-dashboard"
                            element={<ShopDashboard />}
                        />
                    </Route>

                    <Route
                        path="/add-product"
                        element={<AddProductForm />}
                    />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
