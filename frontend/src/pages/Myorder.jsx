
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyOrders,
  cancelOrder,
} from "../services/orderServices";

const isOrderCancelled = (order) => {
  const shopOrders = order.shopOrders ?? [];

  return (
    shopOrders.length > 0 &&
    shopOrders.every(
      (shopOrder) => shopOrder.status === "cancelled"
    )
  );
};

const getOrderStatus = (order) => {
  const shopOrders = order.shopOrders ?? [];

  if (isOrderCancelled(order)) {
    return "Cancelled";
  }

  if (shopOrders.length === 0) {
    return order.status ?? "Pending";
  }

  const statuses = [
    ...new Set(
      shopOrders.map((shopOrder) => shopOrder.status ?? "pending")
    ),
  ];

  return statuses
    .map((status) =>
      status.charAt(0).toUpperCase() + status.slice(1)
    )
    .join(", ");
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState("");

  // Orders fetch
  const fetchOrders = async () => {
    try {
      setError("");

      const response = await getMyOrders();

      const orderData =
        response.data?.orders ??
        response.data ??
        response.orders ??
        [];

      const allOrders = Array.isArray(orderData)
        ? orderData
        : orderData.orders ?? [];

      // Cancelled orders My Orders list-e show korbo na
      setOrders(
        allOrders.filter((order) => !isOrderCancelled(order))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Orders load kora jayni."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(orderId);
      setError("");

      await cancelOrder(orderId);

      // Cancel successful hole sathe sathe list theke remove
      setOrders((previousOrders) =>
        previousOrders.filter(
          (order) => order._id !== orderId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order cancel kora jayni."
      );
    } finally {
      setCancelLoading("");
    }
  };

  if (loading) {
    return (
      <p className="p-6">Loading your orders...</p>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">{error}</p>
        <Link
          to="/"
          className="text-blue-600 underline"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        My Orders
      </h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="mb-4 text-gray-600">
            You have no active orders.
          </p>

          <Link
            to="/"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getOrderStatus(order);

            const canCancel =
              (order.shopOrders ?? []).length > 0 &&
              order.shopOrders.every(
                (shopOrder) =>
                  shopOrder.status === "pending"
              );

            return (
              <div
                key={order._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="break-all font-semibold">
                      {order._id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Order Status
                    </p>

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        status.toLowerCase().includes("cancelled")
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="text-xl font-bold text-blue-700">
                      ৳
                      {Number(order.total ?? 0).toLocaleString(
                        "en-BD"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Method
                    </p>

                    <p className="font-medium">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentMethod ?? "N/A"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/order/${order._id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                      View Details
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCancelOrder(order._id)
                        }
                        disabled={
                          cancelLoading === order._id
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancelLoading === order._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyOrders;
