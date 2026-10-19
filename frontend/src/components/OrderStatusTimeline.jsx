
const STATUS_STEPS = [
  { value: "pending", label: "Order Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const OrderStatusTimeline = ({ status }) => {
  const currentIndex = STATUS_STEPS.findIndex(
    (step) => step.value === status
  );

  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-700">
          Order Cancelled
        </p>
        <p className="mt-1 text-sm text-red-600">
          This order has been cancelled.
        </p>
      </div>
    );
  }

  if (currentIndex === -1) {
    return (
      <p className="text-sm text-gray-500">
        Status: {status || "Unknown"}
      </p>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-gray-500">
            Current order status
          </p>
          <p className="text-lg font-semibold capitalize text-gray-900">
            {status}
          </p>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {currentIndex === STATUS_STEPS.length - 1
            ? "Completed"
            : `${currentIndex + 1} of ${STATUS_STEPS.length}`}
        </span>
      </div>

      <div className="space-y-0">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.value} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                    isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`h-8 w-0.5 ${
                      index < currentIndex
                        ? "bg-green-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="pb-5">
                <p
                  className={`text-sm font-medium ${
                    isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>

                {isCurrent && (
                  <p className="mt-1 text-xs text-green-700">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
