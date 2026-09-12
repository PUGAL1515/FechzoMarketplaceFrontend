import React, { useEffect, useState } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowRight,
  Package,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";
export default function Wishlist() {
  const navigate = useNavigate();
  const {
    addToCart,
  } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  // ============================================================
  // FETCH WISHLIST
  // ============================================================
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/wishlist");
      const items = response?.data?.wishlist || [];
      // Remove invalid items
      const validItems = items.filter(
        (item) => item?.productId?._id
      );
      setWishlist(validItems);
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

  const removeWishlist = async (productId) => {
    if (!productId) return;
    try {
      setRemovingId(productId);
      await api.delete("/api/wishlist", {
        data: {
          productId,
        },
      });
      setWishlist((previous) =>
        previous.filter(
          (item) =>
            String(item?.productId?._id) !== String(productId)
        )
      );
      setAddedIds((previous) =>
        previous.filter(
          (id) => String(id) !== String(productId)
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
  // IMAGE HELPER
  // ============================================================
  const getProductImage = (product) => {
    if (!product) return "";
    if (product.thumbnail) {
      return product.thumbnail;
    }
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }
    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      for (const variant of product.variants) {
        if (
          Array.isArray(variant?.images) &&
          variant.images.length > 0
        ) {
          return variant.images[0];
        }
      }
    }
    return "";
  };
  // ============================================================
  // PRICE HELPER
  // ============================================================
  const getProductPrice = (product) => {
    if (!product) return 0;
    // Product level price
    if (
      product.price !== undefined &&
      product.price !== null &&
      Number(product.price) > 0
    ) {
      return Number(product.price);
    }
    // Variant price
    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      const validVariant = product.variants.find(
        (variant) =>
          Number(variant?.price) > 0
      );

      if (validVariant) {
        return Number(validVariant.price);
      }
    }
    return 0;
  };
  // ============================================================
  // MRP HELPER
  // ============================================================
  const getProductMrp = (product) => {
    if (!product) return 0;
    const price = getProductPrice(product);
    // Product level MRP
    if (
      product.mrp !== undefined &&
      product.mrp !== null &&
      Number(product.mrp) > 0
    ) {
      return Number(product.mrp);
    }
    // Variant MRP
    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      const validVariant = product.variants.find(
        (variant) =>
          Number(variant?.mrp) > 0
      );
      if (validVariant) {
        return Number(validVariant.mrp);
      }
    }
    return price;
  };
  // ============================================================
  // STOCK HELPER
  // ============================================================
  const getTotalStock = (product) => {
    if (!product) return 0;
    // Product level stock
    if (
      product.stock !== undefined &&
      product.stock !== null
    ) {
      return Math.max(0, Number(product.stock) || 0);
    }
    // Variant stock
    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      return product.variants.reduce(
        (total, variant) => {
          const stock = Number(variant?.stock) || 0;
          return total + Math.max(0, stock);
        },
        0
      );
    }
    // If no stock field exists,
    // consider product available
    return 1;
  };
  // ============================================================
  // STOCK STATUS
  // ============================================================
  const isProductInStock = (product) => {
    return getTotalStock(product) > 0;
  };
  // ============================================================
  // DISCOUNT
  // ============================================================
  const getDiscount = (price, mrp) => {
    if (
      !price ||
      !mrp ||
      mrp <= price
    ) {
      return 0;
    }
    return Math.round(
      ((mrp - price) / mrp) * 100
    );
  };
  // ============================================================
  // ADD TO CART
  // ============================================================
  const handleAddToCart = async (product) => {
    if (!product?._id) return;
    const productId = product._id;
    if (!isProductInStock(product)) {
      return;
    }
    try {
      setAddingId(productId);
      await addToCart(product);
      setAddedIds((previous) => {
        if (
          previous.some(
            (id) =>
              String(id) === String(productId)
          )
        ) {
          return previous;
        }

        return [...previous, productId];
      });
    } catch (error) {
      console.error(
        "Add wishlist product to cart error:",
        error
      );
    } finally {
      setAddingId(null);
    }
  };

  // ============================================================
  // PRODUCT PAGE
  // ============================================================

  const openProduct = (productId) => {
    if (!productId) return;

    navigate(`/product/${productId}`);
  };

  // ============================================================
  // AUTHENTICATION / USER CHECK
  // ============================================================

  const getAuthenticatedUser = () => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      return null;
    }

    let storedUser = null;

    const possibleKeys = [
      "userProfile",
      "user",
      "profile",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object") {
          storedUser = parsed;
          break;
        }
      } catch (error) {
        console.warn(`Unable to parse ${key}:`, error);
      }
    }
    return {
      token,
      user: storedUser,
    };
  };
  // ============================================================
  // ORDER NOW
  // ============================================================
  const handleOrderNow = (product) => {
    if (!product?._id) return;
    const auth = getAuthenticatedUser();
    // User is not logged in
    if (!auth?.token) {
      navigate("/login", {
        replace: false,
        state: {
          from: "/order",
          productId: product._id,
          message: "Please login to continue with your order.",
        },
      });
      return;
    }
    // Product is unavailable
    if (!isProductInStock(product)) {
      return;
    }
    // Move directly from Wishlist -> Order page
    navigate("/order", {
      state: {
        source: "wishlist",
        product,
        quantity: 1,
        selectedVariant: null,
        user: auth.user,
      },
    });
  };
  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] py-5">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-5">
          <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
            {/* Header Skeleton */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                <div>
                  <div className="h-5 w-40 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mt-2" />
                </div>
              </div>
            </div>
            {/* Product Skeleton */}
            <div className="divide-y divide-gray-200">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-5"
                >
                  <div className="flex gap-5">
                    <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" />
                    <div className="flex-1 space-y-4">
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                      <div className="flex gap-3">
                        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
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
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Heart
                  size={20}
                  className="text-red-500 fill-red-500"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  My Wishlist
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  0 items
                </p>
              </div>
            </div>
            {/* Empty */}
            <div className="py-20 px-5 text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <Heart
                  size={52}
                  strokeWidth={1.5}
                  className="text-red-400"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mt-6">
                Your Wishlist is Empty
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Save your favourite products here and
                easily find them whenever you want.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-7 inline-flex items-center gap-2 bg-[#2874f0] hover:bg-[#1d66d5] text-white px-7 py-3 rounded-sm font-semibold text-sm transition shadow-sm"
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
  // WISHLIST PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-5 pb-12">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5">
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          {/* ======================================================
              HEADER
          ====================================================== */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <Heart
                  size={20}
                  className="fill-red-500 text-red-500"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  My Wishlist
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {wishlist.length}{" "}
                  {wishlist.length === 1
                    ? "item"
                    : "items"}{" "}
                  saved
                </p>
              </div>
            </div>
          </div>
          {/* ======================================================
              PRODUCTS
          ====================================================== */}
          <div className="divide-y divide-gray-200">
            {wishlist.map((item) => {
              const product = item?.productId;
              if (!product?._id) {
                return null;
              }
              const productId = product._id;
              const image =
                getProductImage(product);
              const price =
                getProductPrice(product);
              const mrp =
                getProductMrp(product);
              const discount =
                getDiscount(price, mrp);
              const totalStock =
                getTotalStock(product);
              const inStock =
                totalStock > 0;
              const isRemoving =
                String(removingId) ===
                String(productId);
              const isAdding =
                String(addingId) ===
                String(productId);
              const isAdded =
                addedIds.some(
                  (id) =>
                    String(id) ===
                    String(productId)
                );
              return (
                <div
                  key={
                    item?._id ||
                    productId
                  }
                  className="p-4 sm:p-6 hover:bg-gray-50/70 transition"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* ==================================================
                        IMAGE
                    ================================================== */}
                    <div
                      className="w-full sm:w-40 h-48 sm:h-40 shrink-0 bg-white border border-gray-100 rounded-sm flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() =>
                        openProduct(productId)
                      }
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={
                            product.name ||
                            product.productName ||
                            "Product"
                          }
                          className="w-full h-full object-contain p-3 hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                          <Package size={38} />
                          <span className="text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    {/* ==================================================
                        PRODUCT DETAILS
                    ================================================== */}
                    <div className="flex-1 min-w-0">
                      {/* Brand */}
                      {product.brand && (
                        <p className="text-xs font-semibold text-[#2874f0] mb-1 uppercase">
                          {product.brand}
                        </p>
                      )}
                      {/* Product Name */}
                      <h2
                        onClick={() =>
                          openProduct(productId)
                        }
                        className="text-base sm:text-lg font-medium text-gray-800 hover:text-[#2874f0] cursor-pointer line-clamp-2 transition"
                      >
                        {product.name ||
                          product.productName ||
                          "Product"}
                      </h2>
                      {/* Category */}
                      {(product.category?.name ||
                        product.categoryName) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.category?.name ||
                            product.categoryName}
                        </p>
                      )}
                      {/* ==================================================
                          PRICE
                      ================================================== */}
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <span className="text-xl font-semibold text-gray-900">
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                        {mrp > price && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹
                              {mrp.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {discount}% off
                            </span>
                          </>
                        )}
                      </div>
                      {/* ==================================================
                          STOCK
                      ================================================== */}
                      <div className="mt-3">
                        {inStock ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                            <Check
                              size={15}
                              strokeWidth={2.5}
                            />

                            <span>
                              In Stock
                            </span>

                            {totalStock > 0 &&
                              totalStock <= 5 && (
                                <span className="text-orange-500 ml-1">
                                  Only {totalStock} left
                                </span>
                              )}

                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">

                            <X size={15} />

                            <span>
                              Out of Stock
                            </span>

                          </div>
                        )}

                      </div>

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <div className="mt-5 flex flex-wrap gap-3">

                        {/* ADD TO CART */}

                        {inStock && (
                          <button
                            onClick={() =>
                              handleAddToCart(product)
                            }
                            disabled={
                              isAdding ||
                              isAdded
                            }
                            className={`
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              px-5
                              py-2.5
                              rounded-sm
                              font-semibold
                              text-sm
                              transition
                              text-white
                              ${
                                isAdded
                                  ? "bg-green-600"
                                  : "bg-[#ff9f00] hover:bg-[#f39a00]"
                              }
                              disabled:opacity-70
                              disabled:cursor-not-allowed
                            `}
                          >

                            {isAdding ? (
                              <>
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />

                                ADDING...
                              </>
                            ) : isAdded ? (
                              <>
                                <Check
                                  size={17}
                                />

                                ADDED
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={17}
                                />

                                ADD TO CART
                              </>
                            )}

                          </button>
                        )}

                        {/* ORDER NOW */}

                        {inStock && (
                          <button
                            type="button"
                            onClick={() => handleOrderNow(product)}
                            className="inline-flex items-center justify-center gap-2 bg-[#2874f0] hover:bg-[#1d66d5] px-5 py-2.5 rounded-sm text-white font-semibold text-sm transition shadow-sm"
                          >
                            <Package size={17} />
                            ORDER NOW
                          </button>
                        )}

                        {/* VIEW PRODUCT */}

                        <button
                          type="button"
                          onClick={() =>
                            openProduct(productId)
                          }
                          className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 px-5 py-2.5 rounded-sm text-gray-700 font-medium text-sm transition"
                        >
                          VIEW PRODUCT
                        </button>

                        {/* REMOVE */}

                        <button
                          onClick={() =>
                            removeWishlist(productId)
                          }
                          disabled={isRemoving}
                          className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 px-5 py-2.5 rounded-sm text-gray-700 font-medium text-sm transition disabled:opacity-60"
                        >

                          {isRemoving ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />

                              REMOVING...
                            </>
                          ) : (
                            <>
                              <Trash2
                                size={17}
                              />

                              REMOVE
                            </>
                          )}

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