import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authServices";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        try {
            const data = await registerUser(formData);

            setSuccess(data.message || "Registration successful!");

            setFormData({
                name: "",
                email: "",
                password: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-md  "
            >
                <h1 className="mb-6 text-2xl font-bold text-center">
                    Create Account
                </h1>

                {error && (
                    <p className="mb-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="mb-4 text-sm text-green-600">
                        {success}
                    </p>
                )}

                <div className="">
                    <label className="mb-1 block pl-3  ">Name</label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className=" w-full rounded border p-3 outline-none"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block">Email</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="w-full border rounded p-5 outline-none "
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
                    className="w-full mt-4 rounded bg-blue-600 p-3  font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;