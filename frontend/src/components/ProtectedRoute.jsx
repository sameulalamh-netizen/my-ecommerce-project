import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // Auth check ekhono cholche
    if (loading) {
        return <p className="p-6 text-center">Checking login...</p>;
    }

    // Login na thakle login page-e pathabe
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Login thakle nested protected page show korbe
    return <Outlet />;
};

export default ProtectedRoute;