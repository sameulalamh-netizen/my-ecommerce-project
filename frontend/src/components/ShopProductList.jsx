import { useEffect, useState } from "react";
import { getShopProducts, deleteProduct } from "../services/productServices";
import EditProductForm from "../components/EditProductForm";
import { Link } from "react-router-dom";


const ShopProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setError("");

            const data = await getShopProducts();

            setProducts(
                Array.isArray(data)
                    ? data
                    : data.products ?? data.data ?? []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Products load kora jayni."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(productId);
            setError("");

            await deleteProduct(productId);

            setProducts((previous) =>
                previous.filter((product) => product._id !== productId)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product delete kora jayni."
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <p className="p-6">Loading products...</p>;
    }

    return (
        <div className="p-6">
            <h2 className="mb-4 text-xl font-bold">
                My Shop Products
            </h2>

            {error && (
                <p className="mb-4 text-red-600">{error}</p>
            )}
            {editingProduct && (
                <EditProductForm
                    product={editingProduct}
                    onCancel={() => setEditingProduct(null)}
                    onUpdated={() => {
                        setEditingProduct(null);
                        fetchProducts();
                    }}
                />
            )}

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="rounded-lg border p-4 shadow-sm"
                        >
                            {product.image?.url && (
                                <img
                                    src={product.image.url}
                                    alt={product.name}
                                    className="mb-3 h-48 w-full rounded-md object-cover"
                                />
                            )}

                            <h3 className="font-semibold">
                                {product.name}
                            </h3>

                            <p className="mt-2">
                                Price: ৳{product.price}
                            </p>

                            <p>
                                Stock: {product.stock ?? "N/A"}
                            </p>

                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {product.description}
                            </p>
                            <button
                                type="button"

                                className="mt-4 mr-2 rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                            >
                                <Link to={`/edit-product/${product._id}`}>Edit Product</Link>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(product._id)}
                                disabled={deletingId === product._id}
                                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingId === product._id
                                    ? "Deleting..."
                                    : "Delete Product"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopProductList;