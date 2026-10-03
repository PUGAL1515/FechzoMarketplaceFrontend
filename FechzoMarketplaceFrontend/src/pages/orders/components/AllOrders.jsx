import React, { useMemo, useState } from "react";
import {
  Search,
  Package,
  Truck,
  ChevronRight,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ShoppingBag,
  RotateCcw,
  Clock3,
  CheckCircle,
  PackageCheck,
  PackageSearch,
} from "lucide-react";

/* ============================================================
   ORDER STATUS STYLES
============================================================ */

const STATUS_STYLES = {
  Placed: "bg-blue-50 text-blue-700",
  Confirmed: "bg-indigo-50 text-indigo-700",
  Packed: "bg-purple-50 text-purple-700",
  Shipped: "bg-cyan-50 text-cyan-700",
  "Out for Delivery": "bg-orange-50 text-orange-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
  Returned: "bg-yellow-50 text-yellow-700",
  Refunded: "bg-slate-100 text-slate-700",
};

/* ============================================================
   RETURN STATUS CONFIG
============================================================ */

const RETURN_STATUS_CONFIG = {
  Requested: {
    title: "Return Requested",
    description: "Waiting for store approval",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  Approved: {
    title: "Return Approved",
    description: "Pickup will be scheduled",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },

  "Pickup Scheduled": {
    title: "Pickup Scheduled",
    description: "Your item is scheduled for pickup",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
    icon: PackageSearch,
  },

  "Picked Up": {
    title: "Item Picked Up",
    description: "Your returned item is on the way",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: Truck,
  },

  Received: {
    title: "Return Received",
    description: "Store has received your returned item",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700",
    icon: PackageCheck,
  },

  Refunded: {
    title: "Refund Completed",
    description: "Your refund has been processed",
    className:
      "border-green-200 bg-green-50 text-green-700",
    icon: CheckCircle,
  },

  Rejected: {
    title: "Return Rejected",
    description: "Your return request was rejected",
    className:
      "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },

  Cancelled: {
    title: "Return Cancelled",
    description: "Your return request was cancelled",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
    icon: XCircle,
  },
};

/* ============================================================
   ACTIVE ORDER STATUSES
============================================================ */

const ACTIVE_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
];

/* ============================================================
   FORMAT DATE
============================================================ */

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

/* ============================================================
   FORMAT CURRENCY
============================================================ */

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

/* ============================================================
   GET ORDER ID
============================================================ */

const getOrderId = (order) => {
  return order?.orderId || order?._id;
};

/* ============================================================
   GET STORE NAME
============================================================ */

const getStoreName = (order) => {
  return (
    order?.store?.storeName ||
    order?.store?.name ||
    "Fechzo Store"
  );
};

/* ============================================================
   GET RETURN REQUEST
============================================================ */

const getReturnRequest = (order) => {
  if (!order) {
    return null;
  }

  /*
   * OrderHistory already attaches latest return request
   * as order.returnRequest.
   */

  if (order?.returnRequest) {
    return order.returnRequest;
  }

  /*
   * Fallback:
   * If returnRequest is not available but returnRequests
   * exists, use the latest one.
   */

  if (
    Array.isArray(order?.returnRequests) &&
    order.returnRequests.length > 0
  ) {
    return order.returnRequests[0];
  }

  return null;
};

/* ============================================================
   CHECK ACTIVE RETURN REQUEST
============================================================ */

const hasActiveReturnRequest = (order) => {
  const returnRequest =
    getReturnRequest(order);

  if (!returnRequest) {
    return false;
  }

  /*
   * Rejected / Cancelled returns can be requested again.
   */

  return ![
    "Rejected",
    "Cancelled",
  ].includes(returnRequest?.status);
};

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ORDER STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        STATUS_STYLES[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Placed"}
    </span>
  );
}

/* ============================================================
   RETURN STATUS CARD
============================================================ */

