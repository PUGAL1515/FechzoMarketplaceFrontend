import React from "react";
import {
  PackageCheck,
  ShoppingCart,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function ProductDescription({
  product,
  productName,
  description,
  categoryName,
  brand,
  gender,
  variants,
  selectedColor,
  selectedSize,
  activeVariant,
  currentStock,
}) {
  return (
    <>
      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">
            Product Description
          </h2>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>

      {/* =====================================================
          HIGHLIGHTS
      ====================================================== */}

      <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">
            Product Highlights
          </h2>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <PackageCheck
                size={22}
                className="text-[#2874f0] mb-3"
              />

              <p className="text-xs text-gray-500">
                Product
              </p>

              <p className="font-medium text-sm mt-1 line-clamp-2">
                {productName}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <Tag
                size={22}
                className="text-[#2874f0] mb-3"
              />

              <p className="text-xs text-gray-500">
                Category
              </p>

              <p className="font-medium text-sm mt-1">
                {categoryName}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <ShoppingCart
                size={22}
                className="text-[#2874f0] mb-3"
              />

              <p className="text-xs text-gray-500">
                Variants
              </p>

              <p className="font-medium text-sm mt-1">
                {variants.length}{" "}
                available
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <ShieldCheck
                size={22}
                className="text-[#2874f0] mb-3"
              />

              <p className="text-xs text-gray-500">
                Payment
              </p>

              <p className="font-medium text-sm mt-1">
                Secure checkout
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          SPECIFICATIONS
      ====================================================== */}

      <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">
            Specifications
          </h2>
        </div>

        <div className="divide-y divide-gray-100">

          {/* BRAND */}

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
            <span className="text-sm text-gray-500">
              Brand
            </span>

            <span className="text-sm text-gray-800 font-medium">
              {brand}
            </span>
          </div>

          {/* CATEGORY */}

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
            <span className="text-sm text-gray-500">
              Category
            </span>

            <span className="text-sm text-gray-800 font-medium">
              {categoryName}
            </span>
          </div>

          {/* GENDER */}

          {gender && (
            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
              <span className="text-sm text-gray-500">
                Gender
              </span>

              <span className="text-sm text-gray-800 font-medium capitalize">
                {gender}
              </span>
            </div>
          )}

          {/* SELECTED COLOR */}

          {selectedColor && (
            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
              <span className="text-sm text-gray-500">
                Selected Color
              </span>

              <span className="text-sm text-gray-800 font-medium capitalize">
                {selectedColor}
              </span>
            </div>
          )}

          {/* SELECTED SIZE */}

          {selectedSize && (
            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
              <span className="text-sm text-gray-500">
                Selected Size
              </span>

              <span className="text-sm text-gray-800 font-medium">
                {selectedSize}
              </span>
            </div>
          )}

          {/* SKU */}

          {activeVariant?.sku && (
            <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
              <span className="text-sm text-gray-500">
                SKU
              </span>

              <span className="text-sm text-gray-800 font-medium break-all">
                {activeVariant.sku}
              </span>
            </div>
          )}

          {/* AVAILABILITY */}

          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[200px_1fr] px-4 sm:px-5 py-4 gap-3">
            <span className="text-sm text-gray-500">
              Availability
            </span>

            <span
              className={`text-sm font-medium ${
                currentStock > 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {currentStock >
              0
                ? `${currentStock} units available`
                : "Out of stock"}
            </span>
          </div>

        </div>
      </div>
    </>
  );
}