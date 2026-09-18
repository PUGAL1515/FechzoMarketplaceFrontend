import React from "react";
import {
  Check,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Zap,
} from "lucide-react";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getAttribute = (
  variant,
  attributeName
) => {
  if (!variant?.attributes) return "";

  const target =
    normalize(attributeName);

  const key = Object.keys(
    variant.attributes
  ).find(
    (key) =>
      normalize(key) === target
  );

  return key
    ? variant.attributes[key]
    : "";
};

const getVariantStock = (
  variant
) => {
  const stock = Number(
    variant?.stock
  );

  return Number.isFinite(stock) &&
    stock > 0
    ? stock
    : 0;
};

const getDiscountPercentage = (
  price,
  mrp
) => {
  const sellingPrice =
    Number(price);

  const originalPrice =
    Number(mrp);

  if (
    !Number.isFinite(
      sellingPrice
    ) ||
    !Number.isFinite(
      originalPrice
    ) ||
    originalPrice <=
      sellingPrice ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice -
      sellingPrice) /
      originalPrice) *
      100
  );
};

const getColorStyle = (
  color
) => {
  const normalized =
    normalize(color);

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

  if (
    normalized.startsWith("#")
  ) {
    return normalized;
  }

  return (
    colors[normalized] ||
    "#e5e7eb"
  );
};

const getVariantImages = (
  variant
) => {
  if (!variant?.images) {
    return [];
  }

  if (
    Array.isArray(
      variant.images
    )
  ) {
    return variant.images.filter(
      Boolean
    );
  }

  if (
    typeof variant.images ===
    "string"
  ) {
    return [variant.images];
  }

  return [];
};

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
};

export default function ProductInfo({
  product,
  brand,
  productName,
  categoryName,
  gender,
  productRating,
  reviewCount,
  currentPrice,
  currentMrp,
  currentStock,
  isOutOfStock,
  activeVariant,
  variants,
  colorOptions,
  selectedColor,
  selectedColorVariants,
  selectedSize,
  sizeOptions,
  quantity,
  decreaseQuantity,
  increaseQuantity,
  handleColorChange,
  handleSizeChange,
  handleAddToCart,
  handleBuyNow,
  isInCart,
}) {
  const discountPercentage =
    getDiscountPercentage(
      currentPrice,
      currentMrp
    );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6">

        {/* BRAND */}

        <div className="text-sm font-semibold text-[#2874f0] mb-2">
          {brand}
        </div>

        {/* TITLE */}

        <h1 className="text-xl sm:text-2xl font-medium leading-7 sm:leading-8 text-gray-900">
          {productName}
        </h1>

        {/* GENDER */}

        {gender && (
          <div className="text-xs sm:text-sm text-gray-500 mt-2">
            For{" "}
            {String(gender)}
          </div>
        )}

        {/* RATING */}

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="inline-flex items-center gap-1 bg-[#388e3c] text-white px-2.5 py-1 rounded-md text-xs font-bold">
            {Number.isFinite(
              productRating
            )
              ? productRating.toFixed(
                  1
                )
              : "4.3"}

            <Star
              size={12}
              fill="white"
            />
          </div>

          <span className="text-sm text-gray-500">
            {reviewCount > 0
              ? `${reviewCount.toLocaleString()} Ratings & Reviews`
              : "Ratings & Reviews"}
          </span>
        </div>

        <div className="border-b border-gray-200 my-5" />

        {/* PRICE */}

        <div>
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
              ₹
              {formatPrice(
                currentPrice
              )}
            </span>

            {currentMrp >
              currentPrice && (
              <>
                <span className="text-base text-gray-500 line-through mb-1">
                  ₹
                  {formatPrice(
                    currentMrp
                  )}
                </span>

                <span className="text-sm font-bold text-[#388e3c] mb-1">
                  {
                    discountPercentage
                  }
                  % off
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Inclusive of all taxes
          </p>
        </div>

        {/* OFFERS */}

        <div className="mt-6">
          <h3 className="font-semibold text-base text-gray-900 mb-3">
            Available offers
          </h3>

          <div className="space-y-3">

            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 flex items-center justify-center">
                <Tag
                  size={16}
                  className="text-[#388e3c]"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Special Price
                </p>

                <p className="text-xs text-gray-500 mt-0.5 leading-5">
                  Get extra discount on selected products.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 flex items-center justify-center">
                <Truck
                  size={16}
                  className="text-[#388e3c]"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Free Delivery
                </p>

                <p className="text-xs text-gray-500 mt-0.5 leading-5">
                  Delivery available to your location.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 flex items-center justify-center">
                <ShieldCheck
                  size={16}
                  className="text-[#388e3c]"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">
                  Secure Payment
                </p>

                <p className="text-xs text-gray-500 mt-0.5 leading-5">
                  Your payment information is protected.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* COLOR */}

        {colorOptions.length >
          0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold">
                Color
              </span>

              <span className="text-sm text-gray-500 capitalize">
                {selectedColor}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map(
                (option) => {
                  const color =
                    option.value;

                  const colorVariant =
                    variants.find(
                      (variant) =>
                        normalize(
                          getAttribute(
                            variant,
                            "color"
                          )
                        ) ===
                        normalize(color)
                    );

                  const colorImages =
                    getVariantImages(
                      colorVariant
                    );

                  const image =
                    colorImages[0] ||
                    product.thumbnail ||
                    product.images?.[0];

                  const selected =
                    normalize(
                      selectedColor
                    ) ===
                    normalize(color);

                  const colorStock =
                    variants
                      .filter(
                        (variant) =>
                          normalize(
                            getAttribute(
                              variant,
                              "color"
                            )
                          ) ===
                          normalize(color)
                      )
                      .reduce(
                        (
                          total,
                          variant
                        ) =>
                          total +
                          getVariantStock(
                            variant
                          ),
                        0
                      );

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        handleColorChange(
                          color
                        )
                      }
                      className={`relative w-[72px] h-[84px] rounded-lg border bg-white flex flex-col items-center justify-center transition overflow-hidden ${
                        selected
                          ? "border-[#2874f0] border-2 shadow-sm"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="w-[48px] h-[48px] flex items-center justify-center">
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
                              backgroundColor:
                                getColorStyle(
                                  color
                                ),
                            }}
                          />
                        )}
                      </div>

                      <span className="text-[11px] mt-1 capitalize truncate max-w-[62px]">
                        {color}
                      </span>

                      {colorStock <=
                        0 && (
                        <span className="absolute inset-0 bg-white/75 flex items-center justify-center">
                          <span className="text-[8px] text-red-500 font-bold rotate-[-12deg]">
                            OUT OF STOCK
                          </span>
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* SIZE */}

        {sizeOptions.length >
          0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold">
                Size
              </span>

              <button
                type="button"
                className="text-xs text-[#2874f0] font-medium hover:underline"
              >
                Size Chart
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(
                (option) => {
                  const size =
                    option.value;

                  const variant =
                    variants.find(
                      (item) =>
                        normalize(
                          getAttribute(
                            item,
                            "color"
                          )
                        ) ===
                          normalize(
                            selectedColor
                          ) &&
                        normalize(
                          getAttribute(
                            item,
                            "size"
                          )
                        ) ===
                          normalize(size)
                    );

                  const stock =
                    getVariantStock(
                      variant ||
                        option.variant
                    );

                  const selected =
                    normalize(
                      selectedSize
                    ) ===
                    normalize(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={
                        stock <= 0
                      }
                      onClick={() =>
                        handleSizeChange(
                          size
                        )
                      }
                      className={`min-w-[58px] h-10 px-4 rounded-md text-sm border font-medium relative transition ${
                        selected
                          ? "border-[#2874f0] text-[#2874f0] bg-blue-50"
                          : stock <= 0
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:border-[#2874f0]"
                      }`}
                    >
                      {size}

                      {stock <=
                        0 && (
                        <span className="absolute left-1 right-1 top-1/2 h-px bg-gray-300 rotate-[-15deg]" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* SELECTED VARIANT */}

        {activeVariant && (
          <div className="mt-6 rounded-lg bg-gray-50 border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-4">

              <div>
                <span className="text-xs text-gray-500">
                  SKU
                </span>

                <p className="font-medium text-sm text-gray-800 mt-1 break-all">
                  {activeVariant.sku ||
                    "N/A"}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-500">
                  Stock
                </span>

                <p
                  className={`font-medium text-sm mt-1 ${
                    currentStock >
                    0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {currentStock >
                  0
                    ? `${currentStock} available`
                    : "Out of stock"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* QUANTITY */}

        {!isOutOfStock && (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-semibold">
              Quantity
            </span>

            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:text-gray-300 transition"
              >
                <Minus size={15} />
              </button>

              <div className="w-12 h-10 border-x border-gray-300 flex items-center justify-center text-sm font-semibold">
                {quantity}
              </div>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  quantity >=
                  currentStock
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:text-gray-300 transition"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STOCK STATUS */}

        <div className="mt-5">
          {isOutOfStock ? (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 flex items-start gap-3">
              <PackageCheck
                size={20}
                className="text-red-500 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold text-red-600 text-sm">
                  Currently unavailable
                </p>

                <p className="text-xs text-red-500 mt-1 leading-5">
                  This selected variant is out of stock. Please choose another variant.
                </p>
              </div>
            </div>
          ) : currentStock <=
            5 ? (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500" />

              Hurry! Only{" "}
              {currentStock}{" "}
              left in stock.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
              <Check size={16} />

              In Stock
            </div>
          )}
        </div>

        {/* DELIVERY */}

        <div className="mt-6 pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold mb-4">
            Delivery & Services
          </h3>

          <div className="space-y-4">

            <div className="flex gap-3">
              <Truck
                size={20}
                className="text-gray-500 shrink-0"
              />

              <div>
                <p className="text-sm font-medium">
                  Fast Delivery
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Fast and reliable delivery available.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <RotateCcw
                size={20}
                className="text-gray-500 shrink-0"
              />

              <div>
                <p className="text-sm font-medium">
                  7 Days Replacement
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Replacement policy applicable as per product conditions.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="text-gray-500 shrink-0"
              />

              <div>
                <p className="text-sm font-medium">
                  Secure Payments
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Safe and secure checkout.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =================================================
          MOBILE ACTION BUTTONS
      ================================================= */}

      <div className="lg:hidden grid grid-cols-2 border-t border-gray-200">
        <button
          type="button"
          onClick={
            handleAddToCart
          }
          disabled={
            isOutOfStock
          }
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock
              ? "bg-gray-400"
              : "bg-[#ff9f00] active:bg-[#f59b00]"
          }`}
        >
          <ShoppingCart
            size={19}
          />

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
          disabled={
            isOutOfStock
          }
          className={`h-14 flex items-center justify-center gap-2 font-bold text-white ${
            isOutOfStock
              ? "bg-gray-400"
              : "bg-[#fb641b] active:bg-[#e85b17]"
          }`}
        >
          <Zap size={19} />

          BUY NOW
        </button>
      </div>
    </div>
  );
}