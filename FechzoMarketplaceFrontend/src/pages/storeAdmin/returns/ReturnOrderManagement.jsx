
import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Package,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Box,  
  CreditCard,
  User,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Store,
  IndianRupee,
} from "lucide-react";

import api from "../../../api/api";

/* ============================================================
   RETURN STATUS CONFIG
============================================================ */

const RETURN_STATUS_CONFIG = {
  Requested: {
    label: "Requested",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Clock,
  },

  Approved: {
    label: "Approved",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: CheckCircle,
  },

  Rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },

  "Pickup Scheduled": {
    label: "Pickup Scheduled",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: CalendarDays,
  },

  "Picked Up": {
    label: "Picked Up",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Truck,
  },

  Received: {
    label: "Received",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    icon: Box,
  },

  Refunded: {
    label: "Refunded",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CreditCard,
  },

  Cancelled: {
    label: "Cancelled",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: XCircle,
  },
};

/* ============================================================
   FILTERS
============================================================ */

const STATUS_FILTERS = [
  "All",
  "Requested",
  "Approved",
  "Rejected",
  "Pickup Scheduled",
  "Picked Up",
  "Received",
  "Refunded",
  "Cancelled",
];

/* ============================================================
   REFUND STATUS CONFIG
============================================================ */

const REFUND_STATUS_CONFIG = {
  Pending: {
    text: "text-orange-600",
    bg: "bg-orange-50",
  },

  Processing: {
    text: "text-blue-600",
    bg: "bg-blue-50",
  },

  Completed: {
    text: "text-green-600",
    bg: "bg-green-50",
  },

  Failed: {
    text: "text-red-600",
    bg: "bg-red-50",
  },
};

/* ============================================================
   STATUS BADGE
============================================================ */

