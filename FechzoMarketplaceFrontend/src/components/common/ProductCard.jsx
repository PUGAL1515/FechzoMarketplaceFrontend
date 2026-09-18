import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const {
    cart = [],
    addToCart,
    updateQuantity,
    getCartItemId,
  } = useCart();

  const [selectedAttributes, setSelectedAttributes] =
    useState({});

  const [showAddedAlert, setShowAddedAlert] =
    useState(false);

  const alertTimerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Normalize key
  |--------------------------------------------------------------------------
  */

  const normalizeKey = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  /*
  |--------------------------------------------------------------------------
  | Get Variant Attributes
  |--------------------------------------------------------------------------
  */

  const getVariantAttributes = (variant) => {
    if (!variant) {
      return {};
    }

    const attributes = {};

    /*
     * New dynamic attributes object
     */
    if (
      variant.attributes &&
      typeof variant.attributes === "object" &&
      !Array.isArray(variant.attributes)
    ) {
      Object.entries(
        variant.attributes
      ).forEach(([key, value]) => {
        if (
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          attributes[key] = value;
        }
      });
    }

    /*
     * Support direct variant fields
     */
    const directFields = [
      "color",
      "colour",
      "size",
      "material",
      "storage",
      "ram",
      "capacity",
      "weight",
      "length",
      "flavour",
      "flavor",
      "pack",
    ];

    directFields.forEach((field) => {
      if (
        variant[field] !== null &&
        variant[field] !== undefined &&
        variant[field] !== ""
      ) {
        if (!attributes[field]) {
          attributes[field] =
            variant[field];
        }
      }
    });

    /*
     * SKU fallback
     */
    if (
      Object.keys(attributes).length === 0 &&
      variant.sku
    ) {
      attributes.sku = variant.sku;
    }

    return attributes;
  };

  /*
  |--------------------------------------------------------------------------
  | Attribute Data
  |--------------------------------------------------------------------------
  */

  const attributeData = useMemo(() => {
    const variants =
      Array.isArray(product?.variants)
        ? product.variants
        : [];

    const data = {};

    variants.forEach((variant) => {
      const attributes =
        getVariantAttributes(
          variant
        );

      Object.entries(attributes).forEach(
        ([key, value]) => {
          const normalizedKey =
            normalizeKey(key);

          if (!normalizedKey) {
            return;
          }

          if (!data[normalizedKey]) {
            data[normalizedKey] = {
              key,
              values: [],
            };
          }

          const exists =
            data[
              normalizedKey
            ].values.some(
              (existingValue) =>
                normalizeKey(
                  existingValue
                ) ===
                normalizeKey(value)
            );

          if (!exists) {
            data[
              normalizedKey
            ].values.push(value);
          }
        }
      );
    });

    return data;
  }, [product?.variants]);

  /*
  |--------------------------------------------------------------------------
  | Attribute Label
  |--------------------------------------------------------------------------
  */

  const getAttributeLabel = (key) => {
    if (!key) {
      return "";
    }

    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
      .trim();
  };

  /*
  |--------------------------------------------------------------------------
  | Find Selected Variant
  |--------------------------------------------------------------------------
  */

  const selectedVariant = useMemo(() => {
    const variants =
      Array.isArray(product?.variants)
        ? product.variants
        : [];

    if (variants.length === 0) {
      return null;
    }

    /*
     * If no attributes selected,
     * use first variant.
     */
    if (
      Object.keys(selectedAttributes)
        .length === 0
    ) {
      return variants[0];
    }

    /*
     * Match selected attributes
     */
    const matchingVariant =
      variants.find((variant) => {
        const attributes =
          getVariantAttributes(
            variant
          );

        return Object.entries(
          selectedAttributes
        ).every(
          ([selectedKey, selectedValue]) => {
            const variantKey =
              Object.keys(attributes).find(
                (key) =>
                  normalizeKey(key) ===
                  normalizeKey(
                    selectedKey
                  )
              );

            if (!variantKey) {
              return false;
            }

            return (
              normalizeKey(
                attributes[
                  variantKey
                ]
              ) ===
              normalizeKey(
                selectedValue
              )
            );
          }
        );
      });

    return (
      matchingVariant ||
      variants[0]
    );
  }, [
    product?.variants,
    selectedAttributes,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Handle Attribute Change
  |--------------------------------------------------------------------------
  */

  const handleAttributeChange = (
    key,
    value
  ) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Display Variant
  |--------------------------------------------------------------------------
  */

  const displayVariant =
    selectedVariant ||
    (Array.isArray(product?.variants)
      ? product.variants[0]
      : null);

  /*
  |--------------------------------------------------------------------------
  | Price
  |--------------------------------------------------------------------------
  */

  const displayPrice = Number(
    displayVariant?.price ??
      product?.discountPrice ??
      product?.price ??
      0
  );

  const displayMrp = Number(
    displayVariant?.mrp ??
      product?.mrp ??
      product?.price ??
      displayPrice
  );

  /*
  |--------------------------------------------------------------------------
  | Stock
  |--------------------------------------------------------------------------
  */

  const selectedStock = Number(
    displayVariant?.stock ??
      product?.stock ??
      0
  );

  const isOutOfStock =
    selectedStock <= 0;

  const isLowStock =
    selectedStock > 0 &&
    selectedStock <= 5;

  /*
  |--------------------------------------------------------------------------
  | Discount
  |--------------------------------------------------------------------------
  */

  const discountPercentage =
    displayMrp > displayPrice
      ? Math.round(
          ((displayMrp -
            displayPrice) /
            displayMrp) *
            100
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Display Image
  |--------------------------------------------------------------------------
  */

  const displayImage =
    displayVariant?.images?.[0] ||
    displayVariant?.image ||
    product?.thumbnail ||
    product?.images?.[0] ||
    "/placeholder-product.png";

  /*
  |--------------------------------------------------------------------------
  | Build Cart Product
  |--------------------------------------------------------------------------
  */

  const buildCartProduct = () => {
    return {
      ...product,

      productId:
        product?.productId ||
        product?._id,

      variantId:
        displayVariant?._id ||
        displayVariant?.sku ||
        null,

      sku:
        displayVariant?.sku ||
        product?.sku ||
        null,

      selectedVariant:
        displayVariant || null,

      selectedAttributes: {
        ...selectedAttributes,
      },

      price: displayPrice,

      mrp: displayMrp,

      stock: selectedStock,

      image: displayImage,

      thumbnail:
        displayVariant?.images?.[0] ||
        displayVariant?.image ||
        product?.thumbnail ||
        product?.images?.[0] ||
        displayImage,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Current Cart Item
  |--------------------------------------------------------------------------
  */

  const currentCartItem =
    useMemo(() => {
      if (!product?._id) {
        return null;
      }

      const currentVariantId =
        displayVariant?._id ||
        displayVariant?.sku ||
        "default";

      return (
        cart.find((item) => {
          const itemProductId =
            item?._id;

          const itemVariantId =
            item?.variantId ||
            item?.selectedVariant?._id ||
            item?.selectedVariant?.sku ||
            "default";

          return (
            String(itemProductId) ===
              String(product._id) &&
            String(itemVariantId) ===
              String(currentVariantId)
          );
        }) || null
      );
    }, [
      cart,
      product?._id,
      displayVariant?._id,
      displayVariant?.sku,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Current Quantity
  |--------------------------------------------------------------------------
  */

  const currentQuantity =
    Number(
      currentCartItem?.quantity
    ) || 0;

  const isInCart =
    !!currentCartItem &&
    currentQuantity > 0;

  /*
  |--------------------------------------------------------------------------
  | Cart Item ID
  |--------------------------------------------------------------------------
  */

  const currentCartItemId =
    currentCartItem
      ? getCartItemId(
          currentCartItem
        )
      : null;

  /*
  |--------------------------------------------------------------------------
  | Added Notification
  |--------------------------------------------------------------------------
  */

  const showAddedNotification =
    () => {
      setShowAddedAlert(true);

      if (alertTimerRef.current) {
        clearTimeout(
          alertTimerRef.current
        );
      }

      alertTimerRef.current =
        setTimeout(() => {
          setShowAddedAlert(false);
        }, 1800);
    };

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(
          alertTimerRef.current
        );
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    /*
     * Already in cart.
     *
     * Don't navigate to cart.
     * Quantity controls handle it.
     */
    if (isInCart) {
      return;
    }

    const cartProduct =
      buildCartProduct();

    addToCart(cartProduct);

    showAddedNotification();
  };

  /*
  |--------------------------------------------------------------------------
  | PLUS
  |--------------------------------------------------------------------------
  */

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !currentCartItem ||
      !currentCartItemId
    ) {
      return;
    }

    if (
      currentQuantity >=
      selectedStock
    ) {
      return;
    }

    updateQuantity(
      currentCartItemId,
      currentQuantity + 1
    );
  };

  /*
  |--------------------------------------------------------------------------
  | MINUS
  |--------------------------------------------------------------------------
  */

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !currentCartItem ||
      !currentCartItemId
    ) {
      return;
    }

    updateQuantity(
      currentCartItemId,
      currentQuantity - 1
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Ordered Attributes
  |--------------------------------------------------------------------------
  */

  const orderedAttributes =
    Object.entries(
      attributeData
    );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ============================================================
          CART ADDED NOTIFICATION
      ============================================================ */}

      {showAddedAlert && (
        <div className="fixed right-4 top-20 z-[10000] animate-[slideIn_.25s_ease-out]">
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Check
                size={18}
                className="text-green-600"
                strokeWidth={3}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Item added to cart
              </p>

              <p className="text-xs text-gray-500">
                {product?.name ||
                  "Product"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          PRODUCT CARD
      ============================================================ */}

      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <Link
          to={`/${
            product?.storeType ||
            product?.categoryType ||
            "grocery"
          }/product/${
            product?._id
          }`}
          onClick={(e) => {
            /*
             * Prevent accidental navigation
             * when clicking variant/cart controls.
             */
          }}
          className="block"
        >
          {/* ========================================================
              IMAGE
          ======================================================== */}

          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={displayImage}
              alt={
                product?.name ||
                "Product"
              }
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src =
                  "/placeholder-product.png";
              }}
            />

            {/* Discount */}
            {discountPercentage > 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-green-600 px-2 py-1 text-[11px] font-bold text-white">
                {discountPercentage}% OFF
              </span>
            )}

            {/* Out Of Stock */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* ========================================================
              CONTENT
          ======================================================== */}

          <div className="p-3">
            {/* Brand */}
            {product?.brand && (
              <p className="mb-1 truncate text-[11px] font-medium uppercase tracking-wide text-gray-500">
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-gray-800">
              {product?.name ||
                "Product"}
            </h3>

            {/* ======================================================
                VARIANT SELECTORS
            ====================================================== */}

            {orderedAttributes.length >
              0 && (
              <div className="mt-3 space-y-2">
                {orderedAttributes.map(
                  ([attributeKey, data]) => (
                    <div
                      key={
                        attributeKey
                      }
                    >
                      <p className="mb-1 text-[11px] font-semibold text-gray-600">
                        {getAttributeLabel(
                          data.key
                        )}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {data.values.map(
                          (value) => {
                            const isSelected =
                              normalizeKey(
                                selectedAttributes[
                                  attributeKey
                                ]
                              ) ===
                              normalizeKey(
                                value
                              );

                            return (
                              <button
                                key={`${attributeKey}-${value}`}
                                type="button"
                                onClick={(
                                  e
                                ) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  handleAttributeChange(
                                    attributeKey,
                                    value
                                  );
                                }}
                                className={`rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                                }`}
                              >
                                {value}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ======================================================
                UNIT
            ====================================================== */}

            {(displayVariant?.unit ||
              product?.unit) && (
              <p className="mt-2 text-xs text-gray-500">
                Unit:{" "}
                <span className="font-medium text-gray-700">
                  {displayVariant?.unit ||
                    product?.unit}
                </span>
              </p>
            )}

            {/* ======================================================
                PRICE
            ====================================================== */}

            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹
                {displayPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              {displayMrp >
                displayPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹
                  {displayMrp.toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}
            </div>

            {/* ======================================================
                SKU
            ====================================================== */}

            {(
              displayVariant?.sku ||
              product?.sku
            ) && (
              <p className="mt-1 truncate text-[10px] text-gray-400">
                SKU:{" "}
                {displayVariant?.sku ||
                  product?.sku}
              </p>
            )}

            {/* ======================================================
                STOCK
            ====================================================== */}

            {isLowStock && (
              <p className="mt-1 text-[11px] font-semibold text-orange-600">
                Only{" "}
                {selectedStock} left
              </p>
            )}

            {/* ======================================================
                CART ACTION
            ====================================================== */}

            <div className="mt-3">
              {!isInCart ? (
                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    isOutOfStock
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                  }`}
                >
                  <ShoppingCart
                    size={17}
                  />

                  {isOutOfStock
                    ? "OUT OF STOCK"
                    : "ADD TO CART"}
                </button>
              ) : (
                <div
                  className="flex h-[42px] w-full items-center justify-between overflow-hidden rounded-lg border border-blue-600 bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {/* Minus */}
                  <button
                    type="button"
                    onClick={
                      handleDecrease
                    }
                    className="flex h-full w-12 items-center justify-center bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus
                      size={17}
                      strokeWidth={2.5}
                    />
                  </button>

                  {/* Quantity */}
                  <div className="flex flex-1 items-center justify-center gap-1 text-sm font-bold text-gray-900">
                    <span>
                      {currentQuantity}
                    </span>
                  </div>

                  {/* Plus */}
                  <button
                    type="button"
                    onClick={
                      handleIncrease
                    }
                    disabled={
                      currentQuantity >=
                      selectedStock
                    }
                    className={`flex h-full w-12 items-center justify-center text-white transition active:scale-95 ${
                      currentQuantity >=
                      selectedStock
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    aria-label="Increase quantity"
                  >
                    <Plus
                      size={17}
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}