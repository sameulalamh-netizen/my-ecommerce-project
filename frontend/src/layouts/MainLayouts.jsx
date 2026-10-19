import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const MainLayout = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <nav className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white shadow-md fixed top-0 left-0 right-0 w-full z-50">
                {/* Logo / Brand Name */}
                <Link
                    to="/"
                    className="text-2xl font-bold tracking-wide text-indigo-400 transition-colors duration-200 hover:text-indigo-300"
                >
                    MyStore
                </Link>
                
                {/* Navigation Links */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/"
                        className="hidden md:block font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                    >
                        Home
                    </Link>
                    {!loading && (
                        user ? (
                            <>
                                {user.role === "customer" && (
                                    <>
                                       

                                        <Link
                                            to="/cart"
                                            className="font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                                        >
                                            Cart
                                        </Link>
                                    </>
                                )}
                                {user.role === "shop_admin" && (
                                    <>
                                        <Link
                                            to="/shop-dashboard"
                                            className="font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                                        >
                                            Shop Dashboard
                                        </Link>
                                    </>
                                )}


                                {user.role === "super_admin" && (
                                    <>
                                        <Link
                                            to="/order/all-orders"
                                            className="font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                                        >
                                            All Orders
                                        </Link>

                                      
                                    </>
                                )}

                                
                                <Link
                                    to="/profile"
                                    className="font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                                >
                                    {user.name || "My Profile"}
                                </Link>

                            </>


                        ) : (
                            <>
                                <Link to="/login"
                                    className="font-medium text-slate-300 transition-colors duration-200 hover:text-white     "
                                >
                                    Login
                                </Link>

                                <Link to="/register"
                                    className="font-medium text-slate-300 transition-colors duration-200 hover:text-white">
                                    Register
                                </Link>
                            </>
                        )
                    )}
                </div>
            </nav>
            


            <main className="pt-20 min-h-screen ">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;