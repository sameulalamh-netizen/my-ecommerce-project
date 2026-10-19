
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllProducts } from "../services/productServices";

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wrapperRef = useRef(null);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || ""
  );

  // Search button press korle true hobe
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(
    Boolean(searchParams.get("search"))
  );

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // URL change hole search, sort sync kora
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlSort = searchParams.get("sort") || "";

    setSearch(urlSearch);
    setSort(urlSort);
    setIsSearchSubmitted(Boolean(urlSearch));
  }, [searchParams]);

  // Live product suggestions
  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await getAllProducts({
          search: search.trim(),
          limit: 100,
        });

        const allProducts = data.products ?? data.data ?? [];

        if (active) {
          setSuggestions(allProducts.slice(0, 6));
        }
      } catch (error) {
        if (active) {
          setSuggestions([]);
          console.error("Product search failed:", error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  // Search bar er baire click korle suggestions bondho
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Search button click
  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    setShowSuggestions(false);

    if (!value) {
      // Empty search hole home page
      setSearch("");
      setSort("");
      setIsSearchSubmitted(false);
      navigate("/", { replace: true });
      return;
    }

    setIsSearchSubmitted(true);

    const params = new URLSearchParams();
    params.set("search", value);

    if (sort) {
      params.set("sort", sort);
    }

    navigate(`/?${params.toString()}`);
  };

  // Search clear hole sathe sathe home page
  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    if (!value.trim()) {
      setSort("");
      setIsSearchSubmitted(false);
      setShowSuggestions(false);
      navigate("/", { replace: true });
    } else {
      setShowSuggestions(true);
    }
  };

  // Sort change
  const handleSort = (event) => {
    const value = event.target.value;
    setSort(value);

    const params = new URLSearchParams();
    const valueToSearch = search.trim();

    if (valueToSearch) {
      params.set("search", valueToSearch);
    }

    if (value && valueToSearch) {
      params.set("sort", value);
    }

    navigate(`/?${params.toString()}`);
  };

  // Suggestion click
  const handleProductClick = (product) => {
    setShowSuggestions(false);
    navigate(`/products/${product._id}`);
  };

  const formatPrice = (price) =>
    `৳${Number(price || 0).toLocaleString("en-BD")}`;

  return (
    <div
      ref={wrapperRef}
      className="sticky top-0 z-40 bg-white shadow-sm border-b"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="relative">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => {
                if (search.trim()) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search products..."
              className="w-full min-w-0 border  rounded-l-md px-4 py-2 outline-none "
            />

            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-r-md"
            >
              Search
            </button>
          </form>

          {/* Live suggestions */}
          {showSuggestions && search.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-gray-500">
                  Searching products...
                </p>
              ) : suggestions.length > 0 ? (
                suggestions.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-3 w-full p-3 text-left hover:bg-orange-50 border-b last:border-b-0"
                  >
                    <img
                      src={
                        product.image?.url ||
                        product.imageUrl ||
                        product.image ||
                        "https://placehold.co/60x60?text=Product"
                      }
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {product.name}
                      </p>

                      <p className="text-sm font-semibold text-orange-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  No products found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Search button press korar por sort show korbe */}
        {isSearchSubmitted && search.trim() && (
          <div className="mt-3 flex items-center gap-3">
            <label
              htmlFor="product-price-sort"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Sort by price:
            </label>

            <select
              id="product-price-sort"
              value={sort}
              onChange={handleSort}
              className="border rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Default</option>
              <option value="price_asc">
                Price: Low to High
              </option>
              <option value="price_desc">
                Price: High to Low
              </option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
