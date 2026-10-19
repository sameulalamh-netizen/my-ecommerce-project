
import { useEffect, useState } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/categoryServices";

const emptyForm = {
    name: "",
    description: "",
    image: null,
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [preview, setPreview] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCategories();

            setCategories(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Category load kora jayni."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            const file = files?.[0];

            if (file) {
                setFormData((previous) => ({
                    ...previous,
                    image: file,
                }));

                setPreview(URL.createObjectURL(file));
            }

            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setPreview("");
    };

    const handleEdit = (category) => {
        setEditingId(category._id);

        setFormData({
            name: category.name || "",
            description: category.description || "",
            image: null,
        });

        setPreview(category.image?.url || "");
        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const data = new FormData();

            data.append("name", formData.name.trim());
            data.append(
                "description",
                formData.description.trim()
            );

            if (formData.image) {
                data.append("image", formData.image);
            }

            if (editingId) {
                const response = await updateCategory(
                    editingId,
                    data
                );

                setMessage(
                    response.message ||
                    "Category successfully updated."
                );
            } else {
                if (!formData.image) {
                    setError("Category image select koro.");
                    return;
                }

                const response = await createCategory(data);

                setMessage(
                    response.message ||
                    "Category successfully created."
                );
            }

            resetForm();
            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Category save kora jayni."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `"${category.name}" category delete korte chao?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(category._id);
            setError("");
            setMessage("");

            const response = await deleteCategory(category._id);

            setMessage(
                response.message ||
                "Category successfully deleted."
            );

            if (editingId === category._id) {
                resetForm();
            }

            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Category delete kora jayni."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredCategories = categories.filter((category) => {
        const term = search.toLowerCase();

        return (
            category.name?.toLowerCase().includes(term) ||
            category.description?.toLowerCase().includes(term)
        );
    });

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Category Management
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Create, edit and manage product categories.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Categories
                        </p>
                        <p className="text-2xl font-bold text-indigo-600">
                            {categories.length}
                        </p>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                    >
                        {message}
                    </div>
                )}

                {/* Create / Edit form */}
                <section className="mb-8 rounded-2xl border bg-white p-5 shadow-sm md:p-7">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId
                                    ? "Edit Category"
                                    : "Create New Category"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {editingId
                                    ? "Category information update koro."
                                    : "New category-r information add koro."}
                            </p>
                        </div>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                    >
                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="categoryName"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Category Name *
                                </label>

                                <input
                                    id="categoryName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. Electronics"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="categoryDescription"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="categoryDescription"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className={inputClass}
                                    placeholder="Category description..."
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="categoryImage"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Category Image {!editingId && "*"}
                                </label>

                                <input
                                    id="categoryImage"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    required={!editingId}
                                    className="block w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    {editingId
                                        ? "New image select na korle current image thakbe."
                                        : "Image upload kora required."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                        ? "Update Category"
                                        : "Create Category"}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Image preview */}
                        <div>
                            <p className="mb-2 text-sm font-semibold text-gray-700">
                                Image Preview
                            </p>

                            <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Category preview"
                                        className="max-h-72 w-full rounded-lg object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <div className="mb-2 text-5xl">
                                            🖼️
                                        </div>
                                        <p className="text-sm">
                                            Select an image to preview
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </section>

                {/* Category list */}
                <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-7">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                All Categories
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                View and manage your categories.
                            </p>
                        </div>

                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className={`${inputClass} sm:max-w-xs`}
                        />
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-gray-500">
                            Loading categories...
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="rounded-xl bg-gray-50 py-12 text-center">
                            <p className="text-lg font-semibold text-gray-700">
                                No categories found
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Create a category or try another search.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredCategories.map((category) => (
                                <article
                                    key={category._id}
                                    className="overflow-hidden rounded-xl border border-gray-200 transition hover:shadow-md"
                                >
                                    <div className="flex h-48 items-center justify-center bg-gray-100">
                                        {category.image?.url ? (
                                            <img
                                                src={category.image.url}
                                                alt={category.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">
                                                🗂️
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {category.name}
                                        </h3>

                                        <p className="mt-2 min-h-10 text-sm text-gray-500">
                                            {category.description ||
                                                "No description provided."}
                                        </p>

                                        <p className="mt-3 break-all text-xs text-gray-400">
                                            ID: {category._id}
                                        </p>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(category)}
                                                className="flex-1 rounded-lg bg-amber-100 px-3 py-2 font-semibold text-amber-800 transition hover:bg-amber-200"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(category)}
                                                disabled={deletingId === category._id}
                                                className="flex-1 rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {deletingId === category._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default CategoryManagement;
