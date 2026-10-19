
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getSellerApplications,
    approveSellerApplication,
    rejectSellerApplication,
    applyForSeller
} from "../services/sellerServices";

const SellerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getSellerApplications();

            if (!response.success) {
                throw new Error(
                    response.message || "Applications load kora jayni."
                );
            }

            setApplications(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Applications load kora jayni."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleAction = async (applicationId, action) => {
        const actionName = action === "approve" ? "approve" : "reject";

        const confirmed = window.confirm(
            `Tumi ki ei application-ti ${actionName} korte chao?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(applicationId);
            setError("");
            setMessage("");

            const response =
                action === "approve"
                    ? await approveSellerApplication(applicationId)
                    : await rejectSellerApplication(applicationId);

            if (!response.success) {
                throw new Error(
                    response.message || `Application ${actionName} kora jayni.`
                );
            }

            setMessage(response.message || `Application ${actionName} hoyeche.`);

            // Server theke latest data abar load
            await fetchApplications();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Operation failed."
            );
        } finally {
            setProcessingId("");
        }
    };

    const filteredApplications = applications.filter((application) => {
        if (filter === "all") return true;
        return application.status === filter;
    });

    const statusStyle = (status) => {
        const styles = {
            pending: "bg-amber-100 text-amber-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                            Seller Applications
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Review and manage customer requests to become sellers.
                        </p>
                    </div>

                    <button
                        onClick={fetchApplications}
                        disabled={loading}
                        className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-100 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {message}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Applications</p>
                        <p className="mt-2 text-3xl font-bold">
                            {applications.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-amber-600">
                            {applications.filter(
                                (item) => item.status === "pending"
                            ).length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Approved</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {applications.filter(
                                (item) => item.status === "approved"
                            ).length}
                        </p>
                    </div>
                </div>

                <div className="mb-5 flex flex-wrap items-center gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                                filter === status
                                    ? "bg-gray-900 text-white"
                                    : "border bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {status === "all" ? "All" : status}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    {loading ? (
                        <p className="p-8 text-center text-gray-500">
                            Loading seller applications...
                        </p>
                    ) : filteredApplications.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">
                            No applications found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-212.5 text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-4">Customer</th>
                                        <th className="px-4 py-4">Shop Name</th>
                                        <th className="px-4 py-4">Description</th>
                                        <th className="px-4 py-4">Applied On</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredApplications.map((application) => {
                                        const isProcessing =
                                            processingId === application._id;

                                        return (
                                            <tr
                                                key={application._id}
                                                className="align-top hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {application.user?.name || "Unknown"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {application.user?.email || ""}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {application.shopName}
                                                </td>

                                                <td className="max-w-xs px-4 py-4 text-gray-600">
                                                    {application.shopDescription || "No description"}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                                                    {formatDate(application.createdAt)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(application.status)}`}
                                                    >
                                                        {application.status || "unknown"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {application.status === "pending" ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleAction(
                                                                        application._id,
                                                                        "approve"
                                                                    )
                                                                }
                                                                disabled={Boolean(processingId)}
                                                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                            >
                                                                {isProcessing
                                                                    ? "Please wait..."
                                                                    : "Approve"}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleAction(
                                                                        application._id,
                                                                        "reject"
                                                                    )
                                                                }
                                                                disabled={Boolean(processingId)}
                                                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            No action
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-block rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-100"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default SellerApplications;
