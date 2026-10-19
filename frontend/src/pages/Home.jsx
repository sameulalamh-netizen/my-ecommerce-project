
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllProducts } from "../services/productServices";
import { getCategories } from "../services/categoryServices";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBer";

const Home = () => {
    const [searchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "";

    // Load categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getCategories();

                const list = Array.isArray(result)
                    ? result
                    : result?.categories ?? result?.data ?? [];

                setCategories(Array.isArray(list) ? list : []);
            } catch (err) {
                setCategoryError(
                    err.response?.data?.message ||
                    "Categories load kora jayni."
                );
            }
        };

        fetchCategories();
    }, []);

    // URL search, sorting ebong category onujayi products load
    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const params = { limit: 100 };

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (sort) {
                    params.sort = sort;
                }

                if (selectedCategory !== "all") {
                    params.category = selectedCategory;
                }

                const result = await getAllProducts(params);

                const list = Array.isArray(result)
                    ? result
                    : result?.products ?? result?.data ?? [];

                if (!cancelled) {
                    setProducts(Array.isArray(list) ? list : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Products load kora jayni."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [search, sort, selectedCategory]);

    // Shudhu product ache emon category
    const filteredCategories = useMemo(() => {
        return categories.filter((category) =>
            products.some((product) => {
                const productCategoryId =
                    product.category?._id ??
                    product.category?.id ??
                    product.category;

                return (
                    String(productCategoryId) ===
                    String(category._id)
                );
            })
        );
    }, [categories, products]);

    const selectedCategoryName = categories.find(
        (category) =>
            String(category._id) === String(selectedCategory)
    )?.name;

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
              <div className="mt-15 fixed top-0 left-0 right-0 w-full ">
                <SearchBar />
            </div>

            {/* Welcome banner - ager moto */}
            <section className="mb-5 mt-20 rounded-xl bg-gray-100 p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome to Our Store
                </h1>

                <p className="mt-3 text-gray-600">
                    Discover products from our marketplace.
                </p>
            </section>

            {/* Category names only */}
            <section className="mb-10">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Shop by Category
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Choose a category to explore its products.
                    </p>
                </div>

                {categoryError && (
                    <p className="mb-3 text-sm text-amber-700">
                        {categoryError}
                    </p>
                )}

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                            selectedCategory === "all"
                                ? "bg-indigo-600 text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
                        }`}
                    >
                        All Categories
                    </button>

                    {filteredCategories.map((category) => (
                        <button
                            key={category._id}
                            type="button"
                            onClick={() =>
                                setSelectedCategory(category._id)
                            }
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                                String(selectedCategory) ===
                                String(category._id)
                                    ? "bg-indigo-600 text-white"
                                    : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Products section */}
            <section>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCategory === "all"
                                ? search
                                    ? `Search Results: ${search}`
                                    : "All Products"
                                : `${selectedCategoryName || "Category"} Products`}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {loading
                                ? "Loading products..."
                                : `${products.length} product(s) found`}
                        </p>
                    </div>

                    {selectedCategory !== "all" && (
                        <button
                            type="button"
                            onClick={() => setSelectedCategory("all")}
                            className="rounded-lg border border-indigo-200 px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50"
                        >
                            Show All Products
                        </button>
                    )}
                </div>

                {error ? (
                    <p className="rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                ) : loading ? (
                    <p className="py-8 text-gray-600">
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <p className="text-lg font-semibold text-gray-700">
                            No products found.
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Try another search or category.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Home;
