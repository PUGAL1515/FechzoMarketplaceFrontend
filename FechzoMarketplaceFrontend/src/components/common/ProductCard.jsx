import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product, category }) {
  const { addToCart } = useCart();

  // ============================================================
  // VARIANTS
  // ============================================================

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  // ============================================================
  // GET VARIANT ATTRIBUTES
  // Supports:
  // attributes: {
  //   color: "Black",
  //   size: "M",
  //   ram: "8 GB"
  // }
  //
  // Also supports older structure / SKU fallback.
  // ============================================================

  const normalizeKey = (key) => {
    return String(key || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  };

  const getVariantAttributes = (variant) => {
    const attributes = {};

    // ----------------------------------------------------------
    // New structure
    // ----------------------------------------------------------

    if (
      variant?.attributes &&
      typeof variant.attributes === "object" &&
      !Array.isArray(variant.attributes)
    ) {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          attributes[key] = value;
        }
      });
    }

    // ----------------------------------------------------------
    // Support common direct fields too
    // ----------------------------------------------------------

    const possibleFields = [
      "color",
      "size",
      "ram",
      "storage",
      "capacity",
      "weight",
      "material",
      "length",
      "width",
      "height",
      "memory",
      "variant",
      "model",
      "type",
    ];

    possibleFields.forEach((field) => {
      if (
        variant?.[field] !== undefined &&
        variant?.[field] !== null &&
        String(variant[field]).trim() !== ""
      ) {
        if (!attributes[field]) {
          attributes[field] = variant[field];
        }
      }
    });

    // ----------------------------------------------------------
    // OLD SKU fallback
    //
    // Example:
    // TS-BLK-S
    // TS-BLK-M
    //
    // We can infer:
    // BLK -> Black
    // S   -> Size S
    // ----------------------------------------------------------

    if (Object.keys(attributes).length === 0 && variant?.sku) {
      const skuParts = String(variant.sku)
        .split("-")
        .map((item) => item.trim())
        .filter(Boolean);

      if (skuParts.length >= 2) {
        const colorMap = {
          BLK: "Black",
          BLACK: "Black",
          WHT: "White",
          WHITE: "White",
          RED: "Red",
          BLU: "Blue",
          BLUE: "Blue",
          GRN: "Green",
          GREEN: "Green",
          YLW: "Yellow",
          YELLOW: "Yellow",
          PNK: "Pink",
          PINK: "Pink",
          GRY: "Grey",
          GREY: "Grey",
          GRAY: "Gray",
          ORG: "Orange",
          ORANGE: "Orange",
          PUR: "Purple",
          PURPLE: "Purple",
          NAVY: "Navy",
          BROWN: "Brown",
        };

        const sizeValues = [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "XXXL",
          "2XL",
          "3XL",
          "4XL",
        ];

        const lastPart = skuParts[skuParts.length - 1].toUpperCase();

        // Example TS-BLK-S
        if (colorMap[skuParts[skuParts.length - 2]?.toUpperCase()]) {
          attributes.color =
            colorMap[skuParts[skuParts.length - 2].toUpperCase()];
        }

        if (sizeValues.includes(lastPart)) {
          attributes.size = lastPart;
        }
      }
    }

    return attributes;
  };

  // ============================================================
  // BUILD ATTRIBUTE DATA
  // ============================================================

  const attributeData = useMemo(() => {
    const data = {};

    variants.forEach((variant) => {
      const attributes = getVariantAttributes(variant);

      Object.entries(attributes).forEach(([key, value]) => {
        if (!data[key]) {
          data[key] = [];
        }

        const exists = data[key].some(
          (item) =>
            String(item).toLowerCase() === String(value).toLowerCase()
        );

        if (!exists) {
          data[key].push(value);
        }
      });
    });

    return data;
  }, [variants]);

  // ============================================================
  // SELECTED VARIANT
  // ============================================================

  const [selectedAttributes, setSelectedAttributes] = useState({});

  const getAttributeLabel = (key) => {
    const labels = {
      color: "Color",
      size: "Size",
      ram: "RAM",
      storage: "Storage",
      capacity: "Capacity",
      weight: "Weight",
      material: "Material",
      length: "Length",
      width: "Width",
      height: "Height",
      memory: "Memory",
      model: "Model",
      type: "Type",
      variant: "Variant",
    };

    return (
      labels[normalizeKey(key)] ||
      String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
    );
  };

  // ============================================================
  // FIND MATCHING VARIANT
  // ============================================================

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    // No selection yet
    if (Object.keys(selectedAttributes).length === 0) {
      return variants.find((variant) => Number(variant.stock || 0) > 0) ||
        variants[0];
    }

    const match = variants.find((variant) => {
      const attributes = getVariantAttributes(variant);

      return Object.entries(selectedAttributes).every(
        ([key, selectedValue]) =>
          String(attributes[key] || "").toLowerCase() ===
          String(selectedValue).toLowerCase()
      );
    });

    return match || variants[0];
  }, [variants, selectedAttributes]);

  // ============================================================
  // CHANGE ATTRIBUTE
  // ============================================================

  const handleAttributeChange = (key, value) => {
    setSelectedAttributes((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ============================================================
  // PRICE
  // ============================================================

  const displayVariant = selectedVariant || variants[0] || null;

  const productPrice = Number(product?.price || 0);

  const variantPrice = Number(displayVariant?.price || 0);

  const productMrp = Number(product?.mrp || 0);

  const variantMrp = Number(displayVariant?.mrp || 0);

  const displayPrice =
    variantPrice > 0 ? variantPrice : productPrice;

  const displayMrp =
    variantMrp > 0
      ? variantMrp
      : productMrp > 0
      ? productMrp
      : 0;

  const hasDiscount =
    displayMrp > displayPrice && displayPrice > 0;

  const discountPercent = hasDiscount
    ? Math.round(
        ((displayMrp - displayPrice) / displayMrp) * 100
      )
    : 0;

  // ============================================================
  // STOCK
  // ============================================================

  const totalStock = variants.length
    ? variants.reduce(
        (total, variant) =>
          total + Number(variant?.stock || 0),
        0
      )
    : Number(product?.stock || 0);

  const selectedStock = variants.length
    ? Number(displayVariant?.stock || 0)
    : Number(product?.stock || 0);

  const isProductInactive =
    product?.isActive === false ||
    product?.status === "rejected" ||
    product?.isDeleted === true;

  const isOutOfStock =
    isProductInactive ||
    (variants.length
      ? selectedStock <= 0
      : totalStock <= 0);

  // ============================================================
  // IMAGE
  // ============================================================

  const displayImage =
    displayVariant?.image ||
    displayVariant?.images?.[0] ||
    product?.thumbnail ||
    product?.images?.[0] ||
    "https://via.placeholder.com/500x500?text=No+Image";

  // ============================================================
  // ADD TO CART
  // ============================================================

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const cartProduct = {
      ...product,

      // Selected variant
      selectedVariant: displayVariant,

      // Keep these convenient fields for CartContext
      variantId: displayVariant?._id || null,
      sku: displayVariant?.sku || product?.sku || null,

      price: displayPrice,
      mrp: displayMrp,

      stock: selectedStock,

      selectedAttributes: {
        ...selectedAttributes,
      },

      image: displayImage,
    };

    addToCart(cartProduct);
  };

  // ============================================================
  // ATTRIBUTE ORDER
  // ============================================================

  const orderedAttributes = Object.entries(attributeData).sort(
    ([keyA], [keyB]) => {
      const priority = {
        color: 1,
        size: 2,
        ram: 3,
        storage: 4,
        capacity: 5,
        weight: 6,
      };

      return (
        (priority[normalizeKey(keyA)] || 99) -
        (priority[normalizeKey(keyB)] || 99)
      );
    }
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="group h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200">

      {/* ======================================================
          PRODUCT IMAGE
      ======================================================= */}

      <Link
        to={`/${category}/product/${product?._id}`}
        className="block"
      >
        <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">

          <img
            src={displayImage}
            alt={product?.name || "Product"}
            className="w-full h-full object-contain p-3 group-hover:scale-[1.04] transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount */}

          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-[#2874f0] text-white text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {/* Stock */}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock */}

          {!isOutOfStock &&
            selectedStock > 0 &&
            selectedStock <= 5 && (
              <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                Only {selectedStock} left
              </div>
            )}
        </div>
      </Link>

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <div className="flex flex-col flex-1 p-3">

        {/* Brand */}

        <p className="text-[11px] text-slate-400 font-medium truncate mb-0.5">
          {product?.brand || "\u00A0"}
        </p>

        {/* Product Name */}

        <Link
          to={`/${category}/product/${product?._id}`}
        >
          <h3 className="text-[13px] sm:text-[14px] font-medium text-slate-800 leading-snug line-clamp-2 min-h-[38px] hover:text-[#2874f0] transition-colors">
            {product?.name}
          </h3>
        </Link>

        {/* ==================================================
            DYNAMIC VARIANTS
        =================================================== */}

        {orderedAttributes.length > 0 && (
          <div className="mt-2 space-y-2">

            {orderedAttributes.map(([key, values]) => {
              const normalizedKey = normalizeKey(key);

              return (
                <div key={key}>

                  {/* Attribute Title */}

                  <div className="flex items-center gap-1 mb-1">

                    <span className="text-[11px] font-semibold text-slate-600">
                      {getAttributeLabel(key)}:
                    </span>

                    {selectedAttributes[key] && (
                      <span className="text-[11px] text-slate-900 font-medium">
                        {selectedAttributes[key]}
                      </span>
                    )}
                  </div>

                  {/* Options */}

                  <div className="flex flex-wrap gap-1.5">

                    {values.map((value) => {
                      const isSelected =
                        String(
                          selectedAttributes[key] || ""
                        ).toLowerCase() ===
                        String(value).toLowerCase();

                      // Check whether this combination exists
                      const optionVariantExists = variants.some(
                        (variant) => {
                          const attrs =
                            getVariantAttributes(variant);

                          return (
                            String(attrs[key] || "").toLowerCase() ===
                              String(value).toLowerCase() &&
                            Object.entries(selectedAttributes)
                              .filter(
                                ([selectedKey]) =>
                                  selectedKey !== key
                              )
                              .every(
                                ([selectedKey, selectedValue]) =>
                                  String(
                                    attrs[selectedKey] || ""
                                  ).toLowerCase() ===
                                  String(
                                    selectedValue
                                  ).toLowerCase()
                              )
                          );
                        }
                      );

                      const optionDisabled =
                        !optionVariantExists;

                      // Color values
                      const colorNames = [
                        "black",
                        "white",
                        "red",
                        "blue",
                        "green",
                        "yellow",
                        "orange",
                        "purple",
                        "pink",
                        "grey",
                        "gray",
                        "brown",
                        "navy",
                      ];

                      const isColor =
                        normalizedKey === "color" &&
                        colorNames.includes(
                          String(value).toLowerCase()
                        );

                      return (
                        <button
                          key={`${key}-${value}`}
                          type="button"
                          disabled={optionDisabled}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!optionDisabled) {
                              handleAttributeChange(
                                key,
                                value
                              );
                            }
                          }}
                          className={`
                            relative
                            transition-all
                            duration-150
                            ${
                              isColor
                                ? "w-7 h-7 rounded-full"
                                : "min-w-[32px] px-2 h-7 rounded-md text-[11px]"
                            }
                            border
                            ${
                              isSelected
                                ? "border-[#2874f0] ring-2 ring-[#2874f0]/20 bg-blue-50 text-[#2874f0] font-bold"
                                : "border-slate-300 bg-white text-slate-700 hover:border-[#2874f0]"
                            }
                            ${
                              optionDisabled
                                ? "opacity-35 cursor-not-allowed line-through"
                                : "cursor-pointer"
                            }
                          `}
                          title={
                            optionDisabled
                              ? "Not available"
                              : String(value)
                          }
                        >
                          {isColor ? (
                            <span
                              className="absolute inset-1 rounded-full border border-black/10"
                              style={{
                                backgroundColor:
                                  String(value).toLowerCase(),
                              }}
                            />
                          ) : (
                            value
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================================================
            UNIT
        =================================================== */}

        {product?.unit && (
          <p className="text-[11px] text-slate-500 mt-2">
            {product.unit}
          </p>
        )}

        <div className="flex-1" />

        {/* ==================================================
            PRICE + STOCK
        =================================================== */}

        <div className="mt-3">

          <div className="flex items-center gap-1.5 flex-wrap">

            <span className="text-[16px] font-bold text-slate-900">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <span className="text-[12px] text-slate-400 line-through">
                ₹{displayMrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Selected Variant SKU */}

          {displayVariant?.sku && (
            <p className="text-[9px] text-slate-400 mt-0.5 truncate">
              SKU: {displayVariant.sku}
            </p>
          )}

          {/* Selected Stock */}

          {!isOutOfStock && variants.length > 0 && (
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {selectedStock} available
            </p>
          )}
        </div>

        {/* ==================================================
            ADD BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`
            w-full
            mt-2.5
            h-9
            rounded-lg
            text-[13px]
            font-bold
            transition-all
            active:scale-[0.98]
            ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white text-[#2874f0] border border-[#2874f0] hover:bg-[#2874f0] hover:text-white"
            }
          `}
        >
          {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}