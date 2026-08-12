import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({
  product,
  category
}) {
  const { addToCart } = useCart();

  const price =
    product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  return (
    <div className="product-card">
      <Link
        to={`/${category}/product/${product._id}`}
      >
        <div className="product-image">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
            />
          ) : (
            <div className="no-image">
              No Image
            </div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <small>{product.brand}</small>

        <h3>{product.name}</h3>

        <div className="price">
          ₹{price}
        </div>

        {product.discountPrice > 0 && (
          <del>₹{product.price}</del>
        )}

        <button
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}