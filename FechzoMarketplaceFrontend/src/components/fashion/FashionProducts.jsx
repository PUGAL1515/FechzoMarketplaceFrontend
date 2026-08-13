import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import ProductCard from "../common/ProductCard";

export default function FashionProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts({
        category: "fashion"
      });

      setProducts(data.products || []);
    } catch (error) {
      console.error(
        "Fashion products error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <h1>Fashion</h1>
        <p>Latest fashion products</p>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category="fashion"
            />
          ))}
        </div>
      )}
    </div>
  );
}