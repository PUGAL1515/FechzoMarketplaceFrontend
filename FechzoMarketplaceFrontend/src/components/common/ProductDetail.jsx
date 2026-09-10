import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
  Check,
  MapPin,
  Tag,
  PackageCheck,
  Share2,
} from "lucide-react";

import axios from "axios";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";

// ============================================================
// HELPERS
// ============================================================

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getAttribute = (variant, attributeName) => {
  if (!variant?.attributes) return "";

  const target = normalize(attributeName);

  const key = Object.keys(variant.attributes).find(
    (key) => normalize(key) === target,
  );

  return key ? variant.attributes[key] : "";
};

const getVariantStock = (variant) => {
  const stock = Number(variant?.stock);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

const getDiscountPercentage = (price, mrp) => {
  const sellingPrice = Number(price);
  const originalPrice = Number(mrp);

  if (
    !Number.isFinite(sellingPrice) ||
    !Number.isFinite(originalPrice) ||
    originalPrice <= sellingPrice ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

const getColorStyle = (color) => {
  const normalized = normalize(color);

  const colors = {
    black: "#111827",
    white: "#ffffff",
    red: "#ef4444",
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#facc15",
    orange: "#f97316",
    pink: "#ec4899",
    purple: "#9333ea",
    grey: "#9ca3af",
    gray: "#9ca3af",
    brown: "#92400e",
    maroon: "#7f1d1d",
    navy: "#172554",
    beige: "#d6c6a5",
    cream: "#fff7ed",
    gold: "#d4af37",
    silver: "#c0c0c0",
  };

  if (normalized.startsWith("#")) {
    return normalized;
  }

  return colors[normalized] || "#e5e7eb";
};

const getVariantImages = (variant) => {
  if (!variant?.images) return [];

  if (Array.isArray(variant.images)) {
    return variant.images.filter(Boolean);
  }

  if (typeof variant.images === "string") {
    return [variant.images];
  }

  return [];
};

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

// ============================================================
// COMPONENT
// ============================================================

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const { cart = [], addToCart } = useCart();

  // ==========================================================
  // STATE
  // ==========================================================

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [wishlist, setWishlist] = useState(false);

  // ==========================================================
  // FETCH PRODUCT
  // ==========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`/api/products/${productId}`);

        const fetchedProduct = response?.data?.product;

        if (!fetchedProduct) {
          throw new Error("Product not found");
        }

        setProduct(fetchedProduct);
      } catch (err) {
        console.error("Product fetch error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load product",
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const variants = useMemo(() => {
    if (!Array.isArray(product?.variants)) return [];
    return product.variants.filter(Boolean);
  }, [product]);
  const colorOptions = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      const color = getAttribute(variant, "color");

      if (!color) return;

      const key = normalize(color);

      if (!map.has(key)) {
        map.set(key, {
          value: String(color),
          variant,
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  // ==========================================================
  // AUTO SELECT COLOR
  // ==========================================================

  useEffect(() => {
    if (!colorOptions.length) {
      setSelectedColor("");
      return;
    }

    const currentExists = colorOptions.some(
      (item) => normalize(item.value) === normalize(selectedColor),
    );

    if (!currentExists) {
      const availableColor =
        colorOptions.find((item) => getVariantStock(item.variant) > 0) ||
        colorOptions[0];

      setSelectedColor(availableColor?.value || "");
    }
  }, [colorOptions, selectedColor]);

  // ==========================================================
  // SELECTED COLOR VARIANTS
  // ==========================================================

  const selectedColorVariants = useMemo(() => {
    if (!selectedColor) return variants;

    const filtered = variants.filter(
      (variant) =>
        normalize(getAttribute(variant, "color")) === normalize(selectedColor),
    );

    return filtered.length ? filtered : variants;
  }, [variants, selectedColor]);

  // ==========================================================
  // COLOR IMAGES
  // ==========================================================

  const selectedColorImages = useMemo(() => {
    const images = [];

    selectedColorVariants.forEach((variant) => {
      getVariantImages(variant).forEach((image) => {
        if (!images.includes(image)) {
          images.push(image);
        }
      });
    });

    return images;
  }, [selectedColorVariants]);

  // ==========================================================
  // SIZE OPTIONS
  // ==========================================================

  const sizeOptions = useMemo(() => {
    const map = new Map();

    selectedColorVariants.forEach((variant) => {
      const size = getAttribute(variant, "size");

      if (!size) return;

      const key = normalize(size);

      if (!map.has(key)) {
        map.set(key, {
          value: String(size),
          variant,
        });
      }
    });

    return Array.from(map.values());
  }, [selectedColorVariants]);

  // ==========================================================
  // AUTO SELECT SIZE
  // ==========================================================

  useEffect(() => {
    if (!sizeOptions.length) {
      setSelectedSize("");
      return;
    }

    const currentExists = sizeOptions.some(
      (item) => normalize(item.value) === normalize(selectedSize),
    );

    if (!currentExists) {
      const availableSize =
        sizeOptions.find((item) => getVariantStock(item.variant) > 0) ||
        sizeOptions[0];

      setSelectedSize(availableSize?.value || "");
      return;
    }

    const selectedSizeOption = sizeOptions.find(
      (item) => normalize(item.value) === normalize(selectedSize),
    );

    if (
      selectedSizeOption &&
      getVariantStock(selectedSizeOption.variant) <= 0
    ) {
      const availableSize = sizeOptions.find(
        (item) => getVariantStock(item.variant) > 0,
      );

      if (availableSize) {
        setSelectedSize(availableSize.value);
      }
    }
  }, [sizeOptions, selectedSize]);

  // ==========================================================
  // ACTIVE VARIANT
  // ==========================================================

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;

    if (selectedColor && selectedSize) {
      const exact = variants.find((variant) => {
        const color = normalize(getAttribute(variant, "color"));
        const size = normalize(getAttribute(variant, "size"));

        return (
          color === normalize(selectedColor) && size === normalize(selectedSize)
        );
      });

      if (exact) return exact;
    }

    if (selectedColor) {
      const colorVariant = variants.find(
        (variant) =>
          normalize(getAttribute(variant, "color")) ===
          normalize(selectedColor),
      );

      if (colorVariant) return colorVariant;
    }

    return variants[0] || null;
  }, [variants, selectedColor, selectedSize]);

  // ==========================================================
  // ACTIVE IMAGES
  // ==========================================================

  const activeImages = useMemo(() => {
    const images = [];

    selectedColorImages.forEach((image) => {
      if (image && !images.includes(image)) {
        images.push(image);
      }
    });

    if (!images.length && activeVariant) {
      getVariantImages(activeVariant).forEach((image) => {
        if (image && !images.includes(image)) {
          images.push(image);
        }
      });
    }

    if (!images.length && Array.isArray(product?.images)) {
      product.images.forEach((image) => {
        if (image && !images.includes(image)) {
          images.push(image);
        }
      });
    }

    if (!images.length && product?.thumbnail) {
      images.push(product.thumbnail);
    }

    return images;
  }, [selectedColorImages, activeVariant, product]);

  // ==========================================================
  // RESET IMAGE
  // ==========================================================

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor, selectedSize]);

  useEffect(() => {
    if (activeImageIndex >= activeImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImages, activeImageIndex]);

  // ==========================================================
  // PRICE / STOCK
  // ==========================================================

  const currentStock = getVariantStock(activeVariant);

  const currentPrice =
    Number(activeVariant?.price) || Number(product?.price) || 0;

  const currentMrp =
    Number(activeVariant?.mrp) || Number(product?.mrp) || currentPrice;

  const discountPercentage = getDiscountPercentage(currentPrice, currentMrp);

  const isOutOfStock = !activeVariant || currentStock <= 0;

  // ==========================================================
  // CART
  // ==========================================================

  const isInCart = useMemo(() => {
    if (!activeVariant || !product) return false;

    return cart.some((item) => {
      const itemProductId =
        item?.productId?._id ||
        item?.productId ||
        item?.product?._id ||
        item?.product;

      const itemVariantId =
        item?.variantId || item?.variant?._id || item?.selectedVariant?._id;

      return (
        String(itemProductId) === String(product._id) &&
        String(itemVariantId) === String(activeVariant._id)
      );
    });
  }, [cart, product, activeVariant]);

  // ==========================================================
  // COLOR CHANGE
  // ==========================================================

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setQuantity(1);
    setActiveImageIndex(0);

    const variantsForColor = variants.filter(
      (variant) =>
        normalize(getAttribute(variant, "color")) === normalize(color),
    );

    const availableVariant =
      variantsForColor.find((variant) => getVariantStock(variant) > 0) ||
      variantsForColor[0];

    const nextSize = getAttribute(availableVariant, "size");

    setSelectedSize(nextSize || "");
  };

  // ==========================================================
  // SIZE CHANGE
  // ==========================================================

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(1);
    setActiveImageIndex(0);
  };

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(currentStock || 1, previous + 1));
  };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const buildCartItem = () => {
    if (!product || !activeVariant) return null;

    return {
      ...product,

      productId: product._id,

      variantId: activeVariant._id,

      selectedVariant: activeVariant,

      selectedAttributes: activeVariant.attributes || {},

      quantity,

      price: currentPrice,

      mrp: currentMrp,

      stock: currentStock,

      images: activeImages.length > 0 ? activeImages : product.images || [],

      thumbnail:
        activeImages[0] || product.thumbnail || product.images?.[0] || "",
    };
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (isInCart) {
      navigate("/cart");
      return;
    }

    const item = buildCartItem();

    if (!item) return;

    addToCart(item);
  };
  const handleWishlist = async () => {
    try {
      if (!product?._id) return;

      if (wishlist) {
        await api.delete("/api/wishlist", {
          data: {
            productId: product._id,
          },
          withCredentials: true,
        });

        setWishlist(false);
      } else {
        await api.post(
          "/api/wishlist",
          {
            productId: product._id,
          },
          {
            withCredentials: true,
          },
        );

        setWishlist(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error?.response?.status === 401) {
        navigate("/login");
      }
    }
  };
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product?._id) return;

      try {
        const response = await api.get("/api/wishlist/check", {
          params: {
            productId: product._id,
          },
          withCredentials: true,
        });

        setWishlist(Boolean(response?.data?.isWishlisted));
      } catch (error) {
        console.error("Wishlist check error:", error);

        setWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [product?._id]);

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    const item = buildCartItem();

    if (!item) return;

    addToCart(item);

    navigate("/cart");
  };

  // ==========================================================
  // IMAGE NAVIGATION
  // ==========================================================

  const nextImage = () => {
    if (!activeImages.length) return;

    setActiveImageIndex((previous) => (previous + 1) % activeImages.length);
  };

  const previousImage = () => {
    if (!activeImages.length) return;

    setActiveImageIndex(
      (previous) => (previous - 1 + activeImages.length) % activeImages.length,
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-4">
          <div className="h-8 w-32 bg-white animate-pulse mb-4 rounded-sm" />

          <div className="grid lg:grid-cols-[55%_45%] gap-3">
            <div className="bg-white h-[620px] animate-pulse rounded-sm" />

            <div className="bg-white p-6 space-y-5 rounded-sm">
              <div className="h-5 w-32 bg-gray-200 animate-pulse" />
              <div className="h-8 w-4/5 bg-gray-200 animate-pulse" />
              <div className="h-5 w-1/2 bg-gray-200 animate-pulse" />
              <div className="h-10 w-1/3 bg-gray-200 animate-pulse" />
              <div className="h-24 bg-gray-200 animate-pulse" />
              <div className="h-16 bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-sm p-8 text-center max-w-md w-full">
          <PackageCheck className="mx-auto text-gray-400 mb-4" size={48} />

          <h2 className="text-xl font-semibold text-gray-800">
            Product not found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error || "Unable to load this product."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-[#2874f0] text-white font-semibold rounded-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PRODUCT DATA
  // ==========================================================

  const brand = product?.brand || "Brand";

  const productName = product?.name || product?.productName || "Product";

  const description =
    product?.description ||
    "High quality product available with multiple variants.";

  const categoryName =
    product?.categoryId?.name ||
    product?.category?.name ||
    product?.categoryName ||
    "Products";

  const gender = product?.gender;

  const productRating = Number(
    product?.rating || product?.averageRating || product?.ratings || 4.3,
  );

  const reviewCount = Number(
    product?.reviewCount || product?.reviewsCount || 0,
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121]">
      {/* =====================================================
          TOP BAR / BREADCRUMB
      ====================================================== */}

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 pt-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2874f0] mb-3"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1 flex-wrap">
          <span>Home</span>
          <span>›</span>

          <span>{categoryName}</span>

          <span>›</span>

          <span className="text-gray-700">{productName}</span>
        </div>
      </div>

      {/* =====================================================
          MAIN PRODUCT AREA
      ====================================================== */}

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        <div className="grid lg:grid-cols-[55%_45%] gap-3 items-start">
          {/* =================================================
              LEFT - PRODUCT GALLERY
          ================================================== */}

          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="flex min-h-[600px]">
              {/* ============================================
                  VERTICAL THUMBNAILS
              ============================================= */}

              <div className="w-[78px] shrink-0 border-r border-gray-100 p-2">
                <div className="space-y-2 max-h-[560px] overflow-y-auto scrollbar-thin">
                  {activeImages.length > 0 ? (
                    activeImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-[62px] h-[68px] border flex items-center justify-center bg-white transition ${
                          activeImageIndex === index
                            ? "border-[#2874f0] border-2"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${productName} ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="w-[62px] h-[68px] bg-gray-100" />
                  )}
                </div>
              </div>

              {/* ============================================
                  MAIN IMAGE
              ============================================= */}

              <div className="flex-1 relative flex flex-col">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className="w-10 h-10 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center hover:shadow-md transition"
                    title={
                      wishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      size={21}
                      className={
                        wishlist ? "fill-red-500 text-red-500" : "text-gray-500"
                      }
                    />
                  </button>

                  <button className="w-10 h-10 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center hover:shadow-md">
                    <Share2 size={19} className="text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 min-h-[510px] flex items-center justify-center p-5 sm:p-8 relative">
                  {activeImages.length > 0 ? (
                    <img
                      src={activeImages[activeImageIndex]}
                      alt={productName}
                      className="max-h-[500px] max-w-full w-auto object-contain select-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}

                  {activeImages.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-20 bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <ChevronLeft size={25} />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-20 bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <ChevronRight size={25} />
                      </button>
                    </>
                  )}
                </div>

                {/* ==========================================
                    IMAGE COUNT
                =========================================== */}

                {activeImages.length > 1 && (
                  <div className="text-center text-xs text-gray-500 pb-3">
                    {activeImageIndex + 1} / {activeImages.length}
                  </div>
                )}

                {/* ==========================================
                    ACTION BUTTONS
                =========================================== */}

                <div className="grid grid-cols-2 border-t border-gray-100">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`h-[58px] flex items-center justify-center gap-2 font-bold text-white transition ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#ff9f00] hover:bg-[#f59b00]"
                    }`}
                  >
                    <ShoppingCart size={20} />

                    {isOutOfStock
                      ? "OUT OF STOCK"
                      : isInCart
                        ? "GO TO CART"
                        : "ADD TO CART"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`h-[58px] flex items-center justify-center gap-2 font-bold text-white transition ${
                      isOutOfStock
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#fb641b] hover:bg-[#e85b17]"
                    }`}
                  >
                    <Zap size={20} />
                    BUY NOW
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT - PRODUCT INFORMATION
          ================================================== */}

          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="p-4 sm:p-6">
              {/* ============================================
                  BRAND
              ============================================= */}

              <div className="text-sm font-semibold text-[#2874f0] mb-1">
                {brand}
              </div>

              {/* ============================================
                  TITLE
              ============================================= */}

              <h1 className="text-lg sm:text-xl font-medium leading-7 text-gray-800">
                {productName}
              </h1>

              {/* ============================================
                  SUB INFORMATION
              ============================================= */}

              {gender && (
                <div className="text-xs text-gray-500 mt-1">
                  For {String(gender)}
                </div>
              )}

              {/* ============================================
                  RATING
              ============================================= */}

              <div className="flex items-center gap-3 mt-3">
                <div className="inline-flex items-center gap-1 bg-[#388e3c] text-white px-2 py-1 rounded-sm text-xs font-semibold">
                  {Number.isFinite(productRating)
                    ? productRating.toFixed(1)
                    : "4.3"}

                  <Star size={12} fill="white" />
                </div>

                <span className="text-sm text-gray-500">
                  {reviewCount > 0
                    ? `${reviewCount.toLocaleString()} Ratings & Reviews`
                    : "Ratings & Reviews"}
                </span>
              </div>

              <div className="border-b border-gray-200 my-4" />

              {/* ============================================
                  PRICE
              ============================================= */}

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-semibold text-gray-900">
                    ₹{formatPrice(currentPrice)}
                  </span>

                  {currentMrp > currentPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{formatPrice(currentMrp)}
                      </span>

                      <span className="text-sm font-semibold text-[#388e3c]">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* ============================================
                  OFFERS
              ============================================= */}

              <div className="mt-5 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-base mb-3">
                  Available offers
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Tag size={17} className="text-[#388e3c] mt-0.5 shrink-0" />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Special Price
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Get extra discount on selected products.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Truck
                      size={17}
                      className="text-[#388e3c] mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Free Delivery
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Delivery available to your location.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ShieldCheck
                      size={17}
                      className="text-[#388e3c] mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Secure Payment
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Your payment information is protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================
                  COLOR
              ============================================= */}

              {colorOptions.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold">Color</span>

                    <span className="text-sm text-gray-500">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((option) => {
                      const color = option.value;

                      const colorVariant = variants.find(
                        (variant) =>
                          normalize(getAttribute(variant, "color")) ===
                          normalize(color),
                      );

                      const colorImages = getVariantImages(colorVariant);

                      const image =
                        colorImages[0] ||
                        product.thumbnail ||
                        product.images?.[0];

                      const selected =
                        normalize(selectedColor) === normalize(color);

                      const colorStock = variants
                        .filter(
                          (variant) =>
                            normalize(getAttribute(variant, "color")) ===
                            normalize(color),
                        )
                        .reduce(
                          (total, variant) => total + getVariantStock(variant),
                          0,
                        );

                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`relative w-[76px] h-[88px] border bg-white flex flex-col items-center justify-center transition ${
                            selected
                              ? "border-[#2874f0] border-2"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="w-[52px] h-[52px] flex items-center justify-center">
                            {image ? (
                              <img
                                src={image}
                                alt={color}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span
                                className="w-8 h-8 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: getColorStyle(color),
                                }}
                              />
                            )}
                          </div>

                          <span className="text-[11px] mt-1 capitalize truncate max-w-[68px]">
                            {color}
                          </span>

                          {colorStock <= 0 && (
                            <span className="absolute inset-0 bg-white/65 flex items-center justify-center">
                              <span className="text-[9px] text-red-500 font-semibold rotate-[-12deg]">
                                OUT OF STOCK
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================
                  SIZE
              ============================================= */}

              {sizeOptions.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold">Size</span>

                    <button className="text-xs text-[#2874f0] font-medium">
                      Size Chart
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((option) => {
                      const size = option.value;

                      const variant = variants.find(
                        (item) =>
                          normalize(getAttribute(item, "color")) ===
                            normalize(selectedColor) &&
                          normalize(getAttribute(item, "size")) ===
                            normalize(size),
                      );

                      const stock = getVariantStock(variant || option.variant);

                      const selected =
                        normalize(selectedSize) === normalize(size);

                      return (
                        <button
                          key={size}
                          disabled={stock <= 0}
                          onClick={() => handleSizeChange(size)}
                          className={`min-w-[58px] px-4 py-2.5 text-sm border font-medium relative ${
                            selected
                              ? "border-[#2874f0] text-[#2874f0] bg-blue-50"
                              : stock <= 0
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-gray-300 text-gray-700 hover:border-[#2874f0]"
                          }`}
                        >
                          {size}

                          {stock <= 0 && (
                            <span className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 rotate-[-15deg]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================
                  SELECTED VARIANT
              ============================================= */}

              {activeVariant && (
                <div className="mt-5 bg-gray-50 border border-gray-100 p-3">
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">SKU</span>

                      <p className="font-medium text-gray-800 mt-0.5">
                        {activeVariant.sku || "N/A"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">Stock</span>

                      <p
                        className={`font-medium mt-0.5 ${
                          currentStock > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {currentStock > 0
                          ? `${currentStock} available`
                          : "Out of stock"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================
                  QUANTITY
              ============================================= */}

              {!isOutOfStock && (
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-sm font-semibold">Quantity</span>

                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:text-gray-300"
                    >
                      <Minus size={15} />
                    </button>

                    <div className="w-11 h-9 border-x border-gray-300 flex items-center justify-center text-sm font-medium">
                      {quantity}
                    </div>

                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= currentStock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:text-gray-300"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================
                  STOCK STATUS
              ============================================= */}

              <div className="mt-5">
                {isOutOfStock ? (
                  <div className="bg-red-50 border border-red-100 p-3 flex items-start gap-3">
                    <PackageCheck size={20} className="text-red-500 mt-0.5" />

                    <div>
                      <p className="font-semibold text-red-600 text-sm">
                        Currently unavailable
                      </p>

                      <p className="text-xs text-red-500 mt-1">
                        This selected variant is out of stock. Please choose
                        another variant.
                      </p>
                    </div>
                  </div>
                ) : currentStock <= 5 ? (
                  <div className="text-xs text-orange-600 font-medium">
                    Hurry! Only {currentStock} left in stock.
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <Check size={15} />
                    In Stock
                  </div>
                )}
              </div>

              {/* ============================================
                  DELIVERY / SERVICE
              ============================================= */}

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex gap-3 mb-4">
                  <Truck size={21} className="text-gray-500 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">Delivery</p>

                    <p className="text-xs text-gray-500 mt-1">
                      Fast and reliable delivery available.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <RotateCcw size={21} className="text-gray-500 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">7 Days Replacement</p>

                    <p className="text-xs text-gray-500 mt-1">
                      Replacement policy applicable as per product conditions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck size={21} className="text-gray-500 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">Secure Payments</p>

                    <p className="text-xs text-gray-500 mt-1">
                      Safe and secure checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            PRODUCT DESCRIPTION
        ==================================================== */}

        <div className="mt-3 bg-white border border-gray-200 rounded-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Product Description</h2>
          </div>

          <div className="p-5">
            <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        {/* ===================================================
            PRODUCT HIGHLIGHTS
        ==================================================== */}

        <div className="mt-3 bg-white border border-gray-200 rounded-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Product Highlights</h2>
          </div>

          <div className="p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-4">
                <PackageCheck size={22} className="text-[#2874f0] mb-3" />

                <p className="text-xs text-gray-500">Product</p>

                <p className="font-medium text-sm mt-1">{productName}</p>
              </div>

              <div className="border border-gray-200 p-4">
                <Tag size={22} className="text-[#2874f0] mb-3" />

                <p className="text-xs text-gray-500">Category</p>

                <p className="font-medium text-sm mt-1">{categoryName}</p>
              </div>

              <div className="border border-gray-200 p-4">
                <ShoppingCart size={22} className="text-[#2874f0] mb-3" />

                <p className="text-xs text-gray-500">Variants</p>

                <p className="font-medium text-sm mt-1">
                  {variants.length} available
                </p>
              </div>

              <div className="border border-gray-200 p-4">
                <ShieldCheck size={22} className="text-[#2874f0] mb-3" />

                <p className="text-xs text-gray-500">Payment</p>

                <p className="font-medium text-sm mt-1">Secure checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            SPECIFICATIONS
        ==================================================== */}

        <div className="mt-3 bg-white border border-gray-200 rounded-sm mb-8">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Specifications</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* BRAND */}

            <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
              <span className="text-sm text-gray-500">Brand</span>

              <span className="text-sm text-gray-800 font-medium">{brand}</span>
            </div>

            {/* CATEGORY */}

            <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
              <span className="text-sm text-gray-500">Category</span>

              <span className="text-sm text-gray-800 font-medium">
                {categoryName}
              </span>
            </div>

            {/* GENDER */}

            {gender && (
              <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
                <span className="text-sm text-gray-500">Gender</span>

                <span className="text-sm text-gray-800 font-medium capitalize">
                  {gender}
                </span>
              </div>
            )}

            {/* COLOR */}

            {selectedColor && (
              <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
                <span className="text-sm text-gray-500">Selected Color</span>

                <span className="text-sm text-gray-800 font-medium capitalize">
                  {selectedColor}
                </span>
              </div>
            )}

            {/* SIZE */}

            {selectedSize && (
              <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
                <span className="text-sm text-gray-500">Selected Size</span>

                <span className="text-sm text-gray-800 font-medium">
                  {selectedSize}
                </span>
              </div>
            )}

            {/* SKU */}

            {activeVariant?.sku && (
              <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
                <span className="text-sm text-gray-500">SKU</span>

                <span className="text-sm text-gray-800 font-medium">
                  {activeVariant.sku}
                </span>
              </div>
            )}

            {/* STOCK */}

            <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] px-5 py-4">
              <span className="text-sm text-gray-500">Availability</span>

              <span
                className={`text-sm font-medium ${
                  currentStock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {currentStock > 0
                  ? `${currentStock} units available`
                  : "Out of stock"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE STICKY ACTION BAR
      ====================================================== */}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 grid grid-cols-2 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock ? "bg-gray-400" : "bg-[#ff9f00]"
          }`}
        >
          <ShoppingCart size={19} />
          {isInCart ? "GO TO CART" : "ADD TO CART"}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock ? "bg-gray-400" : "bg-[#fb641b]"
          }`}
        >
          <Zap size={19} />
          BUY NOW
        </button>
      </div>

      {/* Mobile bottom spacing */}
      <div className="lg:hidden h-14" />
    </div>
  );
}
