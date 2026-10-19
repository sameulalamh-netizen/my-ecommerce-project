
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getProductById,
    getAllProducts,
} from "../services/productServices";
import { addToCart } from "../services/cartServices";
import { useAuth } from "../context/authContext";

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    // Fetch product details
    useEffect(() => {
        let active = true;

        const fetchProduct = async () => {
            setLoading(true);
            setError("");
            setProduct(null);
            setQuantity(1);
            setCartMessage("");
            setCartError("");
            setSuggestions([]);

            try {
                const data = await getProductById(productId);

                const result =
                    data.product ??
                    data.data?.product ??
                    data.data ??
                    data;

                if (active) {
                    setProduct(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Product load kora jayni."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            active = false;
        };
    }, [productId]);

    // Fetch products from the same category
    useEffect(() => {
        let active = true;

        const fetchSuggestions = async () => {
            const category = product?.category;

            const categoryId =
                typeof category === "object"
                    ? category?._id
                    : category;

            if (!product || !categoryId) {
                setSuggestions([]);
                return;
            }

            setSuggestionsLoading(true);

            try {
                const response = await getAllProducts({
                    category: categoryId,
                    limit: 100,
                });

                const allProducts =
                    response.products ??
                    response.data?.products ??
                    response.data ??
                    [];

                // Only same-category products, excluding current product
                const sameCategoryProducts = allProducts.filter((item) => {
                    const itemCategoryId =
                        typeof item.category === "object"
                            ? item.category?._id
                            : item.category;

                    return (
                        String(item._id) !== String(product._id) &&
                        String(itemCategoryId) === String(categoryId)
                    );
                });

                if (active) {
                    setSuggestions(sameCategoryProducts.slice(0, 8));
                }
            } catch (err) {
                if (active) {
                    setSuggestions([]);
                    console.error(
                        "Suggested products load failed:",
                        err
                    );
                }
            } finally {
                if (active) {
                    setSuggestionsLoading(false);
                }
            }
        };

        fetchSuggestions();

        return () => {
            active = false;
        };
    }, [product]);

    // Add product to cart
    const handleAddToCart = async () => {
        if (authLoading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "customer") {
            return;
        }

        if (!product || Number(product.stock) <= 0) {
            setCartError("Product is out of stock.");
            return;
        }

        if (
            !quantity ||
            Number(quantity) < 1 ||
            Number(quantity) > Number(product.stock)
        ) {
            setCartError("Please select a valid quantity.");
            return;
        }

        setAdding(true);
        setCartMessage("");
        setCartError("");

        try {
            await addToCart(product._id, Number(quantity));

            setCartMessage("Product added to cart successfully!");
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setCartError(
                err.response?.data?.message ||
                "Product cart-e add kora jayni."
            );
        } finally {
            setAdding(false);
        }
    };

    if (loading || authLoading) {
        return <p className="p-6">Loading product...</p>;
    }

    if (error || !product) {
        return (
            <div className="p-6">
                <p className="text-red-600">
                    {error || "Product not found."}
                </p>

                <Link
                    to="/"
                    className="mt-4 inline-block text-blue-600 underline"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    const outOfStock = Number(product.stock) <= 0;

    const categoryName =
        typeof product.category === "object"
            ? product.category?.name ?? "Uncategorized"
            : "Category details unavailable";

    const formatPrice = (price) =>
        `৳${Number(price || 0).toLocaleString("en-BD")}`;

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
            <Link
                to="/"
                className="mb-6 inline-block text-blue-600 hover:underline"
            >
                ← Back to Products
            </Link>

            {/* Product Details */}
            <div className="grid gap-8 md:grid-cols-2">

                {/* Product Image */}
                <div>
                    {product.image?.url ? (
                        <img
                            src={product.image.url}
                            alt={product.name}
                            className="h-72 w-full rounded-xl bg-gray-50 object-contain sm:h-96"
                        />
                    ) : (
                        <div className="flex h-72 items-center justify-center rounded-xl bg-gray-100 sm:h-96">
                            No image available
                        </div>
                    )}
                </div>

                {/* Product Information */}
                <div className="flex flex-col items-start">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    <p className="mt-4 text-2xl font-semibold text-blue-700">
                        {formatPrice(product.price)}
                    </p>

                    <p className="mt-4 whitespace-pre-line leading-7 text-gray-700">
                        {product.description ||
                            "No description available."}
                    </p>

                    <p className="mt-4 text-sm text-gray-600">
                        Category: {categoryName}
                    </p>

                    <p className="mt-2 text-sm">
                        Stock:{" "}
                        <span
                            className={
                                outOfStock
                                    ? "font-semibold text-red-600"
                                    : "font-semibold text-green-600"
                            }
                        >
                            {product.stock ?? "N/A"}
                        </span>
                    </p>

                    {/* Quantity Selector */}
                    <div className="mt-6">
                        <label
                            htmlFor="quantity"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Quantity
                        </label>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.max(1, Number(q || 1) - 1)
                                    )
                                }
                                disabled={
                                    Number(quantity) <= 1 || outOfStock
                                }
                                className="h-10 w-10 rounded-md border text-lg disabled:opacity-40"
                            >
                                −
                            </button>

                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max={product.stock}
                                step="1"
                                value={quantity}
                                disabled={outOfStock}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === "") {
                                        setQuantity("");
                                        return;
                                    }

                                    setQuantity(
                                        Math.max(
                                            1,
                                            Math.min(
                                                Number(value),
                                                Number(product.stock)
                                            )
                                        )
                                    );
                                }}
                                onBlur={() => {
                                    if (
                                        !quantity ||
                                        Number(quantity) < 1
                                    ) {
                                        setQuantity(1);
                                    }
                                }}
                                className="h-10 w-20 rounded-md border text-center outline-none focus:border-blue-500"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.min(
                                            Number(product.stock),
                                            Number(q || 0) + 1
                                        )
                                    )
                                }
                                disabled={
                                    outOfStock ||
                                    Number(quantity) >=
                                        Number(product.stock)
                                }
                                className="h-10 w-10 rounded-md border text-lg disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    <p className="mt-4 font-medium text-gray-800">
                        Total:{" "}
                        {formatPrice(
                            Number(product.price) *
                                Number(quantity || 0)
                        )}
                    </p>

                    {/* Cart Feedback */}
                    {cartMessage && (
                        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                            {cartMessage}
                        </p>
                    )}

                    {cartError && (
                        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {cartError}
                        </p>
                    )}

                    {/* Add to Cart: Customer and Guest */}
                    {(!user || user.role === "customer") && (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={
                                adding ||
                                outOfStock ||
                                !quantity ||
                                authLoading
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                        >
                            {adding ? (
                                "Adding to Cart..."
                            ) : outOfStock ? (
                                "Out of Stock"
                            ) : (
                                <>
                                    <span>🛒</span>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    )}

                    {!user && (
                        <p className="mt-2 text-sm text-gray-500">
                            Please login to add products to your cart.
                        </p>
                    )}
                </div>
            </div>

            {/* Suggested Products - Same Category */}
            <section className="mt-12 border-t pt-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        Suggested Products
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        More products from {categoryName}
                    </p>
                </div>

                {suggestionsLoading ? (
                    <p className="py-6 text-sm text-gray-500">
                        Loading suggested products...
                    </p>
                ) : suggestions.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {suggestions.map((item) => (
                            <div
                                key={item._id}
                                className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                            >
                                <Link
                                    to={`/products/${item._id}`}
                                    className="block"
                                >
                                    {item.image?.url ? (
                                        <img
                                            src={item.image.url}
                                            alt={item.name}
                                            loading="lazy"
                                            className="h-36 w-full bg-gray-50 object-cover sm:h-44"
                                        />
                                    ) : (
                                        <div className="flex h-36 items-center justify-center bg-gray-100 text-xs text-gray-500 sm:h-44">
                                            No image available
                                        </div>
                                    )}
                                </Link>

                                <div className="p-3">
                                    <Link to={`/products/${item._id}`}>
                                        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-800 hover:text-blue-600">
                                            {item.name}
                                        </h3>
                                    </Link>

                                    <p className="mt-2 font-bold text-blue-700">
                                        {formatPrice(item.price)}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Stock: {item.stock ?? 0}
                                    </p>

                                    <Link
                                        to={`/products/${item._id}`}
                                        className="mt-3 block rounded-md bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-blue-600 hover:text-white"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                        No other products found in this category.
                    </p>
                )}
            </section>
        </div>
    );
};

export default ProductDetails;
