
import { Link, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="mx-auto max-w-xl px-4 py-16">
            <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                    ✓
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                    Payment Successful!
                </h1>

                <p className="mt-3 text-gray-600">
                    Your payment has been verified successfully.
                    Thank you for your order.
                </p>

                {orderId && (
                    <p className="mt-3 break-all text-sm text-gray-500">
                        Order ID: {orderId}
                    </p>
                )}

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    {orderId && (
                        <Link
                            to={`/order/${orderId}`}
                            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                        >
                            View Order
                        </Link>
                    )}

                    <Link
                        to="/my-orders"
                        className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                    >
                        My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
