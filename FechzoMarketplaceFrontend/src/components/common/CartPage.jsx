import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  /* EMPTY CART */
  if (!cart.length) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-5 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF4FF] text-[#154FCB]">
            <ShoppingBag size={38} />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Looks like you haven't added anything to your cart yet.
            Start shopping and find something you love.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-[#154FCB] px-6 text-sm font-semibold text-white no-underline transition hover:bg-[#103DA1]"
          >
            Start Shopping
            <ArrowRight size={17} />
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8 lg:px-10">

      <div className="mx-auto max-w-[1250px]">

        {/* PAGE HEADER */}
        <div className="mb-7">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
              <ShoppingBag size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Your Cart
              </h1>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {cart.length}{" "}
                {cart.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* CART ITEMS */}
          <div className="space-y-4">

            {cart.map((item) => {

              const price =
                item.discountPrice > 0
                  ? item.discountPrice
                  : item.price;

              const itemTotal =
                Number(price) * Number(item.quantity);

              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                >

                  <div className="flex gap-4">

                    {/* IMAGE */}
                    <Link
                      to={`/${item.category || "product"}/product/${item._id}`}
                      className="block shrink-0"
                    >
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-gray-50 sm:h-28 sm:w-28">

                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingBag
                            size={30}
                            className="text-gray-300"
                          />
                        )}

                      </div>
                    </Link>

                    {/* PRODUCT DETAILS */}
                    <div className="min-w-0 flex-1">

                      {item.brand && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#154FCB]">
                          {item.brand}
                        </p>
                      )}

                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
                        {item.name}
                      </h3>

                      {/* PRICE */}
                      <div className="mt-2 flex items-center gap-2">

                        <span className="text-base font-bold text-[#154FCB]">
                          ₹{Number(price).toLocaleString("en-IN")}
                        </span>

                        {item.discountPrice > 0 &&
                          item.price > item.discountPrice && (
                            <del className="text-xs text-gray-400">
                              ₹
                              {Number(item.price).toLocaleString(
                                "en-IN"
                              )}
                            </del>
                          )}

                      </div>

                      {/* QUANTITY + REMOVE */}
                      <div className="mt-4 flex flex-wrap items-center gap-4">

                        {/* QUANTITY */}
                        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-gray-200">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-full w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="flex h-full min-w-9 items-center justify-center border-x border-gray-200 px-2 text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50"
                          >
                            <Plus size={14} />
                          </button>

                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item._id)
                          }
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 transition hover:text-red-600"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>

                      </div>

                    </div>

                    {/* ITEM TOTAL */}
                    <div className="hidden text-right sm:block">

                      <p className="text-[11px] text-gray-400">
                        Item Total
                      </p>

                      <p className="mt-1 text-base font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </p>

                    </div>

                  </div>

                  {/* MOBILE ITEM TOTAL */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 sm:hidden">

                    <span className="text-xs text-gray-500">
                      Item Total
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                      ₹{itemTotal.toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>
              );
            })}

            {/* CONTINUE SHOPPING */}
            <div className="pt-2">

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#154FCB] no-underline hover:text-[#103DA1]"
              >
                <ArrowRight
                  size={16}
                  className="rotate-180"
                />
                Continue Shopping
              </Link>

            </div>

          </div>

          {/* ORDER SUMMARY */}
          <div>

            <div className="sticky top-28 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900">
                Order Summary
              </h2>

              {/* SUMMARY */}
              <div className="mt-5 space-y-3 border-b border-gray-100 pb-5">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹{Number(cartTotal).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span className="font-medium text-green-600">
                    FREE
                  </span>
                </div>

              </div>

              {/* TOTAL */}
              <div className="flex items-center justify-between py-5">

                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#154FCB]">
                  ₹{Number(cartTotal).toLocaleString("en-IN")}
                </span>

              </div>

              {/* CHECKOUT */}
              <Link
                to="/checkout"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#154FCB] text-sm font-semibold text-white no-underline shadow-md shadow-blue-100 transition hover:bg-[#103DA1]"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </Link>

              {/* BENEFITS */}
              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
                    <Truck size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Fast Delivery
                    </p>

                    <p className="text-[10px] text-gray-500">
                      Quick doorstep delivery
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Secure Checkout
                    </p>

                    <p className="text-[10px] text-gray-500">
                      Your payment is protected
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