import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from "../context/authContext";

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await login(formData);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Login to Your Account
                </h1>

                {error && (
                    <p className="mb-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="mb-1 block">Email</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="w-full rounded border p-3"
                    />
                </div>

                <div className="mb-5">
                    <label className="mb-1 block">Password</label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="w-full rounded border p-3"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;