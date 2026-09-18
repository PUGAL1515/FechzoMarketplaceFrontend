import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, PackageOpen } from "lucide-react";

import api from "../../api/api";

import AllOrders from "./components/AllOrders";
import OrderDetails from "./components/OrderDetails";
import OrderTracking from "./components/OrderTracking";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [view, setView] = useState("orders");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // GET USER ID
  // ============================================================

  const getUserId = () => {
    const profileString = localStorage.getItem("userProfile");

    if (profileString) {
      try {
        const profile = JSON.parse(profileString);

        return (
          profile?._id ||
          profile?.id ||
          profile?.userId ||
          profile?.user?._id ||
          profile?.user?.id ||
          null
        );
      } catch (error) {
        console.error("Invalid userProfile:", error);
      }
    }

    return (
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      null
    );
  };

  // ============================================================
  // EXTRACT ORDERS
  // ============================================================
const extractOrders = (response) => {
  const data = response?.data;
  console.log("Extracting orders from response:", data);
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.orders)) {
    return data.data.orders;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  return [];
};

  // ============================================================
  // LOAD ALL ORDERS
  // ============================================================

  const loadOrders = async () => {
    const userId = getUserId();

    if (!userId) {
      setLoading(false);
      setError("Please login to view your orders.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/marketplace/orders/user/${userId}`
      );

      const orderList = extractOrders(response);
      console.log("Fetched orders:", orderList);
      const sortedOrders = [...orderList].sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Load orders error:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadOrders();
  }, []);

  // ============================================================
  // OPEN ORDER DETAILS
  // ============================================================

  const handleOpenOrder = async (order) => {
    const identifier = order?.orderId || order?._id;

    if (!identifier) return;

    try {
      setDetailsLoading(true);
      setError("");

      /*
       * Existing backend:
       * GET /api/marketplace/orders/:orderId
       */

      const response = await api.get(
        `/api/marketplace/orders/${identifier}`
      );

      const data = response?.data;

      const details =
        data?.order ||
        data?.data ||
        data;

      setSelectedOrder(details);
      setView("details");
    } catch (error) {
      console.error("Load order details error:", error);

      /*
       * If detail API fails but list already contains
       * order data, show that data instead.
       */

      setSelectedOrder(order);
      setView("details");

      setError(
        error?.response?.data?.message ||
          "Unable to load complete order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================================
  // BACK TO ORDERS
  // ============================================================

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setView("orders");
    setError("");
  };

  // ============================================================
  // OPEN TRACKING
  // ============================================================

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setView("tracking");
    setError("");
  };

  // ============================================================
  // CANCEL ORDER
  // ============================================================

  const handleCancelOrder = async (order) => {
    const identifier = order?.orderId || order?._id;

    if (!identifier) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      await api.put(
        `/api/marketplace/orders/${identifier}/cancel`,
        {}
      );

      await loadOrders();

      /*
       * Refresh selected order if user is currently
       * viewing its details.
       */

      if (selectedOrder) {
        const response = await api.get(
          `/api/marketplace/orders/${identifier}`
        );

        const data = response?.data;

        setSelectedOrder(
          data?.order ||
            data?.data ||
            data
        );
      }

      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Cancel order error:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to cancel this order."
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading your orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR / LOGIN
  // ============================================================

  if (error && !orders.length && view === "orders") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <PackageOpen className="h-7 w-7 text-slate-400" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            My Orders
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ================================================== */}
        {/* ORDERS */}
        {/* ================================================== */}

        {view === "orders" && (
          <AllOrders
            orders={orders}
            onOpenOrder={handleOpenOrder}
            onTrackOrder={handleTrackOrder}
            onCancelOrder={handleCancelOrder}
            refreshOrders={loadOrders}
          />
        )}

        {/* ================================================== */}
        {/* DETAILS */}
        {/* ================================================== */}

        {view === "details" && (
          <>
            <button
              onClick={handleBackToOrders}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Orders
            </button>

            {detailsLoading ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading order details...
                </p>
              </div>
            ) : (
              <OrderDetails
                order={selectedOrder}
                onTrackOrder={handleTrackOrder}
                onCancelOrder={handleCancelOrder}
              />
            )}
          </>
        )}

        {/* ================================================== */}
        {/* TRACKING */}
        {/* ================================================== */}

        {view === "tracking" && (
          <>
            <button
              onClick={() => {
                setView("details");
              }}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Order Details
            </button>

            <OrderTracking
              order={selectedOrder}
            />
          </>
        )}

      </div>
    </div>
  );
}