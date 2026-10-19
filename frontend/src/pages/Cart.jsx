import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../services/cartServices";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Cart backend theke load korbe
  const refreshCart = async () => {
    const response = await getCart();

    // API response: { success, message, data: { items, total } }
    setCart(response.cart ?? response.data ?? response);
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setError("");
        await refreshCart();
      } catch (err) {
        setError(
          err.response?.data?.message || "Cart load kora jayni."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Cart-er items ber kora
  const items = Array.isArray(cart)
    ? cart
    : cart?.items ?? cart?.products ?? [];

  // Backend-er total use korbo; na thakle items theke calculate korbo
  const totalAmount =
    cart?.total ??
    items.reduce((total, item) => {
      const product = item.product ?? item;
      const quantity = item.quantity ?? 1;

      return total + Number(product.price ?? 0) * quantity;
    }, 0);

  // Quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1 || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await updateCartQuantity(productId, newQuantity);
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Quantity update kora jayni."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cart theke ekta product remove
  const handleRemove = async (productId) => {
    const confirmed = window.confirm(
      "Do you want to remove this product from the cart?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await removeFromCart(productId);
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Product remove kora jayni."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Puro cart clear
  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Do you want to clear the entire cart?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await clearCart();
      await refreshCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Cart clear kora jayni."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading cart...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Cart</h1>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={actionLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "Please wait..." : "Clear Cart"}
          </button>
        )}
      </div>

      {/* Empty cart */}
      {items.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="mb-4">Your cart is empty.</p>

          <Link
            to="/"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart products */}
          {items.map((item) => {
            const product = item.product ?? item;
            const quantity = item.quantity ?? 1;
            const productId = product._id;

            return (
              <div
                key={productId}
                className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
              >
                {product.image?.url && (
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{product.name}</h2>

                  <p className="mt-1 text-gray-600">
                    Price: ৳
                    {Number(product.price).toLocaleString("en-BD")}
                  </p>

                  {/* Quantity controls */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(productId, quantity - 1)
                      }
                      disabled={quantity <= 1 || actionLoading}
                      className="h-8 w-8 rounded border border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="min-w-6 text-center font-semibold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(productId, quantity + 1)
                      }
                      disabled={actionLoading}
                      className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Product subtotal */}
                <div className="text-right">
                  <p className="font-bold">
                    ৳
                    {(
                      Number(product.price ?? 0) * quantity
                    ).toLocaleString("en-BD")}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    disabled={actionLoading}
                    className="mt-3 rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* Cart total and checkout */}
          <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Total Amount</h2>

              <p className="text-2xl font-bold text-blue-700">
                ৳{Number(totalAmount).toLocaleString("en-BD")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              disabled={actionLoading}
              className="mt-4 w-full rounded-md bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;