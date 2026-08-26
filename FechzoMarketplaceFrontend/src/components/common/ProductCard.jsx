import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product, category }) {
  const { addToCart } = useCart();

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;

  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = !product.isAvailable || product.stock === 0;

  return (
    <div className="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      
      {/* ========== IMAGE (Fixed Height) ========== */}
      <Link to={`/${category}/product/${product._id}`} className="block">
        <div className="relative w-full aspect-square bg-slate-50">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No Image
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-[#256fef] text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="bg-slate-800/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ========== CONTENT (Flex grow for equal height) ========== */}
      <div className="flex flex-col flex-1 p-3 pt-2.5">
        
        {/* Brand */}
        <p className="text-[11px] text-slate-400 font-medium truncate h-4">
          {product.brand || "\u00A0"}
        </p>

        {/* Product Name - Fixed 2 lines */}
        <Link to={`/${category}/product/${product._id}`} className="mt-0.5">
          <h3 className="text-[13px] font-medium text-slate-800 leading-snug line-clamp-2 h-[36px] hover:text-[#1e3a8a] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Unit */}
        <p className="text-[12px] text-slate-500 mt-1 h-4">
          {product.unit || "\u00A0"}
        </p>

        {/* Spacer - pushes price + button to bottom */}
        <div className="flex-1"></div>

        {/* Price + ADD Button (Always at bottom) */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold text-slate-900 truncate">
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-[12px] text-slate-400 line-through shrink-0">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* ADD Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isOutOfStock) addToCart(product);
            }}
            disabled={isOutOfStock}
            className={`shrink-0 h-8 min-w-[68px] px-2.5 rounded-lg text-[13px] font-bold transition-all active:scale-95 ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
            }`}
          >
            {isOutOfStock ? "Sold" : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}