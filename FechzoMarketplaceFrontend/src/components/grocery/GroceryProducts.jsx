import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import ProductCard from "../common/components/ProductCard";

export default function GroceryProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts({
        category: "grocery"
      });

      setProducts(data.products || []);
    } catch (error) {
      console.error(
        "Grocery products error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-page">
      <div className="page-heading">
        <h1>Grocery Products</h1>
        <p>Fresh products near you</p>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category="grocery"
            />
          ))}
        </div>
      )}
    </div>
  );
}