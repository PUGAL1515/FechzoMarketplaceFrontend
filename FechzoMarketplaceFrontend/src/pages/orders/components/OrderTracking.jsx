import React from "react";
import {
  Package,
  CheckCircle2,
  Truck,
  Navigation,
  Clock3,
  MapPin,
  Phone,
} from "lucide-react";

const STEPS = [
  {
    status: "Placed",
    title: "Order Placed",
    description:
      "Your order has been placed successfully.",
    icon: Package,
  },
  {
    status: "Confirmed",
    title: "Order Confirmed",
    description:
      "The store has confirmed your order.",
    icon: CheckCircle2,
  },
  {
    status: "Packed",
    title: "Order Packed",
    description:
      "Your items have been packed.",
    icon: Package,
  },
  {
    status: "Shipped",
    title: "Order Shipped",
    description:
      "Your order has been handed over for delivery.",
    icon: Truck,
  },
  {
    status: "Out for Delivery",
    title: "Out for Delivery",
    description:
      "Your order is on the way to your address.",
    icon: Navigation,
  },
  {
    status: "Delivered",
    title: "Delivered",
    description:
      "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

const formatDateTime = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] break-all text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function OrderTracking({ order }) {
  if (!order) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">
          Order tracking information is not available.
        </p>
      </div>
    );
  }

  const status = order?.status || "Placed";

  const currentIndex = STEPS.findIndex(
    (step) => step.status === status
  );

  const address =
    order?.deliveryAddress || {};

  const specialStatus = [
    "Cancelled",
    "Returned",
    "Refunded",
  ].includes(status);

  return (
    <div>
      {/* HEADER */}
      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order Tracking
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-900">
              #{order?.orderId || order?._id}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ordered on{" "}
              {formatDateTime(order?.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Order Amount
            </p>

            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(
                order?.totalAmount
              )}
            </p>
          </div>
        </div>
      </div>

      {/* SPECIAL STATUS */}
      {specialStatus && (
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <div
            className={`rounded-lg p-4 ${
              status === "Cancelled"
                ? "bg-red-50"
                : status === "Returned"
                ? "bg-orange-50"
                : "bg-slate-100"
            }`}
          >
            <h2 className="font-semibold text-slate-900">
              {status === "Cancelled"
                ? "Order Cancelled"
                : status === "Returned"
                ? "Order Returned"
                : "Order Refunded"}
            </h2>

            {order?.cancelReason && (
              <p className="mt-1 text-sm text-slate-600">
                Reason: {order.cancelReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TRACKING TIMELINE */}
      {!specialStatus && (
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Track Order
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current Status:{" "}
              <span className="font-semibold text-blue-600">
                {status}
              </span>
            </p>
          </div>

          <div className="relative">
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              const completed =
                currentIndex >= index;

              const current =
                currentIndex === index;

              return (
                <div
                  key={step.status}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {/* LINE */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 h-[calc(100%-18px)] w-0.5 ${
                        currentIndex > index
                          ? "bg-blue-600"
                          : "bg-slate-200"
                      }`}
                    />
                  )}

                  {/* ICON */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    } ${
                      current
                        ? "ring-4 ring-blue-100"
                        : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* CONTENT */}
                  <div className="pt-0.5">
                    <h3
                      className={`font-semibold ${
                        completed
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={`mt-1 text-sm ${
                        completed
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>

                    {current && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        <Clock3 className="h-3 w-3" />
                        Current Status
                      </div>
                    )}

                    {status === "Delivered" &&
                      step.status === "Delivered" && (
                        <p className="mt-2 text-xs font-medium text-green-600">
                          Delivered on{" "}
                          {formatDateTime(
                            order?.deliveredAt ||
                              order?.updatedAt
                          )}
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SHIPMENT + ADDRESS */}
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        {/* SHIPMENT */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Shipment Details
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              label="Courier"
              value={
                order?.courier ||
                "Not assigned"
              }
            />

            <InfoRow
              label="Tracking ID"
              value={
                order?.trackingId ||
                "Not assigned"
              }
            />

            <InfoRow
              label="Estimated Delivery"
              value={
                order?.estimatedDelivery
                  ? formatDate(
                      order.estimatedDelivery
                    )
                  : "Not available"
              }
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Delivery Address
            </h2>
          </div>

          <p className="font-semibold text-slate-900">
            {address?.name || "Customer"}
          </p>

          {address?.phone && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Phone className="h-4 w-4" />
              {address.phone}
            </p>
          )}

          <div className="mt-3 text-sm leading-6 text-slate-600">
            {address?.doorNo && (
              <div>{address.doorNo}</div>
            )}

            {address?.street && (
              <div>{address.street}</div>
            )}

            {address?.landmark && (
              <div>{address.landmark}</div>
            )}

            <div>
              {[address?.city, address?.state]
                .filter(Boolean)
                .join(", ")}
            </div>

            {address?.pincode && (
              <div>{address.pincode}</div>
            )}
          </div>
        </div>
      </div>

      {/* ORDER INFO */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Order Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBox
            label="Order ID"
            value={
              order?.orderId ||
              order?._id ||
              "-"
            }
          />

          <InfoBox
            label="Order Date"
            value={formatDateTime(
              order?.createdAt
            )}
          />

          <InfoBox
            label="Payment"
            value={
              order?.paymentMethod || "-"
            }
          />

          <InfoBox
            label="Payment Status"
            value={
              order?.paymentStatus || "-"
            }
          />
        </div>
      </div>
    </div>
  );
}