import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import axios from "axios"; // or your preferred method

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Change this URL according to your backend
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-200 rounded-3xl h-96"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = !product.isAvailable || product.stock === 0;
  const images = product.images?.length > 0 ? product.images : [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-[#1e3a8a]">Home</Link>
        <span>/</span>
        <button onClick={() => navigate(-1)} className="hover:text-[#1e3a8a]">
          Back
        </button>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* ================= LEFT: Images ================= */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm aspect-square flex items-center justify-center">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="text-slate-400 text-lg">No Image Available</div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? "border-[#1e3a8a] shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT: Details ================= */}
        <div className="flex flex-col">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {(product.rating > 0 || product.reviewCount > 0) && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-sm font-semibold">
                <span>★</span>
                <span>{product.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <span className="text-sm text-slate-500">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-900">
              ₹{displayPrice}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  ₹{product.price}
                </span>
                <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2.5 py-1 rounded-lg">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Unit + Stock */}
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
            {product.unit && <span>Unit: {product.unit}</span>}
            <span className={isOutOfStock ? "text-rose-600 font-medium" : "text-emerald-600"}>
              {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock})`}
            </span>
          </div>

          {/* Highlights */}
          {product.highlights?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-2">Highlights</h3>
              <ul className="space-y-1.5">
                {product.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-[#1e3a8a] mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center text-xl font-medium text-slate-600 hover:bg-slate-50"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="w-14 text-center font-semibold text-slate-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-12 h-12 flex items-center justify-center text-xl font-medium text-slate-600 hover:bg-slate-50"
                disabled={isOutOfStock}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => {
                if (!isOutOfStock) {
                  addToCart({ ...product, quantity });
                }
              }}
              disabled={isOutOfStock}
              className={`flex-1 h-12 rounded-xl font-semibold text-white transition-all active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-slate-300 cursor-not-allowed"
                  : "shadow-lg shadow-blue-900/25 hover:shadow-blue-900/40"
              }`}
              style={
                !isOutOfStock
                  ? { background: "linear-gradient(135deg, #1e3a8a, #02066f)" }
                  : {}
              }
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* Extra Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500">Delivery</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {product.deliveryInfo || "Free Delivery"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-500">Return Policy</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {product.returnPolicy || "7 Days Replacement"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}