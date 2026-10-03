import React from "react";
import {
  Package,
  CheckCircle2,
  Truck,
  Navigation,
  Clock3,
  MapPin,
  Phone,
  CreditCard,
  IndianRupee,
  CalendarDays,
  RotateCcw,
  XCircle,
} from "lucide-react";

/* =====================================================
   TRACKING STEPS
===================================================== */

const STEPS = [
  {
    status: "Placed",
    title: "Order Placed",
    description: "Your order has been placed successfully.",
    icon: Package,
  },
  {
    status: "Confirmed",
    title: "Order Confirmed",
    description: "The store has confirmed your order.",
    icon: CheckCircle2,
  },
  {
    status: "Packed",
    title: "Order Packed",
    description: "Your items have been packed.",
    icon: Package,
  },
  {
    status: "Shipped",
    title: "Order Shipped",
    description: "Your order has been handed over for delivery.",
    icon: Truck,
  },
  {
    status: "Out for Delivery",
    title: "Out for Delivery",
    description: "Your order is on the way to your address.",
    icon: Navigation,
  },
  {
    status: "Delivered",
    title: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

/* =====================================================
   HELPERS
===================================================== */

const formatDateTime = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

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

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/* =====================================================
   STATUS HELPERS
===================================================== */

const isSpecialStatus = (status) => {
  return ["Cancelled", "Returned", "Refunded"].includes(status);
};

const getSpecialStatusConfig = (status) => {
  switch (status) {
    case "Cancelled":
      return {
        title: "Order Cancelled",
        description:
          "This order has been cancelled and will not be delivered.",
        icon: XCircle,
        container: "bg-red-50 border-red-100",
        iconBox: "bg-red-100 text-red-600",
      };

    case "Returned":
      return {
        title: "Order Returned",
        description:
          "This order has been returned successfully.",
        icon: RotateCcw,
        container: "bg-orange-50 border-orange-100",
        iconBox: "bg-orange-100 text-orange-600",
      };

    case "Refunded":
      return {
        title: "Order Refunded",
        description:
          "The refund for this order has been processed.",
        icon: IndianRupee,
        container: "bg-slate-100 border-slate-200",
        iconBox: "bg-slate-200 text-slate-600",
      };

    default:
      return null;
  }
};

/* =====================================================
   REUSABLE INFO ROW
===================================================== */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-sm text-slate-500">
        {label}
      </span>

      <span className="max-w-[65%] break-all text-right text-sm font-semibold text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

/* =====================================================
   REUSABLE INFO BOX
===================================================== */

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 text-blue-600" />
        )}

        <p className="text-xs text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-1 break-all font-semibold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

/* =====================================================
   SPECIAL STATUS COMPONENT
===================================================== */

function SpecialStatus({ order, status }) {
  const config = getSpecialStatusConfig(status);

  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
      <div
        className={`rounded-xl border p-5 ${config.container}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.iconBox}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">
              {config.title}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {config.description}
            </p>

            {order?.cancelReason && (
              <div className="mt-3 rounded-lg bg-white/70 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Reason
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {order.cancelReason}
                </p>
              </div>
            )}

            {order?.cancelledAt && (
              <p className="mt-3 text-xs text-slate-500">
                Updated on{" "}
                <span className="font-medium text-slate-700">
                  {formatDateTime(order.cancelledAt)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   TRACKING TIMELINE
===================================================== */

function TrackingTimeline({ order, status }) {
  const currentIndex = STEPS.findIndex(
    (step) => step.status === status
  );

  return (
    <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
      {/* HEADER */}

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

      {/* TIMELINE */}

      <div className="relative">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          const completed =
            currentIndex >= index;

          const current =
            currentIndex === index;

          const lineCompleted =
            currentIndex > index;

          return (
            <div
              key={step.status}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {/* CONNECTING LINE */}

              {index < STEPS.length - 1 && (
                <div
                  className={`absolute left-5 top-10 h-[calc(100%-18px)] w-0.5 ${
                    lineCompleted
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

              <div className="min-w-0 pt-0.5">
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

                {/* CURRENT STATUS */}

                {current && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Clock3 className="h-3 w-3" />
                    Current Status
                  </div>
                )}

                {/* DELIVERED DATE */}

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
  );
}

/* =====================================================
   SHIPMENT DETAILS
===================================================== */

function ShipmentDetails({ order }) {
  return (
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
            order?.courier || "Not assigned"
          }
        />

        <InfoRow
          label="Tracking ID"
          value={
            order?.trackingId || "Not assigned"
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

        {order?.deliveredAt && (
          <InfoRow
            label="Delivered On"
            value={formatDateTime(
              order.deliveredAt
            )}
          />
        )}
      </div>
    </div>
  );
}

/* =====================================================
   DELIVERY ADDRESS
===================================================== */

function DeliveryAddress({ order }) {
  const address =
    order?.deliveryAddress || {};

  const cityState = [
    address?.city,
    address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-blue-600" />

        <h2 className="text-lg font-semibold text-slate-900">
          Delivery Address
        </h2>
      </div>

      {/* NAME */}

      <p className="font-semibold text-slate-900">
        {address?.name || "Customer"}
      </p>

      {/* PHONE */}

      {address?.phone && (
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <Phone className="h-4 w-4" />
          {address.phone}
        </p>
      )}

      {/* ADDRESS */}

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

        {cityState && (
          <div>{cityState}</div>
        )}

        {address?.pincode && (
          <div>{address.pincode}</div>
        )}
      </div>

      {/* ADDRESS TYPE */}

      {address?.type && (
        <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
          {address.type}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   ORDER AMOUNT DETAILS
===================================================== */

function OrderAmountDetails({ order }) {
  const subtotal = Number(
    order?.subtotal || 0
  );

  const deliveryCharge = Number(
    order?.deliveryCharge || 0
  );

  const discount = Number(
    order?.discount || 0
  );

  const tax = Number(
    order?.tax || 0
  );

  const total = Number(
    order?.totalAmount || 0
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-blue-600" />

        <h2 className="text-lg font-semibold text-slate-900">
          Price Details
        </h2>
      </div>

      <div className="space-y-3">
        <InfoRow
          label="Subtotal"
          value={formatCurrency(subtotal)}
        />

        <InfoRow
          label="Delivery Charge"
          value={
            deliveryCharge === 0
              ? "Free"
              : formatCurrency(
                  deliveryCharge
                )
          }
        />

        {discount > 0 && (
          <InfoRow
            label="Discount"
            value={`- ${formatCurrency(
              discount
            )}`}
          />
        )}

        {tax > 0 && (
          <InfoRow
            label="Tax"
            value={formatCurrency(tax)}
          />
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-900">
            Total Amount
          </span>

          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* APPLIED OFFER */}

      {order?.appliedOffer?.title && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">
            Offer Applied
          </p>

          <p className="mt-1 text-sm font-semibold text-green-800">
            {order.appliedOffer.title}
          </p>

          {order?.appliedOffer?.discountAmount >
            0 && (
            <p className="mt-1 text-xs text-green-700">
              You saved{" "}
              {formatCurrency(
                order.appliedOffer
                  .discountAmount
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   ORDER INFORMATION
===================================================== */

function OrderInformation({ order }) {
  return (
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
          icon={Package}
        />

        <InfoBox
          label="Order Date"
          value={formatDateTime(
            order?.createdAt
          )}
          icon={CalendarDays}
        />

        <InfoBox
          label="Payment"
          value={
            order?.paymentMethod || "-"
          }
          icon={CreditCard}
        />

        <InfoBox
          label="Payment Status"
          value={
            order?.paymentStatus || "-"
          }
          icon={CheckCircle2}
        />
      </div>

      {/* CUSTOMER NOTE */}

      {order?.customerNote && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">
            Customer Note
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {order.customerNote}
          </p>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function OrderTracking({
  order,
}) {
  /* ---------------------------------------------------
     EMPTY STATE
  --------------------------------------------------- */

  if (!order) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <Package className="mx-auto h-10 w-10 text-slate-300" />

        <p className="mt-3 text-slate-500">
          Order tracking information is not
          available.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------
     ORDER STATUS
  --------------------------------------------------- */

  const status =
    order?.status || "Placed";

  const specialStatus =
    isSpecialStatus(status);

  const orderNumber =
    order?.orderId ||
    order?._id ||
    "Order";

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */

  return (
    <div className="space-y-0">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order Tracking
            </p>

            <h1 className="mt-1 break-all text-xl font-bold text-slate-900">
              #{orderNumber}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ordered on{" "}
              {formatDateTime(
                order?.createdAt
              )}
            </p>
          </div>

          {/* RIGHT */}

          <div className="shrink-0">
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

      {/* =================================================
          SPECIAL STATUS
      ================================================= */}

      {specialStatus && (
        <SpecialStatus
          order={order}
          status={status}
        />
      )}

      {/* =================================================
          NORMAL TRACKING TIMELINE
      ================================================= */}

      {!specialStatus && (
        <TrackingTimeline
          order={order}
          status={status}
        />
      )}

      {/* =================================================
          SHIPMENT + ADDRESS
      ================================================= */}

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <ShipmentDetails
          order={order}
        />

        <DeliveryAddress
          order={order}
        />
      </div>

      {/* =================================================
          PRICE DETAILS
      ================================================= */}

      <div className="mb-5">
        <OrderAmountDetails
          order={order}
        />
      </div>

      {/* =================================================
          ORDER INFORMATION
      ================================================= */}

      <OrderInformation
        order={order}
      />
    </div>
  );
}