import React, { useEffect, useState } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // ============================================================
  // FETCH WISHLIST
  // ============================================================

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/wishlist", {
        withCredentials: true,
      });

      const items = response?.data?.wishlist || [];

      setWishlist(items);
    } catch (error) {
      console.error("Wishlist fetch error:", error);

      if (error?.response?.status === 401) {
        navigate("/login");
        return;
      }

      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ============================================================
  // REMOVE FROM WISHLIST
  // ============================================================

  const removeWishlist = async (productId) => {
    if (!productId) return;

    try {
      setRemovingId(productId);

      await api.delete("/api/wishlist", {
        data: {
          productId,
        },
        withCredentials: true,
      });

      setWishlist((previous) =>
        previous.filter(
          (item) =>
            String(item?.productId?._id) !== String(productId)
        )
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setRemovingId(null);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getProductImage = (product) => {
    if (!product) return "";

    return (
      product.thumbnail ||
      product.images?.[0] ||
      product.variants?.[0]?.images?.[0] ||
      ""
    );
  };

  const getProductPrice = (product) => {
    if (!product) return 0;

    return (
      Number(product.price) ||
      Number(product.variants?.[0]?.price) ||
      0
    );
  };

  const getProductMrp = (product) => {
    if (!product) return 0;

    const price = getProductPrice(product);

    return (
      Number(product.mrp) ||
      Number(product.variants?.[0]?.mrp) ||
      price
    );
  };

  const getDiscount = (price, mrp) => {
    if (!price || !mrp || mrp <= price) return 0;

    return Math.round(((mrp - price) / mrp) * 100);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] py-5">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-5">
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
            </div>

            <div className="divide-y">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-5 flex gap-5"
                >
                  <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" />

                  <div className="flex-1 space-y-4">
                    <div className="h-5 w-2/3 bg-gray-200 animate-pulse rounded" />

                    <div className="h-7 w-32 bg-gray-200 animate-pulse rounded" />

                    <div className="h-10 w-36 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY WISHLIST
  // ============================================================

  if (!wishlist.length) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] py-5">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-5">
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <Heart
                size={21}
                className="fill-red-500 text-red-500"
              />

              <h1 className="text-xl font-semibold">
                My Wishlist
              </h1>

              <span className="text-sm text-gray-500">
                (0)
              </span>
            </div>

            <div className="py-20 px-5 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <Heart
                  size={48}
                  className="text-red-400"
                />
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mt-6">
                Your Wishlist is Empty
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Save your favourite products and find them here
                anytime.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-6 inline-flex items-center gap-2 bg-[#2874f0] hover:bg-[#1d66d5] text-white px-7 py-3 rounded-sm font-semibold text-sm transition"
              >
                Continue Shopping
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // WISHLIST
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-5 pb-10">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5">

        {/* HEADER */}

        <div className="bg-white border border-gray-200 rounded-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Heart
              size={21}
              className="fill-red-500 text-red-500"
            />

            <h1 className="text-xl font-semibold text-gray-800">
              My Wishlist
            </h1>

            <span className="text-sm text-gray-500">
              ({wishlist.length})
            </span>
          </div>

          {/* PRODUCTS */}

          <div className="divide-y divide-gray-200">
            {wishlist.map((item) => {
              const product = item?.productId;

              if (!product) return null;

              const productId = product._id;

              const image = getProductImage(product);

              const price = getProductPrice(product);

              const mrp = getProductMrp(product);

              const discount = getDiscount(price, mrp);

              const isRemoving =
                String(removingId) === String(productId);

              return (
                <div
                  key={item._id || productId}
                  className="p-4 sm:p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* IMAGE */}

                    <div
                      className="w-full sm:w-36 h-40 sm:h-36 shrink-0 flex items-center justify-center bg-white cursor-pointer"
                      onClick={() =>
                        navigate(`/product/${productId}`)
                      }
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name || "Product"}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="flex-1 min-w-0">

                      {/* BRAND */}

                      {product.brand && (
                        <p className="text-xs font-semibold text-[#2874f0] mb-1">
                          {product.brand}
                        </p>
                      )}

                      {/* PRODUCT NAME */}

                      <h2
                        onClick={() =>
                          navigate(`/product/${productId}`)
                        }
                        className="text-base sm:text-lg font-medium text-gray-800 hover:text-[#2874f0] cursor-pointer line-clamp-2"
                      >
                        {product.name ||
                          product.productName ||
                          "Product"}
                      </h2>

                      {/* PRICE */}

                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-semibold text-gray-900">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        {mrp > price && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>

                            <span className="text-sm font-semibold text-green-600">
                              {discount}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* STOCK */}

                      <div className="mt-3">
                        {Array.isArray(product.variants) &&
                        product.variants.length > 0 ? (
                          (() => {
                            const totalStock =
                              product.variants.reduce(
                                (total, variant) =>
                                  total +
                                  Math.max(
                                    0,
                                    Number(
                                      variant?.stock || 0
                                    )
                                  ),
                                0
                              );

                            return totalStock > 0 ? (
                              <span className="text-xs font-medium text-green-600">
                                ✓ In Stock
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-red-500">
                                Out of Stock
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-xs font-medium text-green-600">
                            ✓ Available
                          </span>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-5 flex flex-wrap gap-3">

                        <button
                          onClick={() =>
                            navigate(`/product/${productId}`)
                          }
                          className="inline-flex items-center justify-center gap-2 bg-[#ff9f00] hover:bg-[#f39a00] text-white px-5 py-2.5 rounded-sm font-semibold text-sm transition"
                        >
                          <ShoppingCart size={17} />
                          VIEW PRODUCT
                        </button>

                        <button
                          onClick={() =>
                            removeWishlist(productId)
                          }
                          disabled={isRemoving}
                          className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 px-5 py-2.5 rounded-sm text-gray-700 font-medium text-sm transition disabled:opacity-60"
                        >
                          {isRemoving ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}

                          {isRemoving
                            ? "REMOVING..."
                            : "REMOVE"}
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}