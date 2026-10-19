import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p className="p-6 text-center">Checking access...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Children thakle children render hobe,
    // na thakle nested route-er Outlet render hobe.
    return children || <Outlet />;
};

export default RoleRoute;