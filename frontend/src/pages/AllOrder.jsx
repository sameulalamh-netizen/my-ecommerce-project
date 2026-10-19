
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../services/orderServices";

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getAllOrders();

                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to load orders"
                    );
                }

                setOrders(response.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Orders load kora jayni."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatStatus = (status) => {
        if (!status) return "N/A";
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const statusClass = (status) => {
        const classes = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            processing: "bg-indigo-100 text-indigo-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
        };

        return classes[status] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="p-6">
                <p>Loading all orders...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        All Orders
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Super Admin can manage and monitor all customer orders.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="mt-2 text-2xl font-bold">
                            {orders.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Delivered Orders</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {orders.filter(
                                (order) =>
                                    order.shopOrders?.length > 0 &&
                                    order.shopOrders.every(
                                        (item) => item.status === "delivered"
                                    )
                            ).length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Pending Orders</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {orders.filter((order) =>
                                order.shopOrders?.some(
                                    (item) => item.status === "pending"
                                )
                            ).length}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    {orders.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">
                            No orders found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-112.5 text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-4">Order ID</th>
                                        <th className="px-4 py-4">Customer</th>
                                        <th className="px-4 py-4">Shops</th>
                                        <th className="px-4 py-4">Total</th>
                                        <th className="px-4 py-4">Payment</th>
                                        <th className="px-4 py-4">Order Status</th>
                                        <th className="px-4 py-4">Date</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {orders.map((order) => {
                                        const statuses = [
                                            ...new Set(
                                                (order.shopOrders || []).map(
                                                    (item) => item.status
                                                )
                                            ),
                                        ];

                                        return (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-medium">
                                                        {order._id?.slice(-8).toUpperCase()}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="font-medium">
                                                        {order.user?.name || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {order.user?.email || ""}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {(order.shopOrders || []).map(
                                                        (item, index) => (
                                                            <p key={`${order._id}-${index}`}>
                                                                {item.shop?.name || "Shop"}
                                                            </p>
                                                        )
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 font-semibold">
                                                    ৳{Number(order.total || 0).toLocaleString("en-BD")}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="capitalize">
                                                        {order.paymentMethod === "cod"
                                                            ? "Cash on Delivery"
                                                            : order.paymentMethod || "N/A"}
                                                    </p>
                                                    <span
                                                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${statusClass(order.paymentStatus)}`}
                                                    >
                                                        {formatStatus(order.paymentStatus)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {statuses.map((status) => (
                                                            <span
                                                                key={status}
                                                                className={`rounded-full px-2 py-1 text-xs ${statusClass(status)}`}
                                                            >
                                                                {formatStatus(status)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                                                    {formatDate(order.createdAt)}
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

export default AllOrders;
