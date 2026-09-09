import React from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // ============================================================
  // HELPERS
  // ============================================================

  const getVariant = (item) => {
    return item?.selectedVariant || item?.variant || null;
  };

  // ------------------------------------------------------------
  // VARIANT ID
  // ------------------------------------------------------------

  const getVariantId = (item) => {
    const variant = getVariant(item);

    return (
      item?.variantId ||
      variant?._id ||
      variant?.sku ||
      "default"
    );
  };

  // ------------------------------------------------------------
  // CART ITEM UNIQUE ID
  // Product + Variant
  // ------------------------------------------------------------

  const getCartItemId = (item) => {
    if (!item?._id) return null;

    return `${item._id}-${getVariantId(item)}`;
  };

  // ------------------------------------------------------------
  // PRICE
  // ------------------------------------------------------------

  const getPrice = (item) => {
    const variant = getVariant(item);

    // Variant price has highest priority
    if (
      variant?.price !== undefined &&
      variant?.price !== null &&
      variant?.price !== ""
    ) {
      return Number(variant.price) || 0;
    }

    // Product discount price
    if (
      item?.discountPrice !== undefined &&
      item?.discountPrice !== null &&
      Number(item.discountPrice) > 0
    ) {
      return Number(item.discountPrice);
    }

    // Product normal price
    return Number(item?.price || 0);
  };

  // ------------------------------------------------------------
  // MRP
  // ------------------------------------------------------------

  const getMrp = (item) => {
    const variant = getVariant(item);

    if (
      variant?.mrp !== undefined &&
      variant?.mrp !== null &&
      variant?.mrp !== ""
    ) {
      return Number(variant.mrp) || 0;
    }

    if (
      item?.mrp !== undefined &&
      item?.mrp !== null &&
      Number(item.mrp) > 0
    ) {
      return Number(item.mrp);
    }

    return Number(item?.price || 0);
  };

  // ------------------------------------------------------------
  // STOCK
  // ------------------------------------------------------------

  const getStock = (item) => {
    const variant = getVariant(item);

    if (variant) {
      const variantStock =
        variant?.stock ??
        variant?.quantity ??
        variant?.inventory ??
        variant?.stockQuantity;

      if (
        variantStock !== undefined &&
        variantStock !== null &&
        variantStock !== ""
      ) {
        return Math.max(0, Number(variantStock) || 0);
      }
    }

    const productStock =
      item?.stock ??
      item?.quantity ??
      item?.inventory ??
      item?.stockQuantity;

    return Math.max(0, Number(productStock) || 0);
  };

  // ------------------------------------------------------------
  // IMAGE
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // ATTRIBUTES
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // ATTRIBUTE NAME
  // ------------------------------------------------------------

  const formatAttributeName = (key) => {
    const labels = {
      color: "Color",
      size: "Size",
      ram: "RAM",
      storage: "Storage",
      capacity: "Capacity",
      weight: "Weight",
      material: "Material",
      memory: "Memory",
      model: "Model",
      type: "Type",
    };

    const normalized = String(key)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    return (
      labels[normalized] ||
      String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    );
  };

  // ------------------------------------------------------------
  // DISCOUNT %
  // ------------------------------------------------------------

  const getDiscountPercent = (item) => {
    const price = getPrice(item);
    const mrp = getMrp(item);

    if (!mrp || !price || mrp <= price) {
      return 0;
    }

    return Math.round(((mrp - price) / mrp) * 100);
  };

  // ============================================================
  // QUANTITY
  // ============================================================

  const handleDecrease = (item) => {
    const currentQuantity = Number(item?.quantity) || 1;

    if (currentQuantity <= 1) {
      return;
    }

    const cartItemId = getCartItemId(item);

    if (!cartItemId) {
      return;
    }

    updateQuantity(
      cartItemId,
      currentQuantity - 1
    );
  };

  const handleIncrease = (item) => {
    const stock = getStock(item);
    const currentQuantity = Number(item?.quantity) || 1;

    // No stock
    if (stock <= 0) {
      return;
    }

    // Maximum stock reached
    if (currentQuantity >= stock) {
      return;
    }

    const cartItemId = getCartItemId(item);

    if (!cartItemId) {
      return;
    }

    updateQuantity(
      cartItemId,
      currentQuantity + 1
    );
  };

  // ============================================================
  // TOTALS
  // ============================================================

  const calculatedTotal = cart.reduce(
    (total, item) => {
      const price = getPrice(item);
      const quantity = Number(item?.quantity) || 1;

      return total + price * quantity;
    },
    0
  );

  // Context total is the source of truth
  const finalCartTotal =
    typeof cartTotal === "number"
      ? cartTotal
      : calculatedTotal;

  const mrpTotal = cart.reduce(
    (total, item) => {
      const mrp = getMrp(item);
      const quantity = Number(item?.quantity) || 1;

      return total + mrp * quantity;
    },
    0
  );

  const totalDiscount = Math.max(
    0,
    mrpTotal - finalCartTotal
  );

  const itemCount = cart.reduce(
    (total, item) => {
      return (
        total +
        (Number(item?.quantity) || 1)
      );
    },
    0
  );

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
            <ShoppingBag
              size={38}
              className="text-[#2874f0]"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Looks like you haven't added anything
            to your cart yet.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-lg bg-[#2874f0] text-white text-sm font-bold hover:bg-[#1769d5] transition"
          >
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-7">

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex items-center justify-between mb-5">

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              My Cart
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#2874f0] hover:underline"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ======================================================
            MAIN GRID
        ======================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">

          {/* ====================================================
              CART ITEMS
          ==================================================== */}

          <div className="space-y-3">

            {cart.map((item) => {

              const price = getPrice(item);
              const mrp = getMrp(item);
              const stock = getStock(item);
              const image = getImage(item);
              const attributes = getAttributes(item);
              const discount = getDiscountPercent(item);
              const variant = getVariant(item);

              const quantity =
                Number(item?.quantity) || 1;

              const itemTotal =
                price * quantity;

              const cartItemId =
                getCartItemId(item);

              const isOutOfStock =
                stock <= 0;

              const reachedStockLimit =
                stock > 0 &&
                quantity >= stock;

              return (
                <div
                  key={cartItemId}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                >

                  <div className="p-4 sm:p-5">

                    <div className="flex gap-4">

                      {/* ========================================
                          IMAGE
                      ======================================== */}

                      <Link
                        to={`/product/${item._id}`}
                        className="shrink-0"
                      >
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">

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
                      </Link>

                      {/* ========================================
                          PRODUCT INFO
                      ======================================== */}

                      <div className="flex-1 min-w-0">

                        <Link
                          to={`/product/${item._id}`}
                        >
                          <h2 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 hover:text-[#2874f0] transition">
                            {item?.name || "Product"}
                          </h2>
                        </Link>

                        {/* Brand */}

                        {item?.brand && (
                          <p className="text-xs text-slate-400 mt-1">
                            {item.brand}
                          </p>
                        )}

                        {/* ======================================
                            VARIANT DETAILS
                        ======================================= */}

                        {Object.keys(attributes).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">

                            {Object.entries(attributes).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="text-xs"
                                >
                                  <span className="text-slate-500">
                                    {formatAttributeName(key)}:
                                  </span>{" "}

                                  <span className="font-semibold text-slate-700">
                                    {String(value)}
                                  </span>
                                </div>
                              )
                            )}

                          </div>
                        )}

                        {/* SKU */}

                        {variant?.sku && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            SKU: {variant.sku}
                          </p>
                        )}

                        {/* ======================================
                            PRICE
                        ======================================= */}

                        <div className="flex items-center flex-wrap gap-2 mt-3">

                          <span className="text-lg font-bold text-slate-900">
                            ₹{price.toLocaleString("en-IN")}
                          </span>

                          {mrp > price && (
                            <>
                              <span className="text-sm text-slate-400 line-through">
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>

                              {discount > 0 && (
                                <span className="text-xs font-bold text-emerald-600">
                                  {discount}% off
                                </span>
                              )}
                            </>
                          )}

                        </div>

                        {/* ======================================
                            STOCK
                        ======================================= */}

                        {isOutOfStock && (
                          <p className="text-xs text-red-500 font-semibold mt-1">
                            Out of stock
                          </p>
                        )}

                        {!isOutOfStock &&
                          stock <= 5 && (
                            <p className="text-[11px] text-orange-600 font-semibold mt-1">
                              Only {stock} left
                            </p>
                          )}

                        {!isOutOfStock &&
                          reachedStockLimit && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Maximum available quantity reached
                            </p>
                          )}

                      </div>

                      {/* ========================================
                          ITEM TOTAL
                      ======================================== */}

                      <div className="hidden sm:block text-right shrink-0">

                        <p className="text-xs text-slate-400">
                          Item Total
                        </p>

                        <p className="text-base font-bold text-slate-900 mt-1">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </p>

                      </div>
                    </div>

                    {/* ==========================================
                        ACTIONS
                    =========================================== */}

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">

                      {/* Quantity */}

                      <div className="flex items-center gap-3">

                        <span className="text-xs font-medium text-slate-500">
                          Quantity
                        </span>

                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">

                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDecrease(item)
                            }
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Minus size={14} />
                          </button>

                          {/* QUANTITY */}

                          <span className="w-10 h-9 flex items-center justify-center border-x border-slate-300 text-sm font-semibold text-slate-800">
                            {quantity}
                          </span>

                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleIncrease(item)
                            }
                            disabled={
                              isOutOfStock ||
                              reachedStockLimit
                            }
                            aria-label="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Plus size={14} />
                          </button>

                        </div>

                        {stock > 0 && (
                          <span className="hidden sm:inline text-[10px] text-slate-400">
                            Max {stock}
                          </span>
                        )}

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(cartItemId)
                        }
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>

                    </div>

                    {/* Mobile Total */}

                    <div className="sm:hidden mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">

                      <span className="text-xs text-slate-500">
                        Item Total
                      </span>

                      <span className="font-bold text-slate-900">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* ====================================================
              SUMMARY
          ==================================================== */}

          <div className="lg:sticky lg:top-5">

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Summary Header */}

              <div className="px-5 py-4 border-b border-slate-200">

                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                  Price Details
                </h2>

              </div>

              {/* Summary */}

              <div className="p-5 space-y-4">

                {/* PRICE */}

                <div className="flex justify-between text-sm">

                  <span className="text-slate-600">
                    Price ({itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                    )
                  </span>

                  <span className="text-slate-800">
                    ₹{mrpTotal.toLocaleString("en-IN")}
                  </span>

                </div>

                {/* DISCOUNT */}

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">

                    <span className="text-slate-600">
                      Discount
                    </span>

                    <span className="text-emerald-600 font-medium">
                      - ₹
                      {totalDiscount.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>
                )}

                {/* DELIVERY */}

                <div className="flex justify-between text-sm">

                  <span className="text-slate-600">
                    Delivery
                  </span>

                  <span className="text-emerald-600 font-semibold">
                    FREE
                  </span>

                </div>

                {/* TOTAL */}

                <div className="border-t border-dashed border-slate-300 pt-4">

                  <div className="flex justify-between items-center">

                    <span className="text-base font-bold text-slate-900">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      ₹
                      {finalCartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

                {/* SAVINGS */}

                {totalDiscount > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">

                    <Tag
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-xs font-semibold text-emerald-700">
                      You are saving ₹
                      {totalDiscount.toLocaleString(
                        "en-IN"
                      )}{" "}
                      on this order
                    </span>

                  </div>
                )}

                {/* CHECKOUT */}

                <Link
                  to="/checkout"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#ff9f00] hover:bg-[#f39200] text-white font-bold text-sm transition-all shadow-sm"
                >
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </Link>

                {/* CONTINUE */}

                <Link
                  to="/"
                  className="w-full h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Continue Shopping
                </Link>

              </div>

              {/* SAFE PAYMENT */}

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">

                <div className="flex items-center gap-2">

                  <ShieldCheck
                    size={18}
                    className="text-emerald-600"
                  />

                  <div>

                    <p className="text-xs font-semibold text-slate-700">
                      Safe and Secure Payments
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      100% secure checkout
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ======================================================
            MOBILE CONTINUE SHOPPING
        ======================================================= */}

        <div className="sm:hidden mt-5">

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-slate-300 bg-white text-[#2874f0] text-sm font-bold"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>
    </div>
  );
}