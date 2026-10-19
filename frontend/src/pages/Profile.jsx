
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "",
  postalCode: "",
};

const Profile = () => {
  const { user, logout } = useAuth();

  const role = user?.role;
  const isCustomer = role === "customer";
  const isShopAdmin = role === "shop_admin";
  const isSuperAdmin = role === "super_admin";

  const [address, setAddress] = useState({
    ...EMPTY_ADDRESS,
    fullName: user?.name || "",
  });

  const [isEditing, setIsEditing] = useState(true);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Customer-er saved shipping address load kora
  useEffect(() => {
    if (!isCustomer) return;

    try {
      const savedAddress = localStorage.getItem("shippingAddress");

      if (savedAddress) {
        const parsedAddress = JSON.parse(savedAddress);

        setAddress({
          ...EMPTY_ADDRESS,
          ...parsedAddress,
        });

        setHasSavedAddress(true);
        setIsEditing(false);
      }
    } catch {
      setMessage("Saved address load kora jayni.");
      setMessageType("error");
    }
  }, [isCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  // Shipping address save kora
  const handleSaveAddress = (e) => {
    e.preventDefault();

    try {
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify(address)
      );

      setHasSavedAddress(true);
      setIsEditing(false);
      setMessage("Shipping address successfully saved!");
      setMessageType("success");
    } catch {
      setMessage("Address save kora jayni. Abar try koro.");
      setMessageType("error");
    }
  };

  // Edit cancel korle ager saved address restore kora
  const handleCancelEdit = () => {
    try {
      const savedAddress = localStorage.getItem("shippingAddress");

      if (savedAddress) {
        setAddress({
          ...EMPTY_ADDRESS,
          ...JSON.parse(savedAddress),
        });

        setHasSavedAddress(true);
        setIsEditing(false);
      } else {
        setAddress({
          ...EMPTY_ADDRESS,
          fullName: user?.name || "",
        });

        setIsEditing(true);
      }

      setMessage("");
    } catch {
      setMessage("Saved address load kora jayni.");
      setMessageType("error");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600";

  const cardClass =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md";

  const actionLinkClass =
    "mt-4 inline-block font-semibold text-indigo-600";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account information and settings.
          </p>
        </div>

        {/* Profile information - all roles */}
        <section className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name || "User"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {user?.email || "Email not available"}
              </p>

              <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                {(role || "customer").replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </section>

        {/* Role-based quick actions */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Customer options */}
          {isCustomer && (
            <>
              <Link to="/apply-seller" className={cardClass}>
                <div className="mb-3 text-2xl">🏪</div>

                <h2 className="font-bold text-gray-900">
                  Apply for Seller
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Apply to open your own shop and start selling.
                </p>

                <span className={actionLinkClass}>
                  Apply now →
                </span>
              </Link>

              <Link to="/my-orders" className={cardClass}>
                <div className="mb-3 text-2xl">📦</div>

                <h2 className="font-bold text-gray-900">
                  My Orders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View your orders and track deliveries.
                </p>

                <span className={actionLinkClass}>
                  View orders →
                </span>
              </Link>
            </>
          )}

          {/* Shop Admin options */}
          {isShopAdmin && (
            <Link to="/shop-dashboard" className={cardClass}>
              <div className="mb-3 text-2xl">🏬</div>

              <h2 className="font-bold text-gray-900">
                Manage Shop
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your shop and products.
              </p>

              <span className={actionLinkClass}>
                Open dashboard →
              </span>
            </Link>
          )}

          {/* Super Admin options */}
          {isSuperAdmin && (
            <>
              <Link
                to="/super-admin/seller-applications"
                className={cardClass}
              >
                <div className="mb-3 text-2xl">👥</div>

                <h2 className="font-bold text-gray-900">
                  Seller Applications
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review and manage seller applications.
                </p>

                <span className={actionLinkClass}>
                  View applications →
                </span>
              </Link>

              <Link
                to="/super-admin/categories"
                className={cardClass}
              >
                <div className="mb-3 text-2xl">📂</div>

                <h2 className="font-bold text-gray-900">
                  Manage Categories
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create, edit, and delete product categories.
                </p>

                <span className={actionLinkClass}>
                  Manage categories →
                </span>
              </Link>
            </>
          )}
        </section>

        {/* Shipping Address - Customer only */}
        {isCustomer && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping Address
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add the address where you want your orders delivered.
                </p>
              </div>

              {!isEditing && hasSavedAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setMessage("");
                  }}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-600"
                >
                  ✏️ Edit Address
                </button>
              )}
            </div>

            {message && (
              <div
                role="status"
                className={`mb-5 rounded-lg p-3 text-sm ${
                  messageType === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Receiver Name *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Full name"
                    required
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={address.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                    required
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="addressLine"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Address *
                </label>

                <textarea
                  id="addressLine"
                  name="addressLine"
                  value={address.addressLine}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  placeholder="House, road, village or area"
                  required
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    City / Upazila *
                  </label>

                  <input
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City or upazila"
                    required
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    District *
                  </label>

                  <input
                    id="district"
                    name="district"
                    value={address.district}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="District"
                    required
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Postal code"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    💾 Save Shipping Address
                  </button>

                  {hasSavedAddress && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </form>
          </section>
        )}

        {/* Logout - all roles */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-red-200 bg-white px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
};

export default Profile;
