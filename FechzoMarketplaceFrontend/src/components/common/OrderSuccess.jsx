import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  ShoppingBag,
  Truck,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
            <Package size={36} className="text-orange-500" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            No order found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            It looks like you opened this page directly.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 w-full h-12 rounded-xl bg-[#2874f0] text-white font-bold text-sm hover:bg-[#1a5dc8] transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    orderId,
    items = [],
    deliveryAddress = {},
    subtotal = 0,
    deliveryCharge = 0,
    totalAmount = 0,
    paymentMethod = "COD",
    status = "Placed",
    createdAt,
  } = order;

  const addressText = [
    deliveryAddress.doorNo,
    deliveryAddress.street,
    deliveryAddress.landmark,
    deliveryAddress.city,
    deliveryAddress.state,
    deliveryAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 relative overflow-hidden">
      {/* Soft decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-x-1/3 pointer-events-none" />

      {/* Simple confetti dots */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${8 + i * 5}%`,
                top: `${5 + (i % 5) * 8}%`,
                backgroundColor: [
                  "#10b981",
                  "#3b82f6",
                  "#f59e0b",
                  "#ec4899",
                  "#8b5cf6",
                ][i % 5],
                animationDelay: `${i * 0.12}s`,
                animationDuration: "1.4s",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* ========== SUCCESS HERO ========== */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-100/50 p-7 sm:p-10 text-center relative overflow-hidden">
          {/* Top green accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />

          {/* Animated check circle */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 size={52} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <Sparkles size={18} className="text-amber-400" />
          </div>

          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-md mx-auto">
            Thank you for shopping with us. We’re preparing your order and will
            notify you when it’s on the way.
          </p>

          {/* Order ID pill */}
          <div className="mt-6 inline-flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-lg">
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Order ID
              </p>
              <p className="text-base font-bold tracking-wide">{orderId}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="ml-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              title="Copy Order ID"
            >
              {copied ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} className="text-white" />
              )}
            </button>
          </div>

          {createdAt && (
            <p className="mt-4 text-xs text-slate-400">
              Placed on{" "}
              <span className="font-medium text-slate-500">
                {new Date(createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </p>
          )}
        </div>

        {/* ========== STATUS STRIP ========== */}
        <div className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Truck size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard size={20} className="text-[#2874f0]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Payment
              </p>
              <p className="text-sm font-bold text-slate-800">
                {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* ========== ADDRESS ========== */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin size={16} className="text-[#2874f0]" />
            </div>
            <h2 className="font-bold text-slate-900 text-sm">
              Delivery Address
            </h2>
          </div>
          <div className="p-5">
            {(deliveryAddress.name || deliveryAddress.phone) && (
              <p className="text-sm font-bold text-slate-900">
                {[deliveryAddress.name, deliveryAddress.phone]
                  .filter(Boolean)
                  .join("  •  ")}
              </p>
            )}
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              {addressText || "Address not available"}
            </p>
          </div>
        </div>

        {/* ========== ITEMS ========== */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package size={16} className="text-[#2874f0]" />
            </div>
            <h2 className="font-bold text-slate-900 text-sm">
              Order Items
              <span className="ml-2 text-xs font-semibold text-slate-400">
                ({items.length})
              </span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={index} className="p-4 sm:p-5 flex gap-4 hover:bg-slate-50/50 transition">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/150x150?text=Product"
                    }
                    alt={item.name || "Product"}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/150x150?text=Product";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.name || "Product"}
                  </h3>

                  {item.brand && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.brand}</p>
                  )}

                  {item.attributes &&
                    Object.keys(item.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Qty {item.quantity || 1}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 self-center">
                  <p className="text-sm font-extrabold text-slate-900">
                    ₹
                    {(
                      Number(item.price || 0) * (item.quantity || 1)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== PRICE SUMMARY ========== */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(subtotal).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Delivery Charge</span>
              <span className="font-semibold text-emerald-600">
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${Number(deliveryCharge).toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">
                Total Amount
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{Number(totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-13 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
          >
            <Home size={18} />
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="h-13 rounded-2xl bg-gradient-to-r from-[#2874f0] to-[#1a5dc8] text-white font-bold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 transition shadow-lg shadow-blue-200"
          >
            <ShoppingBag size={18} />
            View My Orders
            <ArrowRight size={16} />
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
          You’ll receive order updates on your registered phone & email.
          <br />
          Need help? Contact our support anytime.
        </p>
      </div>
    </div>
  );
}