
import { Link, useSearchParams } from "react-router-dom";

const PaymentFailed = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="mx-auto max-w-xl px-4 py-16">
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
                    ×
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                    Payment Failed
                </h1>

                <p className="mt-3 text-gray-600">
                    We could not complete your payment.
                    Please check your order status or try placing a new order.
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
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
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

export default PaymentFailed;