function ReturnStatusCard({ returnRequest }) {
  if (!returnRequest) {
    return null;
  }

  const status =
    returnRequest?.status || "Requested";

  const config =
    RETURN_STATUS_CONFIG[status];

  /*
   * Unknown status fallback
   */

  if (!config) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">
              Return Status
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {status}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div
      className={`mt-4 rounded-lg border px-4 py-3 ${config.className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {config.title}
            </p>

            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold">
              {status}
            </span>
          </div>

          <p className="mt-1 text-xs">
            {config.description}
          </p>

          {returnRequest?.reason && (
            <p className="mt-2 text-xs opacity-80">
              Reason:{" "}
              <span className="font-medium">
                {returnRequest.reason}
              </span>
            </p>
          )}

          {returnRequest?.refundAmount !==
            undefined && (
            <p className="mt-1 text-xs opacity-80">
              Refund Amount:{" "}
              <span className="font-semibold">
                {formatCurrency(
                  returnRequest.refundAmount
                )}
              </span>
            </p>
          )}

          {returnRequest?.rejectionReason &&
            status === "Rejected" && (
              <p className="mt-2 rounded-md bg-white/60 px-2.5 py-2 text-xs">
                <span className="font-semibold">
                  Rejection reason:
                </span>{" "}
                {returnRequest.rejectionReason}
              </p>
            )}

          {returnRequest?.requestedAt && (
            <p className="mt-2 text-[11px] opacity-70">
              Requested on{" "}
              {formatDate(
                returnRequest.requestedAt
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY ORDERS
============================================================ */

function EmptyOrders() {
  return (
    <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Package className="h-8 w-8 text-slate-400" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No Orders Found
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Your orders will appear here once you place an order.
      </p>
    </div>
  );
}

/* ============================================================
   ORDER CARD
============================================================ */

function OrderCard({
  order,
  onOpenOrder,
  onTrackOrder,
  onCancelOrder,
  onReturnOrder,
}) {
  const status =
    order?.status || "Placed";

  const items = Array.isArray(
    order?.items
  )
    ? order.items
    : [];

  const isActive =
    ACTIVE_STATUSES.includes(status);

  const canCancel = [
    "Placed",
    "Confirmed",
    "Packed",
  ].includes(status);

  /* ------------------------------------------------------------
     RETURN REQUEST
  ------------------------------------------------------------ */

  const returnRequest =
    getReturnRequest(order);

  const returnStatus =
    returnRequest?.status || null;

  const activeReturn =
    hasActiveReturnRequest(order);

  /*
   * Return can only be created if:
   *
   * 1. Order Delivered
   * 2. No active return request
   *
   * If previous request was Rejected/Cancelled,
   * user can request return again.
   */

  const canReturn =
    status === "Delivered" &&
    !activeReturn;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* ======================================================
          TOP
      ====================================================== */}

      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-5 text-xs text-slate-500">
          {/* ORDER ID */}

          <div>
            <span>ORDER ID</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              #{getOrderId(order)}
            </p>
          </div>

          {/* ORDER DATE */}

          <div>
            <span>ORDER DATE</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              {formatDate(
                order?.createdAt
              )}
            </p>
          </div>

          {/* STORE */}

          <div>
            <span>STORE</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              {getStoreName(order)}
            </p>
          </div>
        </div>

        {/* ORDER STATUS */}

        <StatusBadge status={status} />
      </div>

      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="p-4">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* ====================================================
              PRODUCTS
          ==================================================== */}

          <div className="min-w-0 flex-1 space-y-4">
            {items
              .slice(0, 3)
              .map((item, index) => (
                <div
                  key={
                    item?._id ||
                    item?.product ||
                    item?.itemId ||
                    index
                  }
                  className="flex gap-3"
                >
                  {/* PRODUCT IMAGE */}

                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={
                          item?.name ||
                          "Product"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-medium text-slate-900">
                      {item?.name ||
                        item?.productName ||
                        "Product"}
                    </h3>

                    {item?.brand && (
                      <p className="mt-1 text-xs text-slate-500">
                        {item.brand}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-slate-500">
                      Qty:{" "}
                      {item?.quantity ||
                        1}
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatCurrency(
                        Number(
                          item?.price ||
                            0
                        ) *
                          Number(
                            item?.quantity ||
                              1
                          )
                      )}
                    </p>
                  </div>
                </div>
              ))}

            {items.length > 3 && (
              <p className="text-xs font-medium text-blue-600">
                +{items.length - 3} more items
              </p>
            )}

            {/* ==================================================
                RETURN STATUS
            ================================================== */}

            {returnRequest && (
              <ReturnStatusCard
                returnRequest={
                  returnRequest
                }
              />
            )}
          </div>

          {/* ====================================================
              RIGHT SIDE
          ==================================================== */}

          <div className="flex min-w-[190px] flex-col justify-between border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div>
              <p className="text-xs text-slate-500">
                Total Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(
                  order?.totalAmount
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {order?.paymentMethod ||
                  "COD"}{" "}
                •{" "}
                {order?.paymentStatus ||
                  "Pending"}
              </p>
            </div>

            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="mt-4 flex flex-col gap-2">
              {/* VIEW DETAILS */}

              <button
                onClick={() =>
                  onOpenOrder(order)
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                View Details

                <ChevronRight className="h-4 w-4" />
              </button>

              {/* TRACK ORDER */}

              {isActive && (
                <button
                  onClick={() =>
                    onTrackOrder(order)
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  <Truck className="h-4 w-4" />

                  Track Order
                </button>
              )}

              {/* CANCEL ORDER */}

              {canCancel && (
                <button
                  onClick={() =>
                    onCancelOrder(order)
                  }
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}

              {/* ==================================================
                  RETURN ACTION
              ================================================== */}

              {canReturn && (
                <button
                  onClick={() =>
                    onReturnOrder(order)
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                >
                  <RotateCcw className="h-4 w-4" />

                  Return Item
                </button>
              )}

              {/* ==================================================
                  RETURN ALREADY EXISTS
              ================================================== */}

              {activeReturn &&
                returnStatus && (
                  <div
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-center text-sm font-medium ${
                      returnStatus ===
                      "Requested"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : returnStatus ===
                          "Approved"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : returnStatus ===
                          "Pickup Scheduled"
                        ? "border-violet-200 bg-violet-50 text-violet-700"
                        : returnStatus ===
                          "Picked Up"
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : returnStatus ===
                          "Received"
                        ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                        : returnStatus ===
                          "Refunded"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />

                    {returnStatus ===
                    "Requested"
                      ? "Return Requested"
                      : returnStatus}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AllOrders({
  orders = [],
  onOpenOrder,
  onTrackOrder,
  onCancelOrder,
  refreshOrders,
  onReturnOrder,
}) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  /* ============================================================
     FILTER ORDERS
  ============================================================ */

  const filteredOrders =
    useMemo(() => {
      let result = [...orders];

      /* --------------------------------------------------------
         STATUS FILTER
      -------------------------------------------------------- */

      if (filter !== "All") {
        if (filter === "Active") {
          result = result.filter(
            (order) =>
              ACTIVE_STATUSES.includes(
                order?.status
              )
          );
        } else {
          result = result.filter(
            (order) =>
              order?.status ===
              filter
          );
        }
      }

      /* --------------------------------------------------------
         SEARCH
      -------------------------------------------------------- */

      const query =
        search.trim().toLowerCase();

      if (query) {
        result =
          result.filter(
            (order) => {
              const orderId =
                String(
                  order?.orderId ||
                    order?._id ||
                    ""
                ).toLowerCase();

              const storeName =
                getStoreName(
                  order
                ).toLowerCase();

              const productNames =
                (
                  order?.items ||
                  []
                )
                  .map(
                    (item) =>
                      item?.name ||
                      item?.productName ||
                      ""
                  )
                  .join(" ")
                  .toLowerCase();

              const returnStatus =
                String(
                  order
                    ?.returnRequest
                    ?.status ||
                    ""
                ).toLowerCase();

              return (
                orderId.includes(
                  query
                ) ||
                storeName.includes(
                  query
                ) ||
                productNames.includes(
                  query
                ) ||
                returnStatus.includes(
                  query
                )
              );
            }
          );
      }

      return result;
    }, [
      orders,
      filter,
      search,
    ]);

  /* ============================================================
     COUNTS
  ============================================================ */

  const activeCount =
    orders.filter(
      (order) =>
        ACTIVE_STATUSES.includes(
          order?.status
        )
    ).length;

  const deliveredCount =
    orders.filter(
      (order) =>
        order?.status ===
        "Delivered"
    ).length;

  const cancelledCount =
    orders.filter(
      (order) =>
        order?.status ===
        "Cancelled"
    ).length;

  /* ============================================================
     RETURN REQUEST COUNT
  ============================================================ */

  const returnRequestCount =
    orders.filter(
      (order) =>
        hasActiveReturnRequest(
          order
        )
    ).length;

  /* ============================================================
     RETURNED / REFUNDED FILTER SUPPORT
  ============================================================ */

  const returnedOrders =
    orders.filter((order) => {
      const orderStatus =
        order?.status;

      const returnStatus =
        order?.returnRequest
          ?.status;

      return (
        orderStatus ===
          "Returned" ||
        returnStatus ===
          "Picked Up" ||
        returnStatus ===
          "Received"
      );
    });

  const refundedOrders =
    orders.filter((order) => {
      const orderStatus =
        order?.status;

      const returnStatus =
        order?.returnRequest
          ?.status;

      return (
        orderStatus ===
          "Refunded" ||
        returnStatus ===
          "Refunded"
      );
    });

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all your Fechzo orders
          </p>
        </div>

        <button
          onClick={
            refreshOrders
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />

          Refresh
        </button>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {/* TOTAL */}

        <SummaryCard
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
          label="Total Orders"
          value={
            orders.length
          }
        />

        {/* ACTIVE */}

        <SummaryCard
          icon={
            <Truck className="h-5 w-5" />
          }
          label="Active"
          value={
            activeCount
          }
        />

        {/* DELIVERED */}

        <SummaryCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="Delivered"
          value={
            deliveredCount
          }
        />

        {/* CANCELLED */}

        <SummaryCard
          icon={
            <XCircle className="h-5 w-5" />
          }
          label="Cancelled"
          value={
            cancelledCount
          }
        />

        {/* RETURNS */}

        <SummaryCard
          icon={
            <RotateCcw className="h-5 w-5" />
          }
          label="Returns"
          value={
            returnRequestCount
          }
        />
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by order ID, product, store or return status"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* ======================================================
          FILTER
      ====================================================== */}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[
          "All",
          "Active",
          "Delivered",
          "Cancelled",
          "Returned",
          "Refunded",
        ].map((item) => (
          <button
            key={item}
            onClick={() =>
              setFilter(item)
            }
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* ======================================================
          RETURN INFO
      ====================================================== */}

      {returnRequestCount >
        0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Return requests
            </p>

            <p className="mt-1 text-xs text-amber-700">
              You have{" "}
              <span className="font-semibold">
                {returnRequestCount}
              </span>{" "}
              active return request
              {returnRequestCount !==
              1
                ? "s"
                : ""}
              . You can track the latest
              return status from the order card.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          ORDERS
      ====================================================== */}

      {filteredOrders.length ===
      0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(
            (order) => (
              <OrderCard
                key={getOrderId(
                  order
                )}
                order={order}
                onOpenOrder={
                  onOpenOrder
                }
                onTrackOrder={
                  onTrackOrder
                }
                onCancelOrder={
                  onCancelOrder
                }
                onReturnOrder={
                  onReturnOrder
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}