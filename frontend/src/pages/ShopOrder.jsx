
import { useCallback, useEffect, useState } from "react";
import {
  getShopOrders,
  updateShopOrderStatus,
} from "../services/orderServices";

const STATUS_OPTIONS = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const formatStatus = (status = "pending") =>
  status.charAt(0).toUpperCase() + status.slice(1);

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");

      const response = await getShopOrders();

      // Controller response: { success, data: shopOrders }
      const shopOrders = response.data ?? [];

      setOrders(Array.isArray(shopOrders) ? shopOrders : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Shop orders load kora jayni."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setMessage("");

      // Backend expects { orderStatus }
      await updateShopOrderStatus(orderId, orderStatus);

      // UI-te status immediately update
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, status: orderStatus }
            : order
        )
      );

      setMessage("Order status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Order status update kora jayni."
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading shop orders...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Shop Orders
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-gray-600">
            Your shop-e ekhono kono order nei.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, index) => {
            const currentStatus = order.status ?? "pending";
            const isUpdating = updatingId === order.orderId;

            return (
              <section
                key={`${order.orderId}-${index}`}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="break-all font-semibold">
                      {order.orderId}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Order Date
                    </p>

                    <p>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {formatStatus(currentStatus)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div>
                    <h2 className="mb-2 font-semibold">
                      Customer Information
                    </h2>

                    <p>
                      Name:{" "}
                      {order.customer?.name ??
                        order.shippingAddress?.name ??
                        "N/A"}
                    </p>

                    <p>
                      Email: {order.customer?.email ?? "N/A"}
                    </p>

                    <p>
                      Phone: {order.shippingAddress?.phone ?? "N/A"}
                    </p>
                  </div>

                  <div>
                    <h2 className="mb-2 font-semibold">
                      Shipping Address
                    </h2>

                    <p>{order.shippingAddress?.address ?? "N/A"}</p>
                    <p>{order.shippingAddress?.city ?? "N/A"}</p>

                    <p className="mt-2">
                      Payment:{" "}
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentMethod ?? "N/A"}
                    </p>

                    <p>
                      Payment Status:{" "}
                      {order.paymentStatus ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4">
                  <h2 className="mb-3 font-semibold">
                    Ordered Products
                  </h2>

                  <div className="space-y-3">
                    {(order.items ?? []).map((item, itemIndex) => (
                      <div
                        key={item._id ?? itemIndex}
                        className="flex flex-wrap justify-between gap-3 rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name ??
                              item.product?.name ??
                              "Product"}
                          </p>

                          <p className="text-sm text-gray-600">
                            ৳
                            {Number(item.price ?? 0).toLocaleString("en-BD")}
                            {" × "}
                            {item.quantity ?? 0}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ৳
                          {Number(
                            item.amount ??
                            Number(item.price ?? 0) *
                            Number(item.quantity ?? 0)
                          ).toLocaleString("en-BD")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Shop Subtotal
                      </p>

                      <p className="text-xl font-bold text-blue-700">
                        ৳
                        {Number(
                          order.subtotal ?? 0
                        ).toLocaleString("en-BD")}
                      </p>
                    </div>

                    <div className="w-full sm:w-auto">
                      <label
                        htmlFor={`status-${order.orderId}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Update Order Status
                      </label>

                      <select
                        id={`status-${order.orderId}`}
                        value={currentStatus}
                        disabled={isUpdating}
                        onChange={(event) =>
                          handleStatusChange(
                            order.orderId,
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 sm:min-w-52"
                      >
                        <option value={currentStatus}>
                          {formatStatus(currentStatus)}
                        </option>

                        {STATUS_OPTIONS.filter(
                          (status) => status !== currentStatus
                        ).map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>

                      {isUpdating && (
                        <p className="mt-2 text-sm text-gray-500">
                          Updating status...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default ShopOrders;
