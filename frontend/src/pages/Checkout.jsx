
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderServices";
import { initiatePayment } from "../services/paymentServices";

const STORAGE_KEY = "shippingAddress";

const EMPTY_FORM = {
    name: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "cod",
};

const Checkout = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [addressMessage, setAddressMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [hasSavedAddress, setHasSavedAddress] = useState(false);

    useEffect(() => {
        loadSavedAddress();
    }, []);

    const loadSavedAddress = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                setHasSavedAddress(false);
                setIsEditing(true);
                setAddressMessage(
                    "Saved address nei. Delivery details fill koro."
                );
                return;
            }

            const parsed = JSON.parse(saved);

            setFormData((previous) => ({
                ...previous,
                name: parsed.fullName || parsed.name || "",
                phone: parsed.phone || "",
                address: parsed.addressLine || parsed.address || "",
                city: parsed.city || "",
            }));

            setHasSavedAddress(true);
            setIsEditing(false);
            setAddressMessage("Saved shipping address load hoyeche.");
            setError("");
        } catch {
            setAddressMessage(
                "Saved address load kora jayni. Profile theke abar save koro."
            );
            setIsEditing(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setAddressMessage("");
    };

    const saveAddress = () => {
        const addressToSave = {
            fullName: formData.name.trim(),
            phone: formData.phone.trim(),
            addressLine: formData.address.trim(),
            city: formData.city.trim(),
            district: "",
            postalCode: "",
        };

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(addressToSave)
        );

        setHasSavedAddress(true);
        setIsEditing(false);
        setAddressMessage("Shipping address successfully saved!");
    };

    const handleSaveChanges = () => {
        if (
            !formData.name.trim() ||
            !formData.phone.trim() ||
            !formData.address.trim() ||
            !formData.city.trim()
        ) {
            setError("Shob required shipping field fill koro.");
            return;
        }

        try {
            saveAddress();
            setError("");
        } catch {
            setError("Address save kora jayni. Abar try koro.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (
                !formData.name.trim() ||
                !formData.phone.trim() ||
                !formData.address.trim() ||
                !formData.city.trim()
            ) {
                setError("Shob required shipping field fill koro.");
                return;
            }

            // Checkout-er age shipping address save
            saveAddress();

            // Step 1: Prothome order create hobe
            const orderResponse = await createOrder({
                ...formData,
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
            });

            // API response-er possible structure handle kora
            const order =
                orderResponse?.data?.order ||
                orderResponse?.data ||
                orderResponse?.order ||
                orderResponse;

            const orderId = order?._id || order?.orderId;

            if (!orderId) {
                throw new Error(
                    "Order create hoyeche kina verify kora jacche na. API response check koro."
                );
            }

            // Step 2: COD hole payment gateway lagbe na
            if (formData.paymentMethod === "cod") {
                window.alert("Order placed successfully!");
                navigate(`/order/${orderId}`);
                return;
            }

            // Step 3: SSLCommerz payment session create
            const paymentResponse = await initiatePayment(orderId);

            const gatewayURL =
                paymentResponse?.data?.GatewayPageURL ||
                paymentResponse?.GatewayPageURL ||
                paymentResponse?.data?.gatewayPageURL;

            if (!gatewayURL) {
                throw new Error(
                    paymentResponse?.message ||
                    "Payment gateway URL paoa jayni."
                );
            }

            // Step 4: Customer-ke SSLCommerz gateway-te pathano
            window.location.href = gatewayURL;
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Order place kora jayni. Abar try koro."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600";

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">
                Checkout
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
            >
                {/* Shipping Address */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">
                                Shipping Address
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                Saved address use koro ba proyojone edit koro.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={loadSavedAddress}
                                className="rounded-md border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                                Use Saved Address
                            </button>

                            {!isEditing && hasSavedAddress && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setAddressMessage("");
                                        setError("");
                                    }}
                                    className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                                >
                                    Edit Address
                                </button>
                            )}
                        </div>
                    </div>

                    {addressMessage && (
                        <p className="mt-3 text-sm text-gray-700">
                            {addressMessage}
                        </p>
                    )}
                </div>

                {/* Full Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium"
                    >
                        Full Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="Enter your full name"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label
                        htmlFor="phone"
                        className="mb-1 block text-sm font-medium"
                    >
                        Phone Number
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="Enter your phone number"
                    />
                </div>

                {/* Address */}
                <div>
                    <label
                        htmlFor="address"
                        className="mb-1 block text-sm font-medium"
                    >
                        Delivery Address
                    </label>

                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                        rows={3}
                        className={inputClass}
                        placeholder="House, road, area"
                    />
                </div>

                {/* City */}
                <div>
                    <label
                        htmlFor="city"
                        className="mb-1 block text-sm font-medium"
                    >
                        City / Upazila
                    </label>

                    <input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="Enter your city or upazila"
                    />
                </div>

                {/* Save / Cancel */}
                {isEditing && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                        >
                            Save Address
                        </button>

                        {hasSavedAddress && (
                            <button
                                type="button"
                                onClick={loadSavedAddress}
                                className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}

                {/* Payment Method */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Payment Method
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === "cod"}
                            onChange={handleChange}
                        />
                        Cash on Delivery
                    </label>

                    <label className="mt-2 flex items-center gap-2">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="sslcommerz"
                            checked={formData.paymentMethod === "sslcommerz"}
                            onChange={handleChange}
                        />
                        SSLCommerz
                    </label>
                </div>

                {error && (
                    <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/* Place Order */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? formData.paymentMethod === "sslcommerz"
                            ? "Redirecting to Payment..."
                            : "Placing Order..."
                        : formData.paymentMethod === "sslcommerz"
                            ? "Place Order & Pay"
                            : "Place Order"}
                </button>
            </form>
        </div>
    );
};

export default Checkout;
