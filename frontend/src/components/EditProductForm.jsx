
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getProductById,
    updateProduct,
} from "../services/productServices";
import { getCategories } from "../services/categoryServices";

const EditProductForm = ({ onUpdated, onCancel }) => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
    });

    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load existing product and categories
    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            try {
                setLoadingProduct(true);
                setError("");

                const [productResponse, categoryResponse] =
                    await Promise.all([
                        getProductById(productId),
                        getCategories(),
                    ]);

                if (!active) return;

                // Handle common API response formats
                const product =
                    productResponse.product ??
                    productResponse.data?.product ??
                    productResponse.data ??
                    productResponse;

                const categoryList = Array.isArray(categoryResponse)
                    ? categoryResponse
                    : categoryResponse.categories ??
                      categoryResponse.data?.categories ??
                      categoryResponse.data ??
                      [];

                if (!product?._id) {
                    throw new Error("Product data paoa jayni.");
                }

                setFormData({
                    name: product.name ?? "",
                    description: product.description ?? "",
                    price: product.price ?? "",
                    stock: product.stock ?? "",
                    category:
                        typeof product.category === "object"
                            ? product.category?._id ?? ""
                            : product.category ?? "",
                });

                setCategories(
                    Array.isArray(categoryList) ? categoryList : []
                );
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Product load kora jayni."
                    );
                }
            } finally {
                if (active) setLoadingProduct(false);
            }
        };

        if (productId) {
            fetchData();
        } else {
            setError("Product ID paoa jayni.");
            setLoadingProduct(false);
        }

        return () => {
            active = false;
        };
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const productData = new FormData();

            productData.append("name", formData.name.trim());
            productData.append(
                "description",
                formData.description.trim()
            );
            productData.append("price", formData.price);
            productData.append("stock", formData.stock);
            productData.append("category", formData.category);

            if (image) {
                productData.append("image", image);
            }

            const response = await updateProduct(
                productId,
                productData
            );

            setSuccess(
                response.message || "Product updated successfully!"
            );

            if (onUpdated) {
                onUpdated(response.product ?? response.data?.product);
            }

            // Show success message before redirecting
            setTimeout(() => {
                navigate("/products");
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product update kora jayni."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct) {
        return (
            <p className="p-6 text-center text-gray-600">
                Loading product details...
            </p>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto mb-8 w-full max-w-2xl space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
            <h2 className="text-2xl font-bold text-gray-900">
                Edit Product
            </h2>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {success && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {success} Redirecting to products...
                </p>
            )}

            <div>
                <label htmlFor="edit-name" className="mb-1 block">
                    Product Name
                </label>
                <input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border p-3"
                />
            </div>

            <div>
                <label
                    htmlFor="edit-description"
                    className="mb-1 block"
                >
                    Description
                </label>
                <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-md border p-3"
                />
            </div>

            <div>
                <label htmlFor="edit-price" className="mb-1 block">
                    Price (৳)
                </label>
                <input
                    id="edit-price"
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border p-3"
                />
            </div>

            <div>
                <label htmlFor="edit-stock" className="mb-1 block">
                    Stock Quantity
                </label>
                <input
                    id="edit-stock"
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border p-3"
                />
            </div>

            <div>
                <label
                    htmlFor="edit-category"
                    className="mb-1 block"
                >
                    Category
                </label>
                <select
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border bg-white p-3"
                >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category._id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="edit-image" className="mb-1 block">
                    Replace Image (optional)
                </label>
                <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImage(e.target.files?.[0] ?? null)
                    }
                    className="w-full rounded-md border p-3"
                />
                {image && (
                    <p className="mt-2 text-sm text-gray-600">
                        Selected: {image.name}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : success
                          ? "Updated!"
                          : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onCancel
                            ? onCancel()
                            : navigate("/shop-dashboard")
                    }
                    className="rounded-md border px-5 py-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditProductForm;