function ReturnStatusBadge({ status }) {
  const config =
    RETURN_STATUS_CONFIG[status] ||
    RETURN_STATUS_CONFIG.Requested;

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
   REFUND STATUS BADGE
============================================================ */

function RefundStatusBadge({ status }) {
  const config =
    REFUND_STATUS_CONFIG[status] ||
    REFUND_STATUS_CONFIG.Pending;

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-1
        rounded-lg
        text-[11px]
        font-semibold
        ${config.bg}
        ${config.text}
      `}
    >
      {status || "Pending"}
    </span>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function ReturnOrderManagement() {
  /* ============================================================
     STATE
  ============================================================ */

  const [returns, setReturns] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [expandedReturn, setExpandedReturn] =
    useState(null);

  const [selectedReturn, setSelectedReturn] =
    useState(null);

  const [statusModal, setStatusModal] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [statusReason, setStatusReason] =
    useState("");

  const [updatingReturn, setUpdatingReturn] =
    useState(null);

  const [storeId, setStoreId] =
    useState(null);

  const [storeName, setStoreName] =
    useState("Store");

  /* ============================================================
     LOAD STORE
  ============================================================ */

  useEffect(() => {
    const storedStoreId =
      localStorage.getItem("storeId");

    const storedStore =
      localStorage.getItem("store");

    let parsedStore = null;

    if (storedStore) {
      try {
        parsedStore =
          JSON.parse(storedStore);
      } catch (error) {
        console.error(
          "Failed to parse store:",
          error
        );
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
     EXTRACT RETURNS
  ============================================================ */

  const extractReturns = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.returns)) {
      return data.returns;
    }

    if (Array.isArray(data?.returnRequests)) {
      return data.returnRequests;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (
      Array.isArray(data?.data?.returns)
    ) {
      return data.data.returns;
    }

    if (
      Array.isArray(
        data?.data?.returnRequests
      )
    ) {
      return data.data.returnRequests;
    }

    return [];
  };

  /* ============================================================
     FETCH STORE RETURNS
     
     Backend:
     GET /api/marketplace/returns/store/:storeId
  ============================================================ */

  const fetchReturns = async (
    showLoader = true
  ) => {
    if (!storeId) {
      setReturns([]);
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const endpoint =
        `/api/marketplace/returns/store/${storeId}`;

      console.log(
        "Fetching store returns:",
        endpoint
      );

      const response =
        await api.get(endpoint);

      const returnList =
        extractReturns(response);

      console.log(
        "Store return requests:",
        returnList
      );

      setReturns(returnList);
    } catch (error) {
      console.error(
        "Failed to fetch return requests:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to load return requests."
      );
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

    fetchReturns(true);
  }, [storeId]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = async () => {
    await fetchReturns(false);
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "-";
    }
  };

  /* ============================================================
     FORMAT MONEY
  ============================================================ */

  const formatMoney = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  /* ============================================================
     GET ORDER ID
  ============================================================ */

  const getOrderId = (returnRequest) => {
    return (
      returnRequest?.orderId ||
      returnRequest?.order?.orderId ||
      returnRequest?.order?._id ||
      "-"
    );
  };

  /* ============================================================
     GET RETURN ID
  ============================================================ */

  const getReturnId = (returnRequest) => {
    return (
      returnRequest?._id ||
      returnRequest?.returnId ||
      "-"
    );
  };

  /* ============================================================
     GET CUSTOMER NAME
  ============================================================ */

  const getCustomerName = (
    returnRequest
  ) => {
    return (
      returnRequest?.user?.name ||
      returnRequest?.customer?.name ||
      returnRequest?.order?.user?.name ||
      returnRequest?.deliveryAddress?.name ||
      "Customer"
    );
  };

  /* ============================================================
     GET CUSTOMER PHONE
  ============================================================ */

  const getCustomerPhone = (
    returnRequest
  ) => {
    return (
      returnRequest?.user?.phone ||
      returnRequest?.customer?.phone ||
      returnRequest?.order?.user?.phone ||
      returnRequest?.deliveryAddress?.phone ||
      ""
    );
  };

  /* ============================================================
     GET CUSTOMER EMAIL
  ============================================================ */

  const getCustomerEmail = (
    returnRequest
  ) => {
    return (
      returnRequest?.user?.email ||
      returnRequest?.customer?.email ||
      returnRequest?.order?.user?.email ||
      ""
    );
  };

  /* ============================================================
     GET PRODUCT NAME
  ============================================================ */

  const getProductName = (
    returnRequest
  ) => {
    return (
      returnRequest?.product?.name ||
      returnRequest?.productName ||
      returnRequest?.name ||
      "Product"
    );
  };

  /* ============================================================
     GET PRODUCT IMAGE
  ============================================================ */

  const getProductImage = (
    returnRequest
  ) => {
    return (
      returnRequest?.product?.image ||
      returnRequest?.productImage ||
      returnRequest?.image ||
      ""
    );
  };

  /* ============================================================
     FILTER + SEARCH
  ============================================================ */

  const filteredReturns = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return returns.filter(
      (returnRequest) => {
        /* STATUS */

        if (
          activeFilter !== "All" &&
          returnRequest?.status !==
            activeFilter
        ) {
          return false;
        }

        /* SEARCH */

        if (!searchValue) {
          return true;
        }

        const returnId =
          String(
            getReturnId(
              returnRequest
            )
          ).toLowerCase();

        const orderId =
          String(
            getOrderId(
              returnRequest
            )
          ).toLowerCase();

        const customer =
          String(
            getCustomerName(
              returnRequest
            )
          ).toLowerCase();

        const phone =
          String(
            getCustomerPhone(
              returnRequest
            )
          ).toLowerCase();

        const product =
          String(
            getProductName(
              returnRequest
            )
          ).toLowerCase();

        const reason =
          String(
            returnRequest?.reason ||
              ""
          ).toLowerCase();

        return (
          returnId.includes(
            searchValue
          ) ||
          orderId.includes(
            searchValue
          ) ||
          customer.includes(
            searchValue
          ) ||
          phone.includes(
            searchValue
          ) ||
          product.includes(
            searchValue
          ) ||
          reason.includes(
            searchValue
          )
        );
      }
    );
  }, [
    returns,
    search,
    activeFilter,
  ]);

  /* ============================================================
     STATS
  ============================================================ */

  const stats = useMemo(() => {
    const result = {
      total: returns.length,
      Requested: 0,
      Approved: 0,
      "Pickup Scheduled": 0,
      "Picked Up": 0,
      Received: 0,
      Refunded: 0,
      Rejected: 0,
    };

    returns.forEach(
      (returnRequest) => {
        const status =
          returnRequest?.status;

        if (
          result[status] !== undefined
        ) {
          result[status] += 1;
        }
      }
    );

    return result;
  }, [returns]);

  /* ============================================================
     OPEN STATUS MODAL
  ============================================================ */

  const openStatusModal = (
    returnRequest,
    status
  ) => {
    setSelectedReturn(
      returnRequest
    );

    setSelectedStatus(status);

    setStatusReason("");

    setStatusModal(true);
  };

  /* ============================================================
     CLOSE STATUS MODAL
  ============================================================ */

  const closeStatusModal = () => {
    setStatusModal(false);

    setSelectedReturn(null);

    setSelectedStatus("");

    setStatusReason("");
  };

  /* ============================================================
     UPDATE RETURN STATUS
     
     Backend:
     PATCH /api/marketplace/returns/:returnId/status
  ============================================================ */

  const updateReturnStatus = async (
    returnRequest,
    status,
    reason = ""
  ) => {
    if (!returnRequest) {
      return;
    }

    const returnId =
      returnRequest?._id ||
      returnRequest?.returnId;

    if (!returnId) {
      alert(
        "Return request ID not found."
      );
      return;
    }

    try {
      setUpdatingReturn(
        returnId
      );

      const endpoint =
        `/api/marketplace/returns/${returnId}/status`;

      const payload = {
        status,
      };

      if (reason?.trim()) {
        payload.reason =
          reason.trim();
      }

      console.log(
        "Updating return status:",
        {
          endpoint,
          payload,
        }
      );

      await api.patch(
        endpoint,
        payload
      );

      await fetchReturns(false);

      closeStatusModal();
    } catch (error) {
      console.error(
        "Return status update error:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to update return status."
      );
    } finally {
      setUpdatingReturn(null);
    }
  };

  /* ============================================================
     QUICK STATUS ACTION
  ============================================================ */

  const handleQuickStatus = (
    returnRequest,
    status
  ) => {
    openStatusModal(
      returnRequest,
      status
    );
  };

  /* ============================================================
     NEXT ACTION
  ============================================================ */

  const getNextAction = (
    returnRequest
  ) => {
    switch (
      returnRequest?.status
    ) {
      case "Requested":
        return {
          label: "Approve",
          status: "Approved",
        };

      case "Approved":
        return {
          label: "Schedule Pickup",
          status: "Pickup Scheduled",
        };

      case "Pickup Scheduled":
        return {
          label: "Mark Picked Up",
          status: "Picked Up",
        };

      case "Picked Up":
        return {
          label: "Mark Received",
          status: "Received",
        };

      case "Received":
        return {
          label: "Process Refund",
          status: "Refunded",
        };

      default:
        return null;
    }
  };

  /* ============================================================
     ACTION ICON
  ============================================================ */

  const getActionIcon = (
    status
  ) => {
    switch (status) {
      case "Approved":
        return (
          <CheckCircle size={16} />
        );

      case "Pickup Scheduled":
        return (
          <CalendarDays size={16} />
        );

      case "Picked Up":
        return (
          <Truck size={16} />
        );

      case "Received":
        return (
          <Box size={16} />
        );

      case "Refunded":
        return (
          <CreditCard size={16} />
        );

      default:
        return null;
    }
  };

  /* ============================================================
     STAT CARDS
  ============================================================ */

  const statCards = [
    {
      label: "Total Returns",
      value: stats.total,
      icon: RotateCcw,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    {
      label: "Requested",
      value: stats.Requested,
      icon: Clock,
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },

    {
      label: "Approved",
      value: stats.Approved,
      icon: CheckCircle,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },

    {
      label: "Pickup",
      value:
        stats["Pickup Scheduled"] +
        stats["Picked Up"],
      icon: Truck,
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },

    {
      label: "Received",
      value: stats.Received,
      icon: Package,
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },

    {
      label: "Refunded",
      value: stats.Refunded,
      icon: CreditCard,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  /* ============================================================
     NO STORE ID
  ============================================================ */

  if (!storeId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
          <Store
            size={42}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Store information not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please login again to manage
            return requests.
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

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <RotateCcw
                size={24}
                className="text-orange-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Return Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage return requests for{" "}
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
          className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl
            border border-gray-200
            bg-white
            px-4 py-2.5
            text-gray-700
            transition
            hover:bg-gray-50
            disabled:opacity-50
          "
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

      {/* ======================================================
          STORE INFO
      ====================================================== */}

      <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Store
              size={19}
              className="text-orange-600"
            />
          </div>

          <div>
            <p className="text-xs text-orange-500">
              Store Returns
            </p>

            <p className="text-sm font-bold text-orange-800">
              {storeName}
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

        {statCards.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={item.label}
                className="
                  rounded-2xl
                  border border-gray-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div
                  className={`
                    flex h-10 w-10
                    items-center
                    justify-center
                    rounded-xl
                    ${item.bg}
                  `}
                >
                  <Icon
                    size={19}
                    className={
                      item.iconColor
                    }
                  />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {item.label}
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* ======================================================
          SEARCH / FILTER
      ====================================================== */}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="
              Search return ID, order ID,
              customer, phone or product...
            "
            className="
              h-11
              w-full
              rounded-xl
              border border-gray-200
              pl-10 pr-4
              text-sm
              outline-none
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
            "
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

          {STATUS_FILTERS.map(
            (status) => (
              <button
                type="button"
                key={status}
                onClick={() =>
                  setActiveFilter(
                    status
                  )
                }
                className={`
                  whitespace-nowrap
                  rounded-xl
                  border
                  px-3.5 py-2
                  text-xs
                  font-semibold
                  transition
                  ${
                    activeFilter ===
                    status
                      ? "border-orange-600 bg-orange-600 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {status}
              </button>
            )
          )}

        </div>
      </div>

      {/* ======================================================
          RETURN LIST
      ====================================================== */}

      <div className="space-y-4">

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">

            <RefreshCw
              size={30}
              className="
                mx-auto
                animate-spin
                text-orange-600
              "
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading return requests...
            </p>

          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">

            <RotateCcw
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-700">
              No return requests found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search ||
              activeFilter !== "All"
                ? "Try changing your search or filter."
                : `No return requests found for ${storeName}.`}
            </p>

          </div>
        ) : (
          filteredReturns.map(
            (returnRequest) => {

              const returnKey =
                returnRequest?._id ||
                returnRequest?.returnId;

              const expanded =
                expandedReturn ===
                returnKey;

              const nextAction =
                getNextAction(
                  returnRequest
                );

              const updating =
                updatingReturn ===
                returnKey;

              const productImage =
                getProductImage(
                  returnRequest
                );

              return (
                <div
                  key={returnKey}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border border-gray-200
                    bg-white
                    shadow-sm
                  "
                >

                  {/* ==================================================
                      HEADER
                  ================================================== */}

                  <div className="p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                      {/* PRODUCT */}

                      <div className="flex min-w-0 flex-1 items-center gap-3">

                        {productImage ? (
                          <img
                            src={
                              productImage
                            }
                            alt={
                              getProductName(
                                returnRequest
                              )
                            }
                            className="
                              h-14 w-14
                              rounded-xl
                              border
                              border-gray-200
                              object-cover
                            "
                          />
                        ) : (
                          <div className="
                            flex h-14 w-14
                            items-center
                            justify-center
                            rounded-xl
                            bg-gray-100
                          ">
                            <Package
                              size={22}
                              className="text-gray-400"
                            />
                          </div>
                        )}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="truncate font-bold text-gray-900">
                              {getProductName(
                                returnRequest
                              )}
                            </h3>

                            <ReturnStatusBadge
                              status={
                                returnRequest?.status
                              }
                            />

                          </div>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">

                            <span>
                              Return:{" "}
                              <b className="text-gray-700">
                                {getReturnId(
                                  returnRequest
                                )}
                              </b>
                            </span>

                            <span>
                              Order:{" "}
                              <b className="text-gray-700">
                                {getOrderId(
                                  returnRequest
                                )}
                              </b>
                            </span>

                          </div>

                        </div>
                      </div>

                      {/* CUSTOMER */}

                      <div className="min-w-[180px]">

                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Customer
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <User size={13} />

                          {getCustomerName(
                            returnRequest
                          )}
                        </p>

                        {getCustomerPhone(
                          returnRequest
                        ) && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone size={12} />

                            {getCustomerPhone(
                              returnRequest
                            )}
                          </p>
                        )}

                      </div>

                      {/* REASON */}

                      <div className="min-w-[170px]">

                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Return Reason
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {returnRequest?.reason ||
                            "-"}
                        </p>

                      </div>

                      {/* REFUND */}

                      <div className="min-w-[120px]">

                        <p className="text-[11px] uppercase tracking-wide text-gray-400">
                          Refund
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-lg font-bold text-gray-900">
                          <IndianRupee
                            size={15}
                          />

                          {Number(
                            returnRequest?.refundAmount ||
                              returnRequest?.itemPrice ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <div className="mt-1">
                          <RefundStatusBadge
                            status={
                              returnRequest?.refundStatus
                            }
                          />
                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="
                      mt-5
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-3
                      border-t
                      border-gray-100
                      pt-4
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReturn(
                            expanded
                              ? null
                              : returnKey
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          px-3 py-2
                          text-sm
                          font-medium
                          text-gray-600
                          hover:bg-gray-100
                        "
                      >
                        {expanded ? (
                          <>
                            <ChevronUp
                              size={17}
                            />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown
                              size={17}
                            />
                            View Details
                          </>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">

                        {/* REJECT */}

                        {[
                          "Requested",
                          "Approved",
                        ].includes(
                          returnRequest?.status
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatus(
                                returnRequest,
                                "Rejected"
                              )
                            }
                            disabled={updating}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-red-200
                              px-3 py-2
                              text-sm
                              font-semibold
                              text-red-600
                              hover:bg-red-50
                              disabled:opacity-50
                            "
                          >
                            <XCircle
                              size={16}
                            />

                            Reject
                          </button>
                        )}

                        {/* NEXT ACTION */}

                        {nextAction && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatus(
                                returnRequest,
                                nextAction.status
                              )
                            }
                            disabled={updating}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              bg-orange-600
                              px-4 py-2
                              text-sm
                              font-semibold
                              text-white
                              shadow-sm
                              hover:bg-orange-700
                              disabled:opacity-50
                            "
                          >
                            {updating ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              getActionIcon(
                                nextAction.status
                              )
                            )}

                            {updating
                              ? "Updating..."
                              : nextAction.label}
                          </button>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      DETAILS
                  ================================================== */}

                  {expanded && (
                    <div className="
                      border-t
                      border-gray-100
                      bg-gray-50/70
                      p-4 sm:p-5
                    ">

                      <div className="
                        grid
                        grid-cols-1
                        gap-4
                        xl:grid-cols-3
                      ">

                        {/* PRODUCT DETAILS */}

                        <div className="
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          p-4
                        ">

                          <div className="mb-4 flex items-center gap-2">
                            <Package
                              size={18}
                              className="text-orange-600"
                            />

                            <h4 className="font-semibold text-gray-800">
                              Product Details
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">

                            <div>
                              <p className="text-xs text-gray-400">
                                Product
                              </p>

                              <p className="font-semibold text-gray-800">
                                {getProductName(
                                  returnRequest
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                SKU
                              </p>

                              <p className="font-medium text-gray-700">
                                {returnRequest?.sku ||
                                  returnRequest?.product?.sku ||
                                  "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Quantity
                              </p>

                              <p className="font-semibold text-gray-800">
                                {returnRequest?.quantity ||
                                  1}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Item Price
                              </p>

                              <p className="font-semibold text-gray-800">
                                {formatMoney(
                                  returnRequest?.itemPrice
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Refund Amount
                              </p>

                              <p className="font-bold text-green-600">
                                {formatMoney(
                                  returnRequest?.refundAmount
                                )}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* CUSTOMER DETAILS */}

                        <div className="
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          p-4
                        ">

                          <div className="mb-4 flex items-center gap-2">
                            <User
                              size={18}
                              className="text-blue-600"
                            />

                            <h4 className="font-semibold text-gray-800">
                              Customer Details
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">

                            <div>
                              <p className="text-xs text-gray-400">
                                Name
                              </p>

                              <p className="font-semibold text-gray-800">
                                {getCustomerName(
                                  returnRequest
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Phone
                              </p>

                              <p className="flex items-center gap-2 font-medium text-gray-700">
                                <Phone size={13} />

                                {getCustomerPhone(
                                  returnRequest
                                ) || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Email
                              </p>

                              <p className="flex items-center gap-2 break-all font-medium text-gray-700">
                                <Mail size={13} />

                                {getCustomerEmail(
                                  returnRequest
                                ) || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Order ID
                              </p>

                              <p className="font-semibold text-gray-800">
                                {getOrderId(
                                  returnRequest
                                )}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* RETURN DETAILS */}

                        <div className="
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          p-4
                        ">

                          <div className="mb-4 flex items-center gap-2">
                            <RotateCcw
                              size={18}
                              className="text-orange-600"
                            />

                            <h4 className="font-semibold text-gray-800">
                              Return Details
                            </h4>
                          </div>

                          <div className="space-y-3 text-sm">

                            <div>
                              <p className="text-xs text-gray-400">
                                Return ID
                              </p>

                              <p className="break-all font-semibold text-gray-800">
                                {getReturnId(
                                  returnRequest
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Reason
                              </p>

                              <p className="font-semibold text-gray-700">
                                {returnRequest?.reason ||
                                  "-"}
                              </p>
                            </div>

                            {returnRequest?.reasonDetails && (
                              <div>
                                <p className="text-xs text-gray-400">
                                  Additional Details
                                </p>

                                <p className="text-gray-700">
                                  {
                                    returnRequest.reasonDetails
                                  }
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-gray-400">
                                Requested At
                              </p>

                              <p className="flex items-center gap-2 font-medium text-gray-700">
                                <CalendarDays
                                  size={13}
                                />

                                {formatDate(
                                  returnRequest?.createdAt ||
                                    returnRequest?.requestedAt
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Current Status
                              </p>

                              <div className="mt-1">
                                <ReturnStatusBadge
                                  status={
                                    returnRequest?.status
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Refund Status
                              </p>

                              <div className="mt-1">
                                <RefundStatusBadge
                                  status={
                                    returnRequest?.refundStatus
                                  }
                                />
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* STATUS TIMELINE */}

                      <div className="
                        mt-4
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        p-4
                      ">

                        <div className="mb-4 flex items-center gap-2">
                          <Clock
                            size={18}
                            className="text-gray-600"
                          />

                          <h4 className="font-semibold text-gray-800">
                            Return Status
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          {[
                            "Requested",
                            "Approved",
                            "Pickup Scheduled",
                            "Picked Up",
                            "Received",
                            "Refunded",
                          ].map(
                            (status) => (
                              <div
                                key={status}
                                className={
                                  returnRequest?.status ===
                                  status
                                    ? "rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                                    : "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400"
                                }
                              >
                                {status}
                              </div>
                            )
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )
        )}

      </div>

      {/* ========================================================
          STATUS UPDATE MODAL
      ======================================================== */}

      {statusModal &&
        selectedReturn && (
          <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          ">

            <div className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              shadow-2xl
            ">

              {/* HEADER */}

              <div className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                p-5
              ">

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Update Return Status
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Return ID:{" "}
                    {getReturnId(
                      selectedReturn
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeStatusModal
                  }
                  className="
                    rounded-lg
                    p-2
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-600
                  "
                >
                  <XCircle
                    size={20}
                  />
                </button>

              </div>

              {/* BODY */}

              <div className="space-y-4 p-5">

                <div className="
                  rounded-xl
                  border
                  border-orange-100
                  bg-orange-50
                  p-4
                ">

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={19}
                      className="
                        mt-0.5
                        flex-shrink-0
                        text-orange-600
                      "
                    />

                    <div>
                      <p className="text-sm font-semibold text-orange-800">
                        Status Change
                      </p>

                      <p className="mt-1 text-xs text-orange-700">
                        Change return request from{" "}
                        <b>
                          {
                            selectedReturn?.status
                          }
                        </b>{" "}
                        to{" "}
                        <b>
                          {selectedStatus}
                        </b>
                      </p>
                    </div>

                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  ">
                    New Status
                  </label>

                  <select
                    value={
                      selectedStatus
                    }
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.value
                      )
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-3
                      text-sm
                      outline-none
                      focus:border-orange-500
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  >
                    {STATUS_FILTERS
                      .filter(
                        (status) =>
                          status !== "All"
                      )
                      .map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* REASON */}

                <div>
                  <label className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  ">
                    Note / Reason
                  </label>

                  <textarea
                    value={
                      statusReason
                    }
                    onChange={(e) =>
                      setStatusReason(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="
                      Add a note or reason
                      for this status update...
                    "
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      p-3
                      text-sm
                      outline-none
                      focus:border-orange-500
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  />
                </div>

              </div>

              {/* FOOTER */}

              <div className="
                flex
                items-center
                justify-end
                gap-2
                border-t
                border-gray-100
                p-5
              ">

                <button
                  type="button"
                  onClick={
                    closeStatusModal
                  }
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4 py-2.5
                    text-sm
                    font-semibold
                    text-gray-600
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    updatingReturn ===
                    (selectedReturn?._id ||
                      selectedReturn?.returnId)
                  }
                  onClick={() =>
                    updateReturnStatus(
                      selectedReturn,
                      selectedStatus,
                      statusReason
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-orange-600
                    px-5 py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-orange-700
                    disabled:opacity-50
                  "
                >

                  {updatingReturn ===
                  (selectedReturn?._id ||
                    selectedReturn?.returnId) ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle
                        size={16}
                      />

                      Update Status
                    </>
                  )}

                </button>

              </div>

            </div>
          </div>
        )}
    </div>
  );
}

