
import { useState } from "react";
import { Link } from "react-router-dom";
import { applyForSeller } from "../services/sellerServices";

const ApplyForSeller = () => {
    const [shopName, setShopName] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!shopName.trim()) {
            setError("Shop name dite hobe.");
            return;
        }

        try {
            setLoading(true);

            const response = await applyForSeller(
                shopName.trim(),
                shopDescription.trim()
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Application submit kora jayni."
                );
            }

            setSuccess(
                response.message ||
                "Seller application successfully submit hoyeche!"
            );

            setShopName("");
            setShopDescription("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Application submit korte problem hoyeche."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                        Seller Program
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Apply to Become a Seller
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Tomar shop-er details diye application submit koro.
                        Super Admin review korar por application approve ba
                        reject korbe.
                    </p>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="shopName"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Shop Name *
                            </label>

                            <input
                                id="shopName"
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter your shop name"
                                maxLength={100}
                                required
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="shopDescription"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Shop Description
                            </label>

                            <textarea
                                id="shopDescription"
                                value={shopDescription}
                                onChange={(e) =>
                                    setShopDescription(e.target.value)
                                }
                                placeholder="Describe your shop and the products you sell..."
                                rows={5}
                                maxLength={1000}
                                disabled={loading}
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                            />

                            <p className="mt-1 text-right text-xs text-gray-500">
                                {shopDescription.length}/1000
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !shopName.trim()}
                            className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>

                <div className="mt-5">
                    <Link
                        to="/"
                        className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ApplyForSeller;
