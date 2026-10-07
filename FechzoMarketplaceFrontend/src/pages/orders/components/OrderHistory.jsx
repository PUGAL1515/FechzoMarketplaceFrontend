import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  PackageOpen,
} from "lucide-react";

import api from "../../../api/api";

import AllOrders from "./AllOrders";
import OrderDetails from "./OrderDetails";
import OrderTracking from "./OrderTracking";

export default function OrderHistory() {
  /* ============================================================
     STATE
  ============================================================ */

  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [view, setView] = useState("orders");

  const [loading, setLoading] =
    useState(true);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] = useState("");

  /* ============================================================
     GET USER ID
  ============================================================ */

  const getUserId = () => {
    const profileString =
      localStorage.getItem("userProfile");

    if (profileString) {
      try {
        const profile =
          JSON.parse(profileString);

        return (
          profile?._id ||
          profile?.id ||
          profile?.userId ||
          profile?.user?._id ||
          profile?.user?.id ||
          null
        );
      } catch (error) {
        console.error(
          "Invalid userProfile:",
          error
        );
      }
    }

    return (
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      null
    );
  };

  /* ============================================================
     EXTRACT ORDERS
  ============================================================ */

  const extractOrders = (response) => {
    const data = response?.data;

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

    if (
      Array.isArray(data?.data?.orders)
    ) {
      return data.data.orders;
    }

    if (
      Array.isArray(data?.data?.results)
    ) {
      return data.data.results;
    }

    return [];
  };

  /* ============================================================
     EXTRACT RETURN REQUESTS
  ============================================================ */

  const extractReturnRequests = (response) => {
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
      Array.isArray(data?.data?.returnRequests)
    ) {
      return data.data.returnRequests;
    }

    return [];
  };

  /* ============================================================
     NORMALIZE ID
  ============================================================ */

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return (
        value?._id ||
        value?.id ||
        value?.orderId ||
        null
      );
    }

    return String(value);
  };

  /* ============================================================
     CHECK RETURN REQUEST BELONGS TO ORDER
  ============================================================ */

  const isReturnForOrder = (
    returnRequest,
    order
  ) => {
    if (!returnRequest || !order) {
      return false;
    }

    const returnOrderId =
      getId(returnRequest?.order);

    const returnCustomOrderId =
      returnRequest?.orderId;

    const orderMongoId =
      getId(order?._id);

    const orderCustomId =
      order?.orderId;

    /*
     * Match MongoDB _id
     */
    if (
      returnOrderId &&
      orderMongoId &&
      String(returnOrderId) ===
        String(orderMongoId)
    ) {
      return true;
    }

    /*
     * Match custom orderId
     */
    if (
      returnCustomOrderId &&
      orderCustomId &&
      String(returnCustomOrderId) ===
        String(orderCustomId)
    ) {
      return true;
    }

    /*
     * Sometimes returnRequest.order itself
     * can contain custom orderId.
     */
    if (
      typeof returnRequest?.order ===
        "object" &&
      returnRequest?.order?.orderId &&
      orderCustomId &&
      String(
        returnRequest.order.orderId
      ) === String(orderCustomId)
    ) {
      return true;
    }

    return false;
  };

  /* ============================================================
     ATTACH RETURN REQUESTS TO ORDERS
  ============================================================ */

  const attachReturnRequestsToOrders = (
    orderList,
    returnList
  ) => {
    return orderList.map((order) => {
      const matchingReturns =
        returnList.filter((returnRequest) =>
          isReturnForOrder(
            returnRequest,
            order
          )
        );

      /*
       * Sort latest return request first
       */
      const sortedReturns = [
        ...matchingReturns,
      ].sort(
        (a, b) =>
          new Date(
            b?.createdAt ||
              b?.requestedAt ||
              0
          ) -
          new Date(
            a?.createdAt ||
              a?.requestedAt ||
              0
          )
      );

      return {
        ...order,

        /*
         * Latest return request
         */
        returnRequest:
          sortedReturns[0] || null,

        /*
         * All return requests
         */
        returnRequests:
          sortedReturns,
      };
    });
  };

  /* ============================================================
     LOAD RETURN REQUESTS
  ============================================================ */

  const loadReturnRequests = async (
    userId
  ) => {
    if (!userId) {
      setReturnRequests([]);
      return [];
    }

    try {
      const response =
        await api.get(
          `/api/marketplace/returns/user/${userId}`
        );

      const requests =
        extractReturnRequests(
          response
        );

      console.log(
        "Loaded return requests:",
        requests
      );

      setReturnRequests(requests);

      return requests;
    } catch (error) {
      console.error(
        "Load return requests error:",
        error
      );

      /*
       * Return API failure should not
       * break normal order history.
       */
      setReturnRequests([]);

      return [];
    }
  };

  /* ============================================================
     LOAD ALL ORDERS
  ============================================================ */

  const loadOrders = async () => {
    const userId = getUserId();

    if (!userId) {
      setOrders([]);
      setReturnRequests([]);
      setLoading(false);

      setError(
        "Please login to view your orders."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      /* --------------------------------------------------------
         LOAD ORDERS
      -------------------------------------------------------- */

      const orderResponse =
        await api.get(
          `/api/marketplace/orders/user/${userId}`
        );

      const orderList =
        extractOrders(orderResponse);

      /* --------------------------------------------------------
         LOAD RETURN REQUESTS
      -------------------------------------------------------- */

      const returnList =
        await loadReturnRequests(
          userId
        );

      /* --------------------------------------------------------
         ATTACH RETURN DATA TO ORDERS
      -------------------------------------------------------- */

      const ordersWithReturns =
        attachReturnRequestsToOrders(
          orderList,
          returnList
        );

      /* --------------------------------------------------------
         SORT NEWEST FIRST
      -------------------------------------------------------- */

      const sortedOrders = [
        ...ordersWithReturns,
      ].sort(
        (a, b) =>
          new Date(
            b?.createdAt || 0
          ) -
          new Date(
            a?.createdAt || 0
          )
      );

      console.log(
        "Orders with return requests:",
        sortedOrders
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     LOAD SINGLE ORDER DETAILS
  ============================================================ */

  const fetchOrderDetails = async (
    identifier
  ) => {
    if (!identifier) {
      return null;
    }

    try {
      const response =
        await api.get(
          `/api/marketplace/orders/${identifier}`
        );

      const data =
        response?.data;

      return (
        data?.order ||
        data?.data ||
        data ||
        null
      );
    } catch (error) {
      console.error(
        "Fetch order details error:",
        error
      );

      throw error;
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadOrders();
  }, []);

  /* ============================================================
     OPEN ORDER DETAILS
  ============================================================ */

  const handleOpenOrder = async (
    order
  ) => {
    const identifier =
      order?.orderId ||
      order?._id;

    if (!identifier) {
      return;
    }

    try {
      setDetailsLoading(true);
      setError("");

      const details =
        await fetchOrderDetails(
          identifier
        );

      if (details) {
        /*
         * Preserve return information
         */
        setSelectedOrder({
          ...details,
          returnRequest:
            order?.returnRequest ||
            null,
          returnRequests:
            order?.returnRequests ||
            [],
        });
      } else {
        setSelectedOrder(order);
      }

      setView("details");
    } catch (error) {
      /*
       * Even if details API fails,
       * show the order from the list.
       */

      setSelectedOrder(order);
      setView("details");

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load complete order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ============================================================
     BACK TO ORDERS
  ============================================================ */

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setView("orders");
    setError("");
  };

  /* ============================================================
     TRACK ORDER
  ============================================================ */

  const handleTrackOrder = async (
    order
  ) => {
    const identifier =
      order?.orderId ||
      order?._id;

    if (!identifier) {
      return;
    }

    try {
      setError("");

      let trackingOrder =
        order;

      try {
        const latestOrder =
          await fetchOrderDetails(
            identifier
          );

        if (latestOrder) {
          trackingOrder = {
            ...latestOrder,

            /*
             * Keep return information
             */
            returnRequest:
              order?.returnRequest ||
              null,

            returnRequests:
              order?.returnRequests ||
              [],
          };
        }
      } catch (error) {
        console.warn(
          "Unable to refresh tracking data:",
          error
        );
      }

      setSelectedOrder(
        trackingOrder
      );

      setView("tracking");
    } catch (error) {
      console.error(
        "Track order error:",
        error
      );

      setSelectedOrder(order);
      setView("tracking");
    }
  };

  /* ============================================================
     CANCEL ORDER
  ============================================================ */

  const handleCancelOrder = async (
    order
  ) => {
    const identifier =
      order?.orderId ||
      order?._id;

    if (!identifier) {
      alert("Order ID not found.");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) {
      return;
    }

    const reason =
      window.prompt(
        "Please enter the reason for cancelling this order:"
      );

    if (reason === null) {
      return;
    }

    const trimmedReason =
      reason.trim();

    if (!trimmedReason) {
      alert(
        "Please enter a cancellation reason."
      );
      return;
    }

    try {
      console.log(
        "Cancelling order:",
        {
          orderId: identifier,
          reason: trimmedReason,
        }
      );

      await api.put(
        `/api/marketplace/orders/${identifier}/cancel`,
        {
          reason:
            trimmedReason,
        }
      );

      /*
       * Refresh order list
       */
      await loadOrders();

      /*
       * Refresh selected order
       */
      if (selectedOrder) {
        try {
          const latestOrder =
            await fetchOrderDetails(
              identifier
            );

          if (latestOrder) {
            setSelectedOrder(
              latestOrder
            );
          }
        } catch (error) {
          console.warn(
            "Unable to refresh selected order:",
            error
          );
        }
      }

      alert(
        "Order cancelled successfully."
      );
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.response?.data
            ?.error ||
          "Unable to cancel this order."
      );
    }
  };

  /* ============================================================
     RETURN ORDER
  ============================================================ */

  const handleReturnOrder = async (
    order
  ) => {
    try {
      if (!order) {
        alert("Order not found.");
        return;
      }

      /*
       * If return already exists,
       * don't allow duplicate request.
       */
      if (
        order?.returnRequest &&
        ![
          "Rejected",
          "Cancelled",
        ].includes(
          order.returnRequest.status
        )
      ) {
        alert(
          `Return request already exists.\n\nCurrent status: ${order.returnRequest.status}`
        );
        return;
      }

      if (
        order.status !==
        "Delivered"
      ) {
        alert(
          "Return can only be requested after delivery."
        );
        return;
      }

      /* --------------------------------------------------------
         RESOLVE ORDER IDENTIFIER
      -------------------------------------------------------- */

      const identifier =
        order?.orderId ||
        order?._id;

      if (!identifier) {
        alert(
          "Order ID is missing."
        );
        return;
      }

      /* --------------------------------------------------------
         FETCH LATEST ORDER DETAILS
      -------------------------------------------------------- */

      const latestOrder =
        await fetchOrderDetails(
          identifier
        );

      if (!latestOrder) {
        alert(
          "Unable to fetch latest order details."
        );
        return;
      }

      /* --------------------------------------------------------
         GET ORDER ITEMS
      -------------------------------------------------------- */

      const items =
        latestOrder?.items ||
        latestOrder?.orderItems ||
        latestOrder?.products ||
        [];

      if (!items.length) {
        alert(
          "No items found in this order."
        );
        return;
      }

      /* --------------------------------------------------------
         SELECT ITEM
      -------------------------------------------------------- */

      let selectedItem =
        items[0];

      if (items.length > 1) {
        const itemNames =
          items
            .map(
              (
                item,
                index
              ) =>
                `${
                  index + 1
                }. ${
                  item.name ||
                  item.productName ||
                  "Product"
                }`
            )
            .join("\n");

        const selectedIndex =
          window.prompt(
            `Select the item you want to return:\n\n${itemNames}\n\nEnter item number:`
          );

        const index =
          Number(
            selectedIndex
          ) - 1;

        if (
          !Number.isInteger(
            index
          ) ||
          index < 0 ||
          index >=
            items.length
        ) {
          alert(
            "Invalid item selection."
          );
          return;
        }

        selectedItem =
          items[index];
      }

      console.log(
        "Selected order item:",
        selectedItem
      );

      /* --------------------------------------------------------
         RESOLVE ORDER ITEM ID
      -------------------------------------------------------- */

      const orderItemId =
        selectedItem?.itemId;

      console.log(
        "Resolved orderItemId:",
        orderItemId
      );

      if (!orderItemId) {
        console.error(
          "Order item does not contain itemId:",
          selectedItem
        );

        alert(
          "Unable to identify this order item."
        );

        return;
      }

      /* --------------------------------------------------------
         RETURN REASON
      -------------------------------------------------------- */

      const allowedReasons = [
        "Size/Fit issue",
        "Wrong product received",
        "Damaged product",
        "Defective product",
        "Product not as expected",
        "Missing item",
        "Other",
      ];

      const reasonText =
        allowedReasons
          .map(
            (
              reason,
              index
            ) =>
              `${
                index + 1
              }. ${reason}`
          )
          .join("\n");

      const selectedReason =
        window.prompt(
          `Select return reason:\n\n${reasonText}\n\nEnter option number:`
        );

      if (
        selectedReason ===
        null
      ) {
        return;
      }

      const reasonIndex =
        Number(
          selectedReason
        ) - 1;

      if (
        !Number.isInteger(
          reasonIndex
        ) ||
        reasonIndex < 0 ||
        reasonIndex >=
          allowedReasons.length
      ) {
        alert(
          "Please select a valid return reason."
        );
        return;
      }

      const trimmedReason =
        allowedReasons[
          reasonIndex
        ];

      /* --------------------------------------------------------
         CREATE RETURN REQUEST
      -------------------------------------------------------- */

      console.log(
        "Submitting return request:",
        {
          orderId:
            identifier,
          orderItemId,
          quantity:
            selectedItem?.quantity ||
            1,
          reason:
            trimmedReason,
        }
      );

      const response =
        await api.post(
          "/api/marketplace/returns",
          {
            orderId:
              identifier,

            orderItemId,

            quantity:
              selectedItem?.quantity ||
              1,

            reason:
              trimmedReason,
          }
        );

      console.log(
        "Return request response:",
        response.data
      );

      alert(
        response.data?.message ||
          "Return request submitted successfully."
      );

      /* --------------------------------------------------------
         IMPORTANT
         Reload BOTH orders and return requests
      -------------------------------------------------------- */

      await loadOrders();

      /* --------------------------------------------------------
         REFRESH SELECTED ORDER
      -------------------------------------------------------- */

      if (
        selectedOrder
      ) {
        try {
          const refreshedOrder =
            await fetchOrderDetails(
              identifier
            );

          /*
           * Find newly-created return
           */
          const userId =
            getUserId();

          let latestReturns =
            returnRequests;

          if (userId) {
            try {
              const returnResponse =
                await api.get(
                  `/api/marketplace/returns/user/${userId}`
                );

              latestReturns =
                extractReturnRequests(
                  returnResponse
                );

              setReturnRequests(
                latestReturns
              );
            } catch (error) {
              console.warn(
                "Unable to refresh return requests:",
                error
              );
            }
          }

          const matchingReturns =
            latestReturns.filter(
              (
                returnRequest
              ) =>
                isReturnForOrder(
                  returnRequest,
                  refreshedOrder ||
                    order
                )
            );

          const sortedReturns =
            [
              ...matchingReturns,
            ].sort(
              (a, b) =>
                new Date(
                  b?.createdAt ||
                    b?.requestedAt ||
                    0
                ) -
                new Date(
                  a?.createdAt ||
                    a?.requestedAt ||
                    0
                )
            );

          if (
            refreshedOrder
          ) {
            setSelectedOrder({
              ...refreshedOrder,

              returnRequest:
                sortedReturns[0] ||
                null,

              returnRequests:
                sortedReturns,
            });
          }
        } catch (error) {
          console.warn(
            "Unable to refresh selected order after return:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "========== RETURN ERROR =========="
      );

      console.error(
        "Status:",
        error?.response
          ?.status
      );

      console.error(
        "Response:",
        error?.response
          ?.data
      );

      console.error(
        "Request:",
        error?.config?.data
      );

      console.error(
        "Full error:",
        error
      );

      console.error(
        "=================================="
      );

      const message =
        error?.response
          ?.data?.error ||
        error?.response
          ?.data?.message ||
        "Unable to submit return request.";

      alert(message);
    }
  };

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry = () => {
    loadOrders();
  };

  /* ============================================================
     LOADING SCREEN
  ============================================================ */

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

  /* ============================================================
     ERROR + NO ORDERS
  ============================================================ */

  if (
    error &&
    !orders.length &&
    view === "orders"
  ) {
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
            onClick={
              handleRetry
            }
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ======================================================
            ORDERS LIST
        ====================================================== */}

        {view === "orders" && (
          <>
            {error &&
              orders.length > 0 && (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {error}
                </div>
              )}

            <AllOrders
              orders={orders}

              onOpenOrder={
                handleOpenOrder
              }

              onTrackOrder={
                handleTrackOrder
              }

              onCancelOrder={
                handleCancelOrder
              }

              refreshOrders={
                loadOrders
              }

              onReturnOrder={
                handleReturnOrder
              }
            />
          </>
        )}

        {/* ======================================================
            ORDER DETAILS
        ====================================================== */}

        {view === "details" && (
          <>
            <button
              onClick={
                handleBackToOrders
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
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
                order={
                  selectedOrder
                }

                onTrackOrder={
                  handleTrackOrder
                }

                onCancelOrder={
                  handleCancelOrder
                }
              />
            )}
          </>
        )}

        {/* ======================================================
            ORDER TRACKING
        ====================================================== */}

        {view === "tracking" && (
          <>
            <button
              onClick={() => {
                setView(
                  "details"
                );
                setError("");
              }}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Order Details
            </button>

            <OrderTracking
              order={
                selectedOrder
              }
            />
          </>
        )}
      </div>
    </div>
  );
}