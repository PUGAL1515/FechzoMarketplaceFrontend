import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Package,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "../../context/CartContext";     
export default function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  // ============================================================
  // GET USER DATA
  // ============================================================
  useEffect(() => {
    try {
      const token = localStorage.getItem("jwt_token");
      const storedUser =
        localStorage.getItem("userProfile") ||
        localStorage.getItem("user") ||
        localStorage.getItem("profile");
      if (!token) {
        navigate("/login", {
          replace: true,
          state: {
            from: "/order",
          },
        });
        return;
      }
      let parsedUser = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (error) {
          console.error("User profile parse error:", error);
        }
      }
      setUser(parsedUser);
      if (parsedUser) {
        setAddress({
          name:
            parsedUser.name ||
            parsedUser.fullName ||
            parsedUser.username ||
            "",
          phone:
            parsedUser.phone ||
            parsedUser.mobile ||
            parsedUser.phoneNumber ||
            "",
          address:
            parsedUser.address ||
            parsedUser.addressLine1 ||
            "",
          city: parsedUser.city || "",
          state: parsedUser.state || "",
          pincode:
            parsedUser.pincode ||
            parsedUser.pinCode ||
            parsedUser.zipCode ||
            "",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  // ============================================================
  // ORDER ITEMS
  // ============================================================
  const orderItems = useMemo(() => {
    if (location.state?.product) {
      const product = location.state.product;
      return [
        {
          ...product,
          quantity: Number(location.state.quantity) || 1,
          selectedVariant:
            location.state.selectedVariant ||
            product.selectedVariant ||
            product.variant ||
            null,
        },
      ];
    }
    return cart || [];
  }, [cart, location.state]);
  // ============================================================
  // HELPERS
  // ============================================================
  const getVariant = (item) => {
    return item?.selectedVariant || item?.variant || null;
  };
  const getPrice = (item) => {
    const variant = getVariant(item);
    if (
      variant?.price !== undefined &&
      variant?.price !== null &&
      variant?.price !== ""
    ) {
      return Number(variant.price) || 0;
    }
    if (
      item?.discountPrice !== undefined &&
      item?.discountPrice !== null &&
      Number(item.discountPrice) > 0
    ) {
      return Number(item.discountPrice);
    }
    return Number(item?.price || 0);
  };
  const getImage = (item) => {
    const variant = getVariant(item);
    return (
      variant?.image ||
      variant?.images?.[0] ||
      item?.image ||
      item?.thumbnail ||
      item?.images?.[0] ||
      "https://via.placeholder.com/150x150?text=Product"
    );
  };
  const getAttributes = (item) => {
    const variant = getVariant(item);
    if (
      variant?.attributes &&
      typeof variant.attributes === "object" &&
      !Array.isArray(variant.attributes)
    ) {
      return variant.attributes;
    }
    if (
      item?.selectedAttributes &&
      typeof item.selectedAttributes === "object" &&
      !Array.isArray(item.selectedAttributes)
    ) {
      return item.selectedAttributes;
    }
    return {};
  };
  // ============================================================
  // TOTAL
  // ============================================================
  const subtotal = orderItems.reduce((total, item) => {
    const price = getPrice(item);
    const quantity = Number(item?.quantity) || 1;
    return total + price * quantity;
  }, 0);

  const deliveryCharge = 0;

  const totalAmount = subtotal + deliveryCharge;

  // ============================================================
  // USER VALIDATION
  // ============================================================

  const isUserDetailsComplete =
    address.name.trim() &&
    address.phone.trim() &&
    address.address.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.pincode.trim();

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      navigate("/login", {
        state: {
          from: "/order",
        },
      });

      return;
    }

    if (!isUserDetailsComplete) {
      alert("Please enter all delivery details.");
      return;
    }

    if (!orderItems.length) {
      alert("No products available for order.");
      return;
    }

    /*
      IMPORTANT:

      Backend order API can be connected here.

      Example:

      const response = await api.post("/api/orders", {
        items: orderItems,
        deliveryAddress: address,
        paymentMethod,
        totalAmount,
      });
    */

    console.log("ORDER DATA:", {
      user,
      items: orderItems,
      deliveryAddress: address,
      paymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
    });

    alert("Order details are ready. Connect your Order API here.");

    // After successful API response:
    // navigate("/order-success");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">
          Loading order details...
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (!orderItems.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
            <Package
              size={32}
              className="text-[#2874f0]"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No items to order
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please add a product to your cart or select a product from
            wishlist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 w-full h-11 rounded-lg bg-[#2874f0] text-white font-bold text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Order Details
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your delivery details and place your order
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

          {/* ====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-5">

            {/* USER / DELIVERY DETAILS */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-[#2874f0]"
                />

                <h2 className="font-bold text-slate-900">
                  Delivery Address
                </h2>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* NAME */}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Full Name
                  </label>

                  <div className="relative mt-1">
                    <User
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          name: e.target.value,
                        })
                      }
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0]"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Phone Number
                  </label>

                  <div className="relative mt-1">
                    <Phone
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          phone: e.target.value,
                        })
                      }
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0]"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Address
                  </label>

                  <textarea
                    rows={3}
                    value={address.address}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        address: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0] resize-none"
                    placeholder="House / Flat / Street / Area"
                  />
                </div>

                {/* CITY */}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    City
                  </label>

                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        city: e.target.value,
                      })
                    }
                    className="w-full h-11 mt-1 px-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0]"
                    placeholder="City"
                  />
                </div>

                {/* STATE */}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    State
                  </label>

                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        state: e.target.value,
                      })
                    }
                    className="w-full h-11 mt-1 px-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0]"
                    placeholder="State"
                  />
                </div>

                {/* PINCODE */}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Pincode
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        pincode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full h-11 mt-1 px-3 rounded-lg border border-slate-300 outline-none focus:border-[#2874f0]"
                    placeholder="Pincode"
                  />
                </div>

              </div>

              {!isUserDetailsComplete && (
                <div className="mx-5 mb-5 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-orange-700">
                    Please complete all delivery details before placing the
                    order.
                  </p>
                </div>
              )}

              {isUserDetailsComplete && (
                <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />

                  <p className="text-xs font-semibold text-emerald-700">
                    Delivery details are complete.
                  </p>
                </div>
              )}
            </div>

            {/* ==================================================
                PRODUCTS
            =================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-bold text-slate-900">
                  Order Items
                </h2>
              </div>

              <div className="divide-y divide-slate-100">

                {orderItems.map((item, index) => {
                  const price = getPrice(item);
                  const quantity =
                    Number(item?.quantity) || 1;

                  const image = getImage(item);
                  const attributes = getAttributes(item);

                  return (
                    <div
                      key={`${item?._id || index}-${index}`}
                      className="p-4 sm:p-5 flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                        <img
                          src={image}
                          alt={item?.name || "Product"}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/150x150?text=Product";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">

                        <h3 className="text-sm font-semibold text-slate-900">
                          {item?.name || "Product"}
                        </h3>

                        {item?.brand && (
                          <p className="text-xs text-slate-400 mt-1">
                            {item.brand}
                          </p>
                        )}

                        {Object.keys(attributes).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(attributes).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="text-[10px] bg-slate-100 px-2 py-1 rounded"
                                >
                                  {key}: {String(value)}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-bold">
                            ₹{price.toLocaleString("en-IN")}
                          </span>

                          <span className="text-xs text-slate-500">
                            Qty: {quantity}
                          </span>
                        </div>

                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          ₹{(price * quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* ==================================================
                PAYMENT
            =================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <CreditCard
                  size={18}
                  className="text-[#2874f0]"
                />

                <h2 className="font-bold text-slate-900">
                  Payment Method
                </h2>
              </div>

              <div className="p-5">

                <label className="flex items-center gap-3 border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() =>
                      setPaymentMethod("COD")
                    }
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Cash on Delivery
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Pay when your order is delivered
                    </p>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* ====================================================
              RIGHT SUMMARY
          ===================================================== */}

          <div className="lg:sticky lg:top-5">

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                  Order Summary
                </h2>
              </div>

              <div className="p-5 space-y-4">

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Items
                  </span>

                  <span className="font-semibold text-slate-800">
                    {orderItems.reduce(
                      (sum, item) =>
                        sum +
                        (Number(item?.quantity) || 1),
                      0
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Subtotal
                  </span>

                  <span className="text-slate-800">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Delivery
                  </span>

                  <span className="text-emerald-600 font-semibold">
                    FREE
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4">

                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={!isUserDetailsComplete}
                  className="w-full h-12 rounded-lg bg-[#ff9f00] hover:bg-[#f39200] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm transition"
                >
                  Place Order
                </button>

                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-3">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-600"
                  />

                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Safe & Secure Checkout
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your order information is protected
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}