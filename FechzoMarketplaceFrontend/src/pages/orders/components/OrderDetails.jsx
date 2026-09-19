import React from "react";
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CalendarDays,
  Store,
} from "lucide-react";

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

const ACTIVE_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
];

function StatusBadge({ status }) {
  const styles = {
    Placed: "bg-blue-50 text-blue-700",
    Confirmed: "bg-indigo-50 text-indigo-700",
    Packed: "bg-purple-50 text-purple-700",
    Shipped: "bg-cyan-50 text-cyan-700",
    "Out for Delivery":
      "bg-orange-50 text-orange-700",
    Delivered: "bg-green-50 text-green-700",
    Cancelled: "bg-red-50 text-red-700",
    Returned: "bg-yellow-50 text-yellow-700",
    Refunded: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Placed"}
    </span>
  );
}

function Row({
  label,
  value,
  bold = false,
  valueClass = "",
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          bold
            ? "font-semibold text-slate-900"
            : "text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={`text-right ${
          bold
            ? "font-bold text-slate-900"
            : "font-medium text-slate-700"
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function Info({ label, value }) {
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

export default function OrderDetails({
  order,
  onTrackOrder,
  onCancelOrder,
}) {
  if (!order) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">
          Order details not available.
        </p>
      </div>
    );
  }

  const status = order?.status || "Placed";

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const address = order?.deliveryAddress || {};

  const isActive =
    ACTIVE_STATUSES.includes(status);

  const canCancel = [
    "Placed",
    "Confirmed",
    "Packed",
  ].includes(status);

  return (
    <div>
      {/* HEADER */}
      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                Order #{order?.orderId || order?._id}
              </h1>

              <StatusBadge status={status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(order?.createdAt)}
              </span>

              {order?.store?.storeName && (
                <span className="inline-flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  {order.store.storeName}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Total Amount
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(order?.totalAmount)}
            </p>
          </div>
        </div>

        {/* ACTIVE */}
        {isActive && (
          <div className="mt-5 flex flex-col gap-3 rounded-lg bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Your order is in progress
                </p>

                <p className="text-xs text-slate-500">
                  Current status: {status}
                </p>
              </div>
            </div>

            <button
              onClick={() => onTrackOrder(order)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Track Order
            </button>
          </div>
        )}

        {/* DELIVERED */}
        {status === "Delivered" && (
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-green-50 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />

            <div>
              <p className="font-semibold text-green-800">
                Delivered Successfully
              </p>

              <p className="text-sm text-green-700">
                Delivered on{" "}
                {formatDateTime(
                  order?.deliveredAt ||
                    order?.updatedAt
                )}
              </p>
            </div>
          </div>
        )}

        {/* CANCELLED */}
        {status === "Cancelled" && (
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-red-50 p-4">
            <XCircle className="h-6 w-6 shrink-0 text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Order Cancelled
              </p>

              {order?.cancelReason && (
                <p className="text-sm text-red-700">
                  Reason: {order.cancelReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* RETURNED */}
        {status === "Returned" && (
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-orange-50 p-4">
            <RotateCcw className="h-6 w-6 shrink-0 text-orange-600" />

            <div>
              <p className="font-semibold text-orange-800">
                Order Returned
              </p>

              <p className="text-sm text-orange-700">
                This order has been returned.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />

          <h2 className="text-lg font-semibold text-slate-900">
            Order Items
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <div
              key={
                item?._id ||
                item?.product ||
                index
              }
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item?.name || "Product"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-7 w-7 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  {item?.name || "Product"}
                </h3>

                {item?.brand && (
                  <p className="mt-1 text-sm text-slate-500">
                    Brand: {item.brand}
                  </p>
                )}

                {item?.sku && (
                  <p className="text-xs text-slate-400">
                    SKU: {item.sku}
                  </p>
                )}

                {item?.attributes &&
                  typeof item.attributes === "object" && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(
                        item.attributes
                      ).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                <div className="mt-3 flex flex-wrap gap-4">
                  <span className="text-sm text-slate-500">
                    Qty: {item?.quantity || 1}
                  </span>

                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item?.price)}
                  </span>

                  <span className="text-sm text-slate-500">
                    Total:{" "}
                    {formatCurrency(
                      Number(item?.price || 0) *
                        Number(item?.quantity || 1)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADDRESS + PAYMENT */}
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
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

        {/* PAYMENT */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Payment Details
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <Row
              label="Payment Method"
              value={order?.paymentMethod || "-"}
            />

            <Row
              label="Payment Status"
              value={order?.paymentStatus || "-"}
            />

            {order?.paymentId && (
              <Row
                label="Payment ID"
                value={order.paymentId}
              />
            )}

            {order?.razorpayOrderId && (
              <Row
                label="Razorpay Order ID"
                value={order.razorpayOrderId}
              />
            )}
          </div>
        </div>
      </div>

      {/* PRICE */}
      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Price Details
        </h2>

        <div className="max-w-md space-y-3 text-sm">
          <Row
            label="Subtotal"
            value={formatCurrency(order?.subtotal)}
          />

          <Row
            label="Delivery Charge"
            value={formatCurrency(
              order?.deliveryCharge
            )}
          />

          <Row
            label="Discount"
            value={`-${formatCurrency(
              order?.discount
            )}`}
            valueClass="text-green-600"
          />

          <Row
            label="Tax"
            value={formatCurrency(order?.tax)}
          />

          <div className="border-t border-slate-200 pt-3">
            <Row
              label="Total Amount"
              value={formatCurrency(
                order?.totalAmount
              )}
              bold
            />
          </div>
        </div>
      </div>

      {/* SHIPMENT */}
      {(order?.trackingId ||
        order?.courier ||
        order?.estimatedDelivery) && (
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Shipment Details
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Info
              label="Courier"
              value={order?.courier || "-"}
            />

            <Info
              label="Tracking ID"
              value={order?.trackingId || "-"}
            />

            <Info
              label="Estimated Delivery"
              value={
                order?.estimatedDelivery
                  ? formatDate(
                      order.estimatedDelivery
                    )
                  : "-"
              }
            />
          </div>
        </div>
      )}

      {/* NOTES */}
      {(order?.customerNote ||
        order?.adminNote) && (
        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Order Notes
          </h2>

          {order?.customerNote && (
            <p className="text-sm text-slate-600">
              {order.customerNote}
            </p>
          )}

          {order?.adminNote && (
            <p className="mt-2 text-sm text-slate-600">
              {order.adminNote}
            </p>
          )}
        </div>
      )}

      {/* CANCEL */}
      {canCancel && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <button
            onClick={() => onCancelOrder(order)}
            className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}