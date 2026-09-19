import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
} from "lucide-react";

import ProductShare from "./ProductShare";

export default function ProductGallery({
  product,
  productName,
  activeImages,
  activeImageIndex,
  setActiveImageIndex,
  wishlist,
  handleWishlist,
  handleAddToCart,
  handleBuyNow,
  isOutOfStock,
  isInCart,
}) {
  const nextImage = () => {
    if (!activeImages.length) return;

    setActiveImageIndex(
      (previous) =>
        (previous + 1) %
        activeImages.length
    );
  };

  const previousImage = () => {
    if (!activeImages.length) return;

    setActiveImageIndex(
      (previous) =>
        (previous -
          1 +
          activeImages.length) %
        activeImages.length
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row">

        {/* =================================================
            DESKTOP THUMBNAILS
        ================================================= */}

        <div className="hidden sm:block w-[82px] shrink-0 border-r border-gray-100 p-2">
          <div className="space-y-2 max-h-[610px] overflow-y-auto">
            {activeImages.length > 0 ? (
              activeImages.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        index
                      )
                    }
                    className={`w-[64px] h-[70px] rounded border flex items-center justify-center bg-white overflow-hidden transition ${
                      activeImageIndex ===
                      index
                        ? "border-[#2874f0] border-2"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${
                        index + 1
                      }`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                )
              )
            ) : (
              <div className="w-[64px] h-[70px] bg-gray-100 rounded" />
            )}
          </div>
        </div>

        <div className="flex-1 relative">

          {/* =================================================
              TOP ACTIONS
          ================================================= */}

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex gap-2">
            <button
              type="button"
              onClick={
                handleWishlist
              }
              className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:shadow-lg transition"
              title={
                wishlist
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                size={21}
                className={
                  wishlist
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500"
                }
              />
            </button>

            <ProductShare
              productName={
                productName
              }
            />
          </div>

          {/* =================================================
              MAIN IMAGE
          ================================================= */}

          <div className="h-[330px] sm:h-[430px] md:h-[500px] lg:h-[540px] xl:h-[580px] flex items-center justify-center px-5 sm:px-10 py-8 relative">
            {activeImages.length > 0 ? (
              <img
                src={
                  activeImages[
                    activeImageIndex
                  ]
                }
                alt={productName}
                className="max-h-full max-w-full object-contain select-none"
              />
            ) : (
              <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}

            {/* PREVIOUS */}

            {activeImages.length >
              1 && (
              <button
                type="button"
                onClick={
                  previousImage
                }
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-14 sm:w-10 sm:h-16 rounded-r-md bg-white/95 shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Previous image"
              >
                <ChevronLeft
                  size={23}
                />
              </button>
            )}

            {/* NEXT */}

            {activeImages.length >
              1 && (
              <button
                type="button"
                onClick={
                  nextImage
                }
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-14 sm:w-10 sm:h-16 rounded-l-md bg-white/95 shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Next image"
              >
                <ChevronRight
                  size={23}
                />
              </button>
            )}
          </div>

          {/* =================================================
              MOBILE THUMBNAILS
          ================================================= */}

          {activeImages.length >
            1 && (
            <div className="sm:hidden border-t border-gray-100 px-3 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {activeImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`${image}-mobile-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImageIndex(
                          index
                        )
                      }
                      className={`w-14 h-14 rounded border flex items-center justify-center bg-white overflow-hidden ${
                        activeImageIndex ===
                        index
                          ? "border-[#2874f0] border-2"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* =================================================
              IMAGE COUNTER
          ================================================= */}

          {activeImages.length >
            1 && (
            <div className="text-center text-[11px] text-gray-400 pb-2">
              {activeImageIndex +
                1}{" "}
              /{" "}
              {activeImages.length}
            </div>
          )}

          {/* =================================================
              DESKTOP ACTION BUTTONS
          ================================================= */}

          <div className="hidden lg:grid grid-cols-2 border-t border-gray-100">
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                isOutOfStock
              }
              className={`h-14 flex items-center justify-center gap-2 font-bold text-white transition ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ff9f00] hover:bg-[#f59b00]"
              }`}
            >
              <ShoppingCart
                size={20}
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
              className={`h-14 flex items-center justify-center gap-2 font-bold text-white transition ${
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
  );
}