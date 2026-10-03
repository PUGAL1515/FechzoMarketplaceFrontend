import React from "react";

import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function HeaderActions({
  cartCount,
}) {

  return (
    <>
      {/* Wishlist */}

      <Link
        to="/wishlist"
        className="
          hidden
          sm:flex
          items-center
          gap-2
          px-2
          py-2
          text-gray-800
          hover:text-blue-700
          transition
          shrink-0
        "
        aria-label="Wishlist"
      >

        <Heart
          size={23}
          strokeWidth={1.8}
        />

        <span
          className="
            hidden
            lg:block
            text-sm
            font-medium
          "
        >
          Wishlist
        </span>

      </Link>

      {/* Cart */}

      <Link
        to="/cart"
        className="
          flex
          items-center
          gap-2
          px-2
          py-2
          text-gray-800
          hover:text-blue-700
          transition
          shrink-0
        "
        aria-label={`Cart with ${cartCount} items`}
      >

        <div className="relative">

          <ShoppingCart
            size={25}
            strokeWidth={1.8}
          />

          {/* Cart Count */}

          {cartCount > 0 && (
            <span
              className="
                absolute
                -top-2
                -right-2
                min-w-[18px]
                h-[18px]
                px-1
                bg-red-500
                text-white
                rounded-full
                text-[10px]
                font-bold
                flex
                items-center
                justify-center
                border-2
                border-white
              "
            >
              {cartCount > 99
                ? "99+"
                : cartCount}
            </span>
          )}

        </div>

        <span
          className="
            hidden
            lg:block
            text-sm
            font-medium
          "
        >
          Cart
        </span>

      </Link>
    </>
  );
}