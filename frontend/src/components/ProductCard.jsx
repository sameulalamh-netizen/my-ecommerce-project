
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { addToCart } from "../services/cartServices";
import { useAuth } from "../context/authContext";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const outOfStock = (product.stock ?? 0) <= 0;

    // Customer and Guest can see the button
    const canSeeAddToCart =
        !user || user.role === "customer";

    const handleAddToCart = async () => {
        if (loading) return;

        // Guest click korle login page e jabe
        if (!user) {
            navigate("/login");
            return;
        }

        // Only customer can add to cart
        if (user.role !== "customer") {
            return;
        }

        if (outOfStock) return;

        try {
            setAdding(true);
            setError("");

            await addToCart(product._id, 1);

            window.alert("Product added to cart successfully!");
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Cart-e add kora jayni."
            );
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md">

            {/* Product Image */}
            <Link
                to={`/products/${product._id}`}
                className="block"
            >
                {product.image?.url ? (
                    <img
                        src={product.image.url}
                        alt={product.name}
                        className="h-44 w-full object-cover sm:h-48"
                    />
                ) : (
                    <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-500 sm:h-48">
                        No image available
                    </div>
                )}
            </Link>

            <div className="p-3">

                {/* Product Name */}
                <Link to={`/products/${product._id}`}>
                    <h2 className="line-clamp-1 text-base font-semibold leading-5 hover:text-blue-600">
                        {product.name}
                    </h2>
                </Link>

                {/* Product Price */}
                <p className="mt-1 text-lg font-bold leading-6 text-blue-700">
                    ৳{product.price}
                </p>

                {/* Stock and Sold */}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs leading-4">
                    <p className="font-medium text-green-600">
                        Stock: {product.stock ?? 0}
                    </p>

                    <p className="font-medium text-blue-600">
                        Sold: {product.sold ?? 0}
                    </p>
                </div>

                {/* Short Description */}
                <p className="mt-1 line-clamp-2 min-h-9 text-sm leading-4.5 text-gray-600">
                    {product.description ||
                        "No description available."}
                </p>

                {/* Add to Cart: Guest + Customer */}
                {!loading && canSeeAddToCart && (
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={adding || outOfStock}
                            className="w-full rounded-md bg-blue-600 px-2 py-2 text-xs text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                        >
                            {adding
                                ? "Adding..."
                                : outOfStock
                                    ? "Out of Stock"
                                    : "Add to Cart"}
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <p className="mt-2 text-xs text-red-600">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
