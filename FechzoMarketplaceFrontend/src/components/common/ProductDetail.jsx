import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, PackageCheck } from "lucide-react";
import axios from "axios";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getAttribute = (variant, attributeName) => {
  if (!variant?.attributes) return "";

  const target = normalize(attributeName);

  const key = Object.keys(variant.attributes).find(
    (key) => normalize(key) === target
  );

  return key ? variant.attributes[key] : "";
};

const getVariantStock = (variant) => {
  const stock = Number(variant?.stock);

  return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const { cart = [], addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [wishlist, setWishlist] = useState(false);

  // ==========================================================
  // CART NOTIFICATION
  // ==========================================================

  const [cartMessage, setCartMessage] = useState("");

  // ==========================================================
  // FETCH PRODUCT
  // ==========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `/api/products/${productId}`
        );

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
            "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // ==========================================================
  // VARIANTS
  // ==========================================================

  const variants = useMemo(() => {
    if (!Array.isArray(product?.variants)) {
      return [];
    }

    return product.variants.filter(Boolean);
  }, [product]);

  // ==========================================================
  // COLOR OPTIONS
  // ==========================================================

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
      (item) =>
        normalize(item.value) ===
        normalize(selectedColor)
    );

    if (!currentExists) {
      const availableColor =
        colorOptions.find(
          (item) =>
            getVariantStock(item.variant) > 0
        ) || colorOptions[0];

      setSelectedColor(
        availableColor?.value || ""
      );
    }
  }, [colorOptions, selectedColor]);

  // ==========================================================
  // SELECTED COLOR VARIANTS
  // ==========================================================

  const selectedColorVariants = useMemo(() => {
    if (!selectedColor) {
      return variants;
    }

    const filtered = variants.filter(
      (variant) =>
        normalize(
          getAttribute(variant, "color")
        ) === normalize(selectedColor)
    );

    return filtered.length ? filtered : variants;
  }, [variants, selectedColor]);

  // ==========================================================
  // COLOR IMAGES
  // ==========================================================

  const selectedColorImages = useMemo(() => {
    const images = [];

    selectedColorVariants.forEach((variant) => {
      if (!variant?.images) return;

      if (Array.isArray(variant.images)) {
        variant.images.forEach((image) => {
          if (image && !images.includes(image)) {
            images.push(image);
          }
        });
      } else if (
        typeof variant.images === "string"
      ) {
        if (!images.includes(variant.images)) {
          images.push(variant.images);
        }
      }
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
      (item) =>
        normalize(item.value) ===
        normalize(selectedSize)
    );

    if (!currentExists) {
      const availableSize =
        sizeOptions.find(
          (item) =>
            getVariantStock(item.variant) > 0
        ) || sizeOptions[0];

      setSelectedSize(
        availableSize?.value || ""
      );

      return;
    }

    const selectedSizeOption =
      sizeOptions.find(
        (item) =>
          normalize(item.value) ===
          normalize(selectedSize)
      );

    if (
      selectedSizeOption &&
      getVariantStock(
        selectedSizeOption.variant
      ) <= 0
    ) {
      const availableSize =
        sizeOptions.find(
          (item) =>
            getVariantStock(item.variant) > 0
        );

      if (availableSize) {
        setSelectedSize(
          availableSize.value
        );
      }
    }
  }, [sizeOptions, selectedSize]);

  // ==========================================================
  // ACTIVE VARIANT
  // ==========================================================

  const activeVariant = useMemo(() => {
    if (!variants.length) {
      return null;
    }

    if (selectedColor && selectedSize) {
      const exact = variants.find(
        (variant) => {
          const color = normalize(
            getAttribute(
              variant,
              "color"
            )
          );

          const size = normalize(
            getAttribute(
              variant,
              "size"
            )
          );

          return (
            color ===
              normalize(selectedColor) &&
            size ===
              normalize(selectedSize)
          );
        }
      );

      if (exact) {
        return exact;
      }
    }

    if (selectedColor) {
      const colorVariant =
        variants.find(
          (variant) =>
            normalize(
              getAttribute(
                variant,
                "color"
              )
            ) ===
            normalize(selectedColor)
        );

      if (colorVariant) {
        return colorVariant;
      }
    }

    return variants[0] || null;
  }, [
    variants,
    selectedColor,
    selectedSize,
  ]);

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
      if (Array.isArray(activeVariant.images)) {
        activeVariant.images.forEach((image) => {
          if (
            image &&
            !images.includes(image)
          ) {
            images.push(image);
          }
        });
      } else if (
        typeof activeVariant.images ===
        "string"
      ) {
        images.push(
          activeVariant.images
        );
      }
    }

    if (
      !images.length &&
      Array.isArray(product?.images)
    ) {
      product.images.forEach((image) => {
        if (
          image &&
          !images.includes(image)
        ) {
          images.push(image);
        }
      });
    }

    if (
      !images.length &&
      product?.thumbnail
    ) {
      images.push(product.thumbnail);
    }

    return images;
  }, [
    selectedColorImages,
    activeVariant,
    product,
  ]);

  // ==========================================================
  // RESET IMAGE
  // ==========================================================

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor, selectedSize]);

  useEffect(() => {
    if (
      activeImageIndex >=
      activeImages.length
    ) {
      setActiveImageIndex(0);
    }
  }, [
    activeImages,
    activeImageIndex,
  ]);

  // ==========================================================
  // PRICE / STOCK
  // ==========================================================

  const currentStock =
    getVariantStock(activeVariant);

  const currentPrice =
    Number(activeVariant?.price) ||
    Number(product?.price) ||
    0;

  const currentMrp =
    Number(activeVariant?.mrp) ||
    Number(product?.mrp) ||
    currentPrice;

  const isOutOfStock =
    !activeVariant ||
    currentStock <= 0;

  // ==========================================================
  // CART CHECK
  // ==========================================================

  const isInCart = useMemo(() => {
    if (!activeVariant || !product) {
      return false;
    }

    return cart.some((item) => {
      const itemProductId =
        item?.productId?._id ||
        item?.productId ||
        item?.product?._id ||
        item?.product;

      const itemVariantId =
        item?.variantId ||
        item?.variant?._id ||
        item?.selectedVariant?._id;

      return (
        String(itemProductId) ===
          String(product._id) &&
        String(itemVariantId) ===
          String(activeVariant._id)
      );
    });
  }, [
    cart,
    product,
    activeVariant,
  ]);

  // ==========================================================
  // COLOR CHANGE
  // ==========================================================

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setQuantity(1);
    setActiveImageIndex(0);

    const variantsForColor =
      variants.filter(
        (variant) =>
          normalize(
            getAttribute(
              variant,
              "color"
            )
          ) === normalize(color)
      );

    const availableVariant =
      variantsForColor.find(
        (variant) =>
          getVariantStock(variant) > 0
      ) || variantsForColor[0];

    const nextSize = getAttribute(
      availableVariant,
      "size"
    );

    setSelectedSize(
      nextSize || ""
    );
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
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(
        currentStock || 1,
        previous + 1
      )
    );
  };

  // ==========================================================
  // BUILD CART ITEM
  // ==========================================================

  const buildCartItem = () => {
    if (!product || !activeVariant) {
      return null;
    }

    return {
      ...product,

      productId: product._id,

      variantId: activeVariant._id,

      selectedVariant: activeVariant,

      selectedAttributes:
        activeVariant.attributes || {},

      quantity,

      price: currentPrice,

      mrp: currentMrp,

      stock: currentStock,

      images:
        activeImages.length > 0
          ? activeImages
          : product.images || [],

      thumbnail:
        activeImages[0] ||
        product.thumbnail ||
        product.images?.[0] ||
        "",
    };
  };

  // ==========================================================
  // CART NOTIFICATION
  // ==========================================================

  const showCartNotification = () => {
    setCartMessage(
      "Item added to cart"
    );

    setTimeout(() => {
      setCartMessage("");
    }, 2500);
  };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    const item = buildCartItem();

    if (!item) {
      return;
    }

    addToCart(item);

    showCartNotification();
  };

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow = () => {
    if (isOutOfStock) {
      return;
    }

    const item = buildCartItem();

    if (!item) {
      return;
    }

    addToCart(item);

    navigate("/cart");
  };

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const handleWishlist = async () => {
    try {
      if (!product?._id) {
        return;
      }

      if (wishlist) {
        await api.delete(
          "/api/wishlist",
          {
            data: {
              productId: product._id,
            },
            withCredentials: true,
          }
        );

        setWishlist(false);
      } else {
        await api.post(
          "/api/wishlist",
          {
            productId: product._id,
          },
          {
            withCredentials: true,
          }
        );

        setWishlist(true);
      }
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      if (
        error?.response?.status === 401
      ) {
        navigate("/login");
      }
    }
  };

  // ==========================================================
  // CHECK WISHLIST
  // ==========================================================

  useEffect(() => {
    const checkWishlistStatus =
      async () => {
        if (!product?._id) {
          return;
        }

        try {
          const response =
            await api.get(
              "/api/wishlist/check",
              {
                params: {
                  productId:
                    product._id,
                },
                withCredentials: true,
              }
            );

          setWishlist(
            Boolean(
              response?.data
                ?.isWishlisted
            )
          );
        } catch (error) {
          console.error(
            "Wishlist check error:",
            error
          );

          setWishlist(false);
        }
      };

    checkWishlistStatus();
  }, [product?._id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-4">
          <div className="h-5 w-28 bg-white rounded animate-pulse mb-5" />

          <div className="grid lg:grid-cols-[52%_48%] gap-4">
            <div className="bg-white rounded-lg h-[520px] sm:h-[600px] animate-pulse" />

            <div className="bg-white rounded-lg p-5 sm:p-7 space-y-5">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />

              <div className="h-7 w-full bg-gray-200 rounded animate-pulse" />

              <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />

              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />

              <div className="h-24 bg-gray-200 rounded animate-pulse" />

              <div className="h-28 bg-gray-200 rounded animate-pulse" />
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
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md w-full shadow-sm">
          <PackageCheck
            className="mx-auto text-gray-400 mb-4"
            size={48}
          />

          <h2 className="text-xl font-semibold text-gray-800">
            Product not found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error ||
              "Unable to load this product."}
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-6 px-6 py-3 bg-[#2874f0] text-white font-semibold rounded-lg hover:bg-blue-600 transition"
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

  const brand =
    product?.brand || "Brand";

  const productName =
    product?.name ||
    product?.productName ||
    "Product";

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
    product?.rating ||
      product?.averageRating ||
      product?.ratings ||
      4.3
  );

  const reviewCount = Number(
    product?.reviewCount ||
      product?.reviewsCount ||
      0
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] pb-16 lg:pb-0">

      {/* =====================================================
          CART SUCCESS NOTIFICATION
      ===================================================== */}

      {cartMessage && (
        <div className="fixed top-5 right-5 z-[100] animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-lg px-4 py-3 min-w-[280px]">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check
                size={19}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Item added to cart
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Your item has been added successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-hidden">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="flex items-center gap-1 shrink-0 text-gray-600 hover:text-[#2874f0]"
          >
            <ArrowLeft size={16} />

            Back
          </button>

          <span>›</span>

          <span className="truncate">
            {categoryName}
          </span>

          <span>›</span>

          <span className="text-gray-700 truncate">
            {productName}
          </span>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-3 sm:py-4">
        <div className="grid lg:grid-cols-[52%_48%] xl:grid-cols-[54%_46%] gap-3 lg:gap-4 items-start">

          {/* =================================================
              COMPONENT 1 - GALLERY
          ================================================= */}

          <ProductGallery
            product={product}
            productName={productName}
            activeImages={activeImages}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={
              setActiveImageIndex
            }
            wishlist={wishlist}
            handleWishlist={
              handleWishlist
            }
            handleAddToCart={
              handleAddToCart
            }
            handleBuyNow={
              handleBuyNow
            }
            isOutOfStock={
              isOutOfStock
            }
            isInCart={isInCart}
          />

          {/* =================================================
              COMPONENT 2 - PRODUCT INFO
          ================================================= */}

          <ProductInfo
            product={product}
            brand={brand}
            productName={productName}
            categoryName={categoryName}
            gender={gender}
            productRating={
              productRating
            }
            reviewCount={reviewCount}
            currentPrice={
              currentPrice
            }
            currentMrp={currentMrp}
            currentStock={
              currentStock
            }
            isOutOfStock={
              isOutOfStock
            }
            activeVariant={
              activeVariant
            }
            variants={variants}
            colorOptions={
              colorOptions
            }
            selectedColor={
              selectedColor
            }
            selectedColorVariants={
              selectedColorVariants
            }
            selectedSize={
              selectedSize
            }
            sizeOptions={
              sizeOptions
            }
            quantity={quantity}
            decreaseQuantity={
              decreaseQuantity
            }
            increaseQuantity={
              increaseQuantity
            }
            handleColorChange={
              handleColorChange
            }
            handleSizeChange={
              handleSizeChange
            }
            handleAddToCart={
              handleAddToCart
            }
            handleBuyNow={
              handleBuyNow
            }
            isInCart={isInCart}
          />
        </div>

        {/* =================================================
            COMPONENT 3 - DESCRIPTION
        ================================================= */}

        <ProductDescription
          product={product}
          productName={productName}
          description={description}
          categoryName={categoryName}
          brand={brand}
          gender={gender}
          variants={variants}
          selectedColor={
            selectedColor
          }
          selectedSize={
            selectedSize
          }
          activeVariant={
            activeVariant
          }
          currentStock={
            currentStock
          }
        />
      </div>

      {/* =====================================================
          MOBILE STICKY ACTION BAR
      ===================================================== */}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 grid grid-cols-2 shadow-[0_-3px_15px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={
            handleAddToCart
          }
          disabled={isOutOfStock}
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock
              ? "bg-gray-400"
              : "bg-[#ff9f00]"
          }`}
        >
          {isOutOfStock
            ? "OUT OF STOCK"
            : isInCart
            ? "GO TO CART"
            : "ADD TO CART"}
        </button>

        <button
          type="button"
          onClick={
            handleBuyNow
          }
          disabled={isOutOfStock}
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock
              ? "bg-gray-400"
              : "bg-[#fb641b]"
          }`}
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}