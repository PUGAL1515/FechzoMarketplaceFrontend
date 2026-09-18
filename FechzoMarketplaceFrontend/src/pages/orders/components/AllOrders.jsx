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
} from "lucide-react";

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

const ACTIVE_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
];

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

const getOrderId = (order) => {
  return order?.orderId || order?._id;
};

const getStoreName = (order) => {
  return (
    order?.store?.storeName ||
    order?.store?.name ||
    "Fechzo Store"
  );
};

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <p className="text-xs text-slate-500">{label}</p>

          <p className="text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

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

function OrderCard({
  order,
  onOpenOrder,
  onTrackOrder,
  onCancelOrder,
}) {
  const status = order?.status || "Placed";

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const isActive = ACTIVE_STATUSES.includes(status);

  const canCancel = [
    "Placed",
    "Confirmed",
    "Packed",
  ].includes(status);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* TOP */}
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-5 text-xs text-slate-500">
          <div>
            <span>ORDER ID</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              #{getOrderId(order)}
            </p>
          </div>

          <div>
            <span>ORDER DATE</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              {formatDate(order?.createdAt)}
            </p>
          </div>

          <div>
            <span>STORE</span>

            <p className="mt-0.5 font-semibold text-slate-800">
              {getStoreName(order)}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* BODY */}
      <div className="p-4">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* PRODUCTS */}
          <div className="min-w-0 flex-1 space-y-4">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={item?._id || item?.product || index}
                className="flex gap-3"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {item?.image ? (
                    <img
                      src={item.image}
                      alt={item?.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-medium text-slate-900">
                    {item?.name || "Product"}
                  </h3>

                  {item?.brand && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.brand}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    Qty: {item?.quantity || 1}
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCurrency(
                      Number(item?.price || 0) *
                        Number(item?.quantity || 1)
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
          </div>

          {/* RIGHT */}
          <div className="flex min-w-[190px] flex-col justify-between border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div>
              <p className="text-xs text-slate-500">
                Total Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(order?.totalAmount)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {order?.paymentMethod || "COD"} •{" "}
                {order?.paymentStatus || "Pending"}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => onOpenOrder(order)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                View Details
                <ChevronRight className="h-4 w-4" />
              </button>

              {isActive && (
                <button
                  onClick={() => onTrackOrder(order)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  <Truck className="h-4 w-4" />
                  Track Order
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => onCancelOrder(order)}
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllOrders({
  orders = [],
  onOpenOrder,
  onTrackOrder,
  onCancelOrder,
  refreshOrders,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (filter !== "All") {
      if (filter === "Active") {
        result = result.filter((order) =>
          ACTIVE_STATUSES.includes(order?.status)
        );
      } else {
        result = result.filter(
          (order) => order?.status === filter
        );
      }
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((order) => {
        const orderId = String(
          order?.orderId || order?._id || ""
        ).toLowerCase();

        const storeName =
          getStoreName(order).toLowerCase();

        const productNames = (
          order?.items || []
        )
          .map((item) => item?.name || "")
          .join(" ")
          .toLowerCase();

        return (
          orderId.includes(query) ||
          storeName.includes(query) ||
          productNames.includes(query)
        );
      });
    }

    return result;
  }, [orders, filter, search]);

  const activeCount = orders.filter((order) =>
    ACTIVE_STATUSES.includes(order?.status)
  ).length;

  const deliveredCount = orders.filter(
    (order) => order?.status === "Delivered"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order?.status === "Cancelled"
  ).length;

  return (
    <div>
      {/* HEADER */}
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
          onClick={refreshOrders}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={
            <ShoppingBag className="h-5 w-5" />
          }
          label="Total Orders"
          value={orders.length}
        />

        <SummaryCard
          icon={<Truck className="h-5 w-5" />}
          label="Active"
          value={activeCount}
        />

        <SummaryCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="Delivered"
          value={deliveredCount}
        />

        <SummaryCard
          icon={
            <XCircle className="h-5 w-5" />
          }
          label="Cancelled"
          value={cancelledCount}
        />
      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by order ID, product or store"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* FILTER */}
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
            onClick={() => setFilter(item)}
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

      {/* ORDERS */}
      {filteredOrders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={getOrderId(order)}
              order={order}
              onOpenOrder={onOpenOrder}
              onTrackOrder={onTrackOrder}
              onCancelOrder={onCancelOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}