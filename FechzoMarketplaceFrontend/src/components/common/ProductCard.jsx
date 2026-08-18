import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function ProductCard({
  product,
  category,
}) {
  const { addToCart } = useCart();

  const price =
    product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* PRODUCT IMAGE */}
      <Link
        to={`/${category}/product/${product._id}`}
        className="block"
      >
        <div className="relative flex h-60 items-center justify-center overflow-hidden bg-gray-50">

          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No Image
            </div>
          )}

          {/* DISCOUNT */}
          {product.discountPrice > 0 &&
            product.price > product.discountPrice && (
              <span className="absolute left-3 top-3 rounded-md bg-[#154FCB] px-2.5 py-1 text-[11px] font-bold text-white">
                {Math.round(
                  ((product.price - product.discountPrice) /
                    product.price) *
                    100
                )}
                % OFF
              </span>
            )}

        </div>
      </Link>

      {/* PRODUCT INFO */}
      <div className="p-4">

        {/* BRAND */}
        {product.brand && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#154FCB]">
            {product.brand}
          </p>
        )}

        {/* PRODUCT NAME */}
        <Link
          to={`/${category}/product/${product._id}`}
          className="no-underline"
        >
          <h3 className="line-clamp-2 min-h-[42px] text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#154FCB]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="mt-3 flex items-center gap-2">

          <span className="text-lg font-bold text-[#154FCB]">
            ₹{Number(price).toLocaleString("en-IN")}
          </span>

          {product.discountPrice > 0 &&
            product.price > product.discountPrice && (
              <del className="text-xs text-gray-400">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </del>
            )}

        </div>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#154FCB] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#103DA1] active:scale-[0.98]"
        >
          <ShoppingCart size={17} />
          Add to Cart
        </button>

      </div>
    </div>
  );
}