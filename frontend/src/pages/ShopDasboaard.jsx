import { useState } from "react";
import { Link } from "react-router-dom";
import ShopProductList from "../components/ShopProductList";


const ShopDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleProductAdded = () => {
        setRefreshKey((previous) => previous + 1);
    };

    return (
        <div>
            <div className="bg-gray-100 p-4 flex items-center justify-between fixed top-15 left-0 right-0 w-full z-50">
                <Link
                    to="/add-product"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-2.5 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
                >
                    <span className="">+</span>
                    <span>Add Product</span>
                </Link>

                <Link
                    to="/shop-orders"
                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2 py-2.5 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-green-700"
                >
                    <span>View Orders</span>
                </Link>
            </div>

            <div className="p-4 mt-10">

                <ShopProductList key={refreshKey} />
            </div>
        </div>
    );
};

export default ShopDashboard;