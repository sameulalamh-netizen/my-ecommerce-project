
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getOrderById,
  cancelOrder,
} from "../services/orderServices";

import OrderStatusTimeline from "../components/OrderStatusTimeline";

const OrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderById(orderId);

      const orderData =
        response.data?.order ??
        response.data ??
        response.order ??
        response;

      setOrder(orderData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order details load kora jayni."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Cancel order
  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(true);
      setError("");
      setCancelMessage("");

      const response = await cancelOrder(orderId);

      const updatedOrder =
        response.data?.order ??
        response.data ??
        response.order;

      if (updatedOrder?._id) {
        setOrder(updatedOrder);
      } else {
        await fetchOrder();
      }

      setCancelMessage(
        response.message || "Order cancelled successfully!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order cancel kora jayni."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="p-6">Loading order details...</p>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">{error}</p>

        <Link
          to="/my-orders"
          className="text-blue-600 underline"
        >
          Go to My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <p className="p-6">Order not found.</p>
    );
  }

  const shipping = order.shippingAddress ?? {};
  const shopOrders = order.shopOrders ?? [];

  const items = shopOrders.flatMap((shopOrder) =>
    (shopOrder.items ?? []).map((item) => ({
      ...item,
      shopName: shopOrder.shop?.name,
    }))
  );

  // Cancel only when every shop order is pending
  const canCancel =
    shopOrders.length > 0 &&
    shopOrders.every(
      (shopOrder) => shopOrder.status === "pending"
    );

  const isCancelled =
    shopOrders.length > 0 &&
    shopOrders.every(
      (shopOrder) => shopOrder.status === "cancelled"
    );

  const orderStatus = isCancelled
    ? "Cancelled"
    : shopOrders.length > 0
      ? [
          ...new Set(
            shopOrders.map((shopOrder) => shopOrder.status)
          ),
        ].join(", ")
      : "Pending";

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Track Your Order
        </h1>

        <p className="mt-2 break-all text-sm text-gray-500">
          Order ID: {order._id ?? orderId}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Order date:{" "}
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "Not available"}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
          {error}
        </p>
      )}

      {/* Cancellation success message */}
      {cancelMessage && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          {cancelMessage}
        </p>
      )}

      {/* Overall order information */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Order Information
        </h2>

        <p>
          <strong>Overall Status:</strong>{" "}
          <span
            className={`font-semibold ${
              isCancelled
                ? "text-red-600"
                : "text-blue-700"
            }`}
          >
            {orderStatus}
          </span>
        </p>

        <p className="mt-3">
          <strong>Payment Method:</strong>{" "}
          {order.paymentMethod === "cod"
            ? "Cash on Delivery"
            : order.paymentMethod ?? "N/A"}
        </p>

        <p className="mt-3">
          <strong>Payment Status:</strong>{" "}
          {order.paymentStatus ?? "Not specified"}
        </p>

        <p className="mt-3">
          <strong>Total Amount:</strong>{" "}
          <span className="font-bold text-blue-700">
            ৳
            {Number(order.total ?? 0).toLocaleString("en-BD")}
          </span>
        </p>

        {canCancel && (
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLoading
              ? "Cancelling..."
              : "Cancel Order"}
          </button>
        )}

        {isCancelled && (
          <p className="mt-4 font-medium text-red-600">
            This order has been cancelled.
          </p>
        )}
      </section>

      {/* Shipping address */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">
          Shipping Address
        </h2>

        <p>{shipping.name}</p>
        <p>{shipping.phone}</p>
        <p>{shipping.address}</p>
        <p>{shipping.city}</p>
      </section>

      {/* Customer order tracking: separate timeline per shop */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">
          Order Tracking
        </h2>

        {shopOrders.length === 0 ? (
          <p className="text-gray-500">
            Order tracking information is not available.
          </p>
        ) : (
          <div className="space-y-5">
            {shopOrders.map((shopOrder, index) => (
              <div
                key={
                  shopOrder._id ||
                  shopOrder.shop?._id ||
                  index
                }
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-semibold">
                  {shopOrder.shop?.name ||
                    `Shop ${index + 1}`}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Shop order status
                </p>

                <OrderStatusTimeline
                  status={shopOrder.status}
                />

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">
                    Shop subtotal
                  </p>

                  <p className="font-semibold">
                    ৳
                    {Number(
                      shopOrder.subtotal ?? 0
                    ).toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ordered products */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Ordered Products
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-500">
            Product details pawa jayni.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={
                  item._id ??
                  item.product?._id ??
                  index
                }
                className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0"
              >
                <div>
                  <h3 className="font-semibold">
                    {item.name ??
                      item.product?.name ??
                      "Product"}
                  </h3>

                  {item.shopName && (
                    <p className="text-sm text-gray-500">
                      Shop: {item.shopName}
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    ৳
                    {Number(
                      item.price ?? 0
                    ).toLocaleString("en-BD")}
                    {" × "}
                    {item.quantity ?? 0}
                  </p>
                </div>

                <p className="font-bold">
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
        )}
      </section>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/my-orders"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          View My Orders
        </Link>

        <Link
          to="/"
          className="rounded-lg border px-5 py-3 font-semibold hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
};

export default OrderDetails;
