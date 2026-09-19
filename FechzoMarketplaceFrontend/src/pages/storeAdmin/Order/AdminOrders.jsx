import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Box,
  Navigation,
  CalendarDays,
  AlertCircle,
  Store,
} from "lucide-react";

import api from "../../../api/api";

/* ============================================================
   STATUS CONFIG
============================================================ */

const STATUS_CONFIG = {
  Placed: {
    label: "Placed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: ShoppingBag,
  },

  Confirmed: {
    label: "Confirmed",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: CheckCircle,
  },

  Packed: {
    label: "Packed",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Box,
  },

  Shipped: {
    label: "Shipped",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Truck,
  },

  "Out for Delivery": {
    label: "Out for Delivery",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: Navigation,
  },

  Delivered: {
    label: "Delivered",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle,
  },

  Cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },

  Returned: {
    label: "Returned",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: RefreshCw,
  },

  Refunded: {
    label: "Refunded",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: CreditCard,
  },
};

/* ============================================================
   FILTERS
============================================================ */

const STATUS_FILTERS = [
  "All",
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Placed;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        border
        text-xs font-semibold
        ${config.bg}
        ${config.text}
        ${config.border}
      `}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

/* ============================================================
   PAYMENT BADGE
============================================================ */

function PaymentBadge({ method, status }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-700">
        {method || "COD"}
      </span>

      <span
        className={`
          text-[11px] font-medium
          ${
            status === "Paid"
              ? "text-green-600"
              : status === "Failed"
              ? "text-red-600"
              : "text-orange-600"
          }
        `}
      >
        {status || "Pending"}
      </span>
    </div>
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [expandedOrder, setExpandedOrder] = useState(null);

  const [shipmentModal, setShipmentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [shipmentData, setShipmentData] = useState({
    courier: "",
    trackingId: "",
    estimatedDelivery: "",
  });

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState("");

  /* ============================================================
     LOAD STORE
  ============================================================ */

  useEffect(() => {
    const storedStoreId = localStorage.getItem("storeId");
    const storedStore = localStorage.getItem("store");

    let parsedStore = null;

    if (storedStore) {
      try {
        parsedStore = JSON.parse(storedStore);
      } catch (error) {
        console.error("Failed to parse store:", error);
      }
    }

    const finalStoreId =
      storedStoreId ||
      parsedStore?._id ||
      parsedStore?.id ||
      null;

    setStoreId(finalStoreId);

    setStoreName(
      parsedStore?.storeName ||
        parsedStore?.name ||
        localStorage.getItem("storeName") ||
        "Store"
    );
  }, []);

  /* ============================================================
     FETCH STORE ORDERS
     
     IMPORTANT:
     Existing backend route:
     GET /api/marketplace/orders/store/:storeId
  ============================================================ */

  const fetchOrders = async (showLoader = true) => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const endpoint = `/api/marketplace/orders/store/${storeId}`;

      console.log("Fetching store orders:", endpoint);

      const response = await api.get(endpoint);

      console.log("Store Orders Response:", response);

      const data = response?.data || {};

      let receivedOrders = [];

      if (Array.isArray(data)) {
        receivedOrders = data;
      } else if (Array.isArray(data.orders)) {
        receivedOrders = data.orders;
      } else if (Array.isArray(data.results)) {
        receivedOrders = data.results;
      } else if (Array.isArray(data.data)) {
        receivedOrders = data.data;
      }

      setOrders(receivedOrders);
    } catch (error) {
      console.error("Failed to fetch store orders:", error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to load orders";

      alert(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (!storeId) return;

    fetchOrders(true);
  }, [storeId]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = async () => {
    await fetchOrders(false);
  };

  /* ============================================================
     FILTER + SEARCH
     
     Search/filter is handled on frontend so we don't need
     to modify your existing backend route.
  ============================================================ */

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      /* STATUS FILTER */

      if (
        activeFilter !== "All" &&
        order.status !== activeFilter
      ) {
        return false;
      }

      /* SEARCH */

      if (!searchValue) {
        return true;
      }

      const orderId = String(
        order.orderId || order._id || ""
      ).toLowerCase();

      const customerName = String(
        order.user?.name ||
          order.deliveryAddress?.name ||
          ""
      ).toLowerCase();

      const phone = String(
        order.user?.phone ||
          order.deliveryAddress?.phone ||
          ""
      ).toLowerCase();

      const email = String(
        order.user?.email || ""
      ).toLowerCase();

      const productNames =
        order.items
          ?.map((item) =>
            String(item.name || "").toLowerCase()
          )
          .join(" ") || "";

      const skuNames =
        order.items
          ?.map((item) =>
            String(item.sku || "").toLowerCase()
          )
          .join(" ") || "";

      return (
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        phone.includes(searchValue) ||
        email.includes(searchValue) ||
        productNames.includes(searchValue) ||
        skuNames.includes(searchValue)
      );
    });
  }, [orders, search, activeFilter]);

  /* ============================================================
     STATS
  ============================================================ */

  const stats = useMemo(() => {
    const result = {
      total: orders.length,
      Placed: 0,
      Confirmed: 0,
      Packed: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
      Refunded: 0,
    };

    orders.forEach((order) => {
      if (result[order.status] !== undefined) {
        result[order.status] += 1;
      }
    });

    return result;
  }, [orders]);

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  /* ============================================================
     FORMAT MONEY
  ============================================================ */

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  /* ============================================================
     UPDATE ORDER STATUS
     
     IMPORTANT:
     Existing backend route:
     PUT /api/marketplace/orders/:orderId/status
  ============================================================ */

  const updateStatus = async (
    order,
    status,
    extraData = {}
  ) => {
    if (!order) return;

    const orderIdentifier =
      order._id || order.orderId;

    if (!orderIdentifier) {
      alert("Order ID not found.");
      return;
    }

    try {
      setUpdatingOrder(orderIdentifier);

      const endpoint = `/api/marketplace/orders/${orderIdentifier}/status`;

      console.log("Updating order:", {
        endpoint,
        status,
        extraData,
      });

      await api.put(endpoint, {
        status,
        ...extraData,
      });

      /*
       * Refresh from the existing backend route.
       */
      await fetchOrders(false);
    } catch (error) {
      console.error(
        "Order status update failed:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  /* ============================================================
     STATUS ACTION
  ============================================================ */

  const handleStatusAction = (order) => {
    if (!order) return;

    switch (order.status) {
      case "Placed":
        updateStatus(order, "Confirmed");
        break;

      case "Confirmed":
        updateStatus(order, "Packed");
        break;

      case "Packed":
        setSelectedOrder(order);

        setShipmentData({
          courier: order.courier || "",
          trackingId: order.trackingId || "",
          estimatedDelivery: order.estimatedDelivery
            ? new Date(order.estimatedDelivery)
                .toISOString()
                .split("T")[0]
            : "",
        });

        setShipmentModal(true);
        break;

      case "Shipped":
        updateStatus(
          order,
          "Out for Delivery"
        );
        break;

      case "Out for Delivery":
        updateStatus(
          order,
          "Delivered"
        );
        break;

      default:
        break;
    }
  };

  /* ============================================================
     SHIPMENT SUBMIT
  ============================================================ */

  const handleShipmentSubmit = async (event) => {
    event.preventDefault();

    if (!selectedOrder) return;

    if (!shipmentData.courier.trim()) {
      alert("Courier is required.");
      return;
    }

    if (!shipmentData.trackingId.trim()) {
      alert("Tracking ID is required.");
      return;
    }

    if (!shipmentData.estimatedDelivery) {
      alert("Please select estimated delivery date.");
      return;
    }

    await updateStatus(
      selectedOrder,
      "Shipped",
      {
        courier: shipmentData.courier.trim(),
        trackingId: shipmentData.trackingId.trim(),
        estimatedDelivery:
          shipmentData.estimatedDelivery,
      }
    );

    setShipmentModal(false);
    setSelectedOrder(null);

    setShipmentData({
      courier: "",
      trackingId: "",
      estimatedDelivery: "",
    });
  };

  /* ============================================================
     CANCEL ORDER
  ============================================================ */

  const handleCancel = async (order) => {
    if (!order) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.orderId}?`
    );

    if (!confirmed) return;

    await updateStatus(order, "Cancelled");
  };

  /* ============================================================
     ACTION LABEL
  ============================================================ */

  const getActionLabel = (status) => {
    switch (status) {
      case "Placed":
        return "Confirm Order";

      case "Confirmed":
        return "Pack Order";

      case "Packed":
        return "Ship Order";

      case "Shipped":
        return "Out for Delivery";

      case "Out for Delivery":
        return "Mark Delivered";

      default:
        return null;
    }
  };

  /* ============================================================
     ACTION ICON
  ============================================================ */

  const getActionIcon = (status) => {
    switch (status) {
      case "Placed":
        return <CheckCircle size={16} />;

      case "Confirmed":
        return <Box size={16} />;

      case "Packed":
        return <Truck size={16} />;

      case "Shipped":
        return <Navigation size={16} />;

      case "Out for Delivery":
        return <CheckCircle size={16} />;

      default:
        return null;
    }
  };

  /* ============================================================
     STAT CARDS
  ============================================================ */

  const statCards = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Placed",
      value: stats.Placed,
      icon: Clock,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Packed",
      value: stats.Packed,
      icon: Package,
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Shipped",
      value: stats.Shipped,
      icon: Truck,
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Delivered",
      value: stats.Delivered,
      icon: CheckCircle,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Cancelled",
      value: stats.Cancelled,
      icon: XCircle,
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  /* ============================================================
     NO STORE ID
  ============================================================ */

  if (!storeId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
          <Store
            size={42}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Store information not found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Please login again to access store orders.
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
              <ShoppingBag
                size={24}
                className="text-green-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Orders
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage orders for{" "}
                <span className="font-semibold text-gray-700">
                  {storeName}
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* STORE INFO */}

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <Store
              size={19}
              className="text-blue-600"
            />
          </div>

          <div>
            <p className="text-xs text-blue-500">
              Store Orders
            </p>

            <p className="text-sm font-bold text-blue-800">
              {storeName}
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}
              >
                <Icon
                  size={19}
                  className={item.iconColor}
                />
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {item.label}
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* SEARCH / FILTER */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search order ID, customer, phone or product..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
          {STATUS_FILTERS.map((status) => (
            <button
              type="button"
              key={status}
              onClick={() =>
                setActiveFilter(status)
              }
              className={`
                whitespace-nowrap
                px-3.5 py-2
                rounded-xl
                text-xs font-semibold
                border
                transition
                ${
                  activeFilter === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS */}

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto text-blue-600 animate-spin"
            />

            <p className="text-sm text-gray-500 mt-3">
              Loading store orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ShoppingBag
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-700">
              No orders found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {search || activeFilter !== "All"
                ? "Try changing your search or filter."
                : `No orders found for ${storeName}.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const orderKey =
              order._id || order.orderId;

            const expanded =
              expandedOrder === orderKey;

            const actionLabel =
              getActionLabel(order.status);

            const actionIcon =
              getActionIcon(order.status);

            const updating =
              updatingOrder === orderKey;

            return (
              <div
                key={orderKey}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >

                {/* ORDER HEADER */}

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                    {/* ORDER */}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-900">
                          {order.orderId ||
                            order._id}
                        </h3>

                        <StatusBadge
                          status={order.status}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />

                          {formatDate(
                            order.createdAt
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <Package size={13} />

                          {order.items?.length || 0}{" "}
                          item
                          {order.items?.length ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </div>
                    </div>

                    {/* CUSTOMER */}

                    <div className="min-w-[180px]">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Customer
                      </p>

                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {order.user?.name ||
                          order.deliveryAddress?.name ||
                          "Customer"}
                      </p>

                      {(order.user?.phone ||
                        order.deliveryAddress
                          ?.phone) && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Phone size={12} />

                          {order.user?.phone ||
                            order.deliveryAddress
                              ?.phone}
                        </p>
                      )}
                    </div>

                    {/* PAYMENT */}

                    <div className="min-w-[100px]">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Payment
                      </p>

                      <div className="mt-1">
                        <PaymentBadge
                          method={
                            order.paymentMethod
                          }
                          status={
                            order.paymentStatus
                          }
                        />
                      </div>
                    </div>

                    {/* TOTAL */}

                    <div className="min-w-[110px] xl:text-right">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Total
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatMoney(
                          order.totalAmount
                        )}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrder(
                          expanded
                            ? null
                            : orderKey
                        )
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp size={17} />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={17} />
                          View Details
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {[
                        "Placed",
                        "Confirmed",
                        "Packed",
                      ].includes(order.status) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancel(order)
                          }
                          disabled={updating}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={16} />

                          Cancel
                        </button>
                      )}

                      {actionLabel && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusAction(
                              order
                            )
                          }
                          disabled={updating}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-50"
                        >
                          {updating ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            actionIcon
                          )}

                          {updating
                            ? "Updating..."
                            : actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* DETAILS */}

                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                      {/* ITEMS */}

                      <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Package
                            size={18}
                            className="text-blue-600"
                          />

                          <h4 className="font-bold text-gray-900">
                            Order Items
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {order.items?.map(
                            (item, index) => (
                              <div
                                key={
                                  item.variant ||
                                  item.product ||
                                  index
                                }
                                className="flex gap-3 p-3 rounded-xl border border-gray-100"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={
                                      item.name
                                    }
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Package
                                      size={22}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-800 text-sm">
                                    {item.name}
                                  </p>

                                  {item.brand && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.brand}
                                    </p>
                                  )}

                                  {item.sku && (
                                    <p className="text-[11px] text-gray-400 mt-1">
                                      SKU:{" "}
                                      {item.sku}
                                    </p>
                                  )}

                                  {item.attributes &&
                                    Object.keys(
                                      item.attributes
                                    ).length >
                                      0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {Object.entries(
                                          item.attributes
                                        ).map(
                                          ([
                                            key,
                                            value,
                                          ]) => (
                                            <span
                                              key={
                                                key
                                              }
                                              className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-600"
                                            >
                                              {key}:{" "}
                                              {String(
                                                value
                                              )}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>

                                <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900">
                                    {formatMoney(
                                      Number(
                                        item.price ||
                                          0
                                      ) *
                                        Number(
                                          item.quantity ||
                                            0
                                        )
                                    )}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.quantity} ×{" "}
                                    {formatMoney(
                                      item.price
                                    )}
                                  </p>

                                  {Number(
                                    item.mrp || 0
                                  ) >
                                    Number(
                                      item.price ||
                                        0
                                    ) && (
                                    <p className="text-[11px] text-gray-400 line-through mt-1">
                                      {formatMoney(
                                        item.mrp
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {/* TOTALS */}

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Subtotal
                            </span>

                            <span className="font-medium">
                              {formatMoney(
                                order.subtotal
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Delivery Charge
                            </span>

                            <span className="font-medium">
                              {formatMoney(
                                order.deliveryCharge
                              )}
                            </span>
                          </div>

                          {Number(
                            order.discount || 0
                          ) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Discount
                              </span>

                              <span className="font-medium text-green-600">
                                -
                                {formatMoney(
                                  order.discount
                                )}
                              </span>
                            </div>
                          )}

                          {Number(
                            order.tax || 0
                          ) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Tax
                              </span>

                              <span className="font-medium">
                                {formatMoney(
                                  order.tax
                                )}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between pt-2 border-t border-gray-100">
                            <span className="font-bold text-gray-900">
                              Total
                            </span>

                            <span className="text-lg font-bold text-blue-600">
                              {formatMoney(
                                order.totalAmount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE */}

                      <div className="space-y-4">

                        {/* CUSTOMER */}

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <User
                              size={18}
                              className="text-blue-600"
                            />

                            <h4 className="font-bold text-gray-900">
                              Customer
                            </h4>
                          </div>

                          <p className="font-semibold text-gray-800">
                            {order.user?.name ||
                              order.deliveryAddress
                                ?.name ||
                              "-"}
                          </p>

                          {order.user?.email && (
                            <p className="text-xs text-gray-500 mt-1">
                              {order.user.email}
                            </p>
                          )}

                          {(order.user?.phone ||
                            order.deliveryAddress
                              ?.phone) && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Phone size={12} />

                              {order.user?.phone ||
                                order.deliveryAddress
                                  ?.phone}
                            </p>
                          )}
                        </div>

                        {/* ADDRESS */}

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin
                              size={18}
                              className="text-red-500"
                            />

                            <h4 className="font-bold text-gray-900">
                              Delivery Address
                            </h4>
                          </div>

                          <p className="text-sm font-semibold text-gray-800">
                            {order.deliveryAddress
                              ?.name || "-"}
                          </p>

                          <p className="text-sm text-gray-600 mt-1 leading-6">
                            {[
                              order.deliveryAddress
                                ?.doorNo,
                              order.deliveryAddress
                                ?.street,
                              order.deliveryAddress
                                ?.landmark,
                              order.deliveryAddress
                                ?.city,
                              order.deliveryAddress
                                ?.state,
                              order.deliveryAddress
                                ?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          {order.deliveryAddress
                            ?.phone && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Phone size={12} />

                              {
                                order
                                  .deliveryAddress
                                  .phone
                              }
                            </p>
                          )}
                        </div>

                        {/* SHIPMENT */}

                        {(order.courier ||
                          order.trackingId ||
                          order.estimatedDelivery) && (
                          <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Truck
                                size={18}
                                className="text-orange-600"
                              />

                              <h4 className="font-bold text-gray-900">
                                Shipment
                              </h4>
                            </div>

                            {order.courier && (
                              <div className="flex justify-between gap-3 text-sm mb-2">
                                <span className="text-gray-500">
                                  Courier
                                </span>

                                <span className="font-semibold text-gray-800">
                                  {order.courier}
                                </span>
                              </div>
                            )}

                            {order.trackingId && (
                              <div className="flex justify-between gap-3 text-sm mb-2">
                                <span className="text-gray-500">
                                  Tracking
                                </span>

                                <span className="font-semibold text-gray-800 break-all text-right">
                                  {order.trackingId}
                                </span>
                              </div>
                            )}

                            {order.estimatedDelivery && (
                              <div className="flex justify-between gap-3 text-sm">
                                <span className="text-gray-500">
                                  Estimated
                                </span>

                                <span className="font-semibold text-gray-800">
                                  {formatDate(
                                    order.estimatedDelivery
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* NOTES */}

                        {(order.customerNote ||
                          order.adminNote) && (
                          <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle
                                size={18}
                                className="text-gray-500"
                              />

                              <h4 className="font-bold text-gray-900">
                                Notes
                              </h4>
                            </div>

                            {order.customerNote && (
                              <div className="mb-2">
                                <p className="text-[11px] uppercase text-gray-400">
                                  Customer Note
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                  {order.customerNote}
                                </p>
                              </div>
                            )}

                            {order.adminNote && (
                              <div>
                                <p className="text-[11px] uppercase text-gray-400">
                                  Admin Note
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                  {order.adminNote}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================
          SHIPMENT MODAL
      ====================================================== */}

      {shipmentModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setShipmentModal(false)
            }
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Ship Order
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Order {selectedOrder.orderId}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShipmentModal(false)
                }
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleShipmentSubmit}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Courier Partner
                </label>

                <input
                  type="text"
                  value={shipmentData.courier}
                  onChange={(e) =>
                    setShipmentData(
                      (prev) => ({
                        ...prev,
                        courier:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Delhivery, Blue Dart, DTDC"
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tracking ID
                </label>

                <input
                  type="text"
                  value={
                    shipmentData.trackingId
                  }
                  onChange={(e) =>
                    setShipmentData(
                      (prev) => ({
                        ...prev,
                        trackingId:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Enter tracking number"
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Estimated Delivery
                </label>

                <input
                  type="date"
                  value={
                    shipmentData.estimatedDelivery
                  }
                  onChange={(e) =>
                    setShipmentData(
                      (prev) => ({
                        ...prev,
                        estimatedDelivery:
                          e.target.value,
                      })
                    )
                  }
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                />
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <div className="flex gap-2">
                  <Send
                    size={17}
                    className="text-blue-600 mt-0.5"
                  />

                  <p className="text-xs text-blue-700 leading-5">
                    After submitting shipment
                    details, the order status will
                    move from{" "}
                    <strong>Packed</strong> to{" "}
                    <strong>Shipped</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShipmentModal(false)
                  }
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    updatingOrder ===
                    (selectedOrder._id ||
                      selectedOrder.orderId)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingOrder ===
                  (selectedOrder._id ||
                    selectedOrder.orderId) ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Truck size={16} />
                  )}

                  Ship Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}