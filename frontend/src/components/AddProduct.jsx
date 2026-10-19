
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productServices";
import { getCategories } from "../services/categoryServices";

const AddProductForm = ({ onProductAdded }) => {
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

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();

                const categoryList = Array.isArray(data)
                    ? data
                    : data.categories ?? data.data ?? [];

                setCategories(categoryList);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Categories load kora jayni."
                );
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Update input values
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Submit product form
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!image) {
            setError("Product image select koro.");
            return;
        }

        if (!formData.category) {
            setError("Ekta category select koro.");
            return;
        }

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
            productData.append("image", image);

            const response = await createProduct(productData);

            setSuccess(
                response.message || "Product successfully added!"
            );

            // Reset form fields
            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                category: "",
            });

            setImage(null);
            e.target.reset();

            // Refresh product list if callback exists
            if (onProductAdded) {
                onProductAdded();
            }

            // Show success message, then redirect
            setTimeout(() => {
                navigate("/shop-dashboard");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product add kora jayni."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto mb-8 w-full max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
            <h2 className="text-2xl font-bold text-gray-900">
                Add New Product
            </h2>

            {/* Error Message */}
            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {/* Success Message */}
            {success && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {success}
                    <span className="ml-1">
                        Redirecting to products...
                    </span>
                </p>
            )}

            {/* Product Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Product Name
                </label>

                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter product name"
                />
            </div>

            {/* Description */}
            <div>
                <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-md border p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe your product"
                />
            </div>

            {/* Price */}
            <div>
                <label
                    htmlFor="price"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Price (৳)
                </label>

                <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full rounded-md border p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter price"
                />
            </div>

            {/* Stock */}
            <div>
                <label
                    htmlFor="stock"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Stock Quantity
                </label>

                <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    required
                    className="w-full rounded-md border p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter available quantity"
                />
            </div>

            {/* Category */}
            <div>
                <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Category
                </label>

                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={loadingCategories}
                    className="w-full rounded-md border bg-white p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                    <option value="">
                        {loadingCategories
                            ? "Loading categories..."
                            : "Select a category"}
                    </option>

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category._id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>

                {!loadingCategories && categories.length === 0 && (
                    <p className="mt-1 text-sm text-amber-700">
                        Kono category paoa jayni. Backend category API
                        ebong database check koro.
                    </p>
                )}
            </div>

            {/* Product Image */}
            <div>
                <label
                    htmlFor="image"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Product Image (Required)
                </label>

                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                        setImage(e.target.files?.[0] || null);
                    }}
                    className="w-full rounded-md border p-3"
                />

                {image && (
                    <p className="mt-2 text-sm text-gray-600">
                        Selected: {image.name}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || loadingCategories || !!success}
                className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
                {loading
                    ? "Adding Product..."
                    : success
                        ? "Product Added!"
                        : "Add Product"}
            </button>
            <button
                type="button"
                onClick={() => navigate("/shop-dashboard")}
                className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 mx-4 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
                Cancel
            </button>
        </form>
    );
};

export default AddProductForm;
