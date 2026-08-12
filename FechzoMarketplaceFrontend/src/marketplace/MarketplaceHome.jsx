import { useEffect, useState } from "react";
import { getCategories } from "../api/categoryApi";
import CategoryCard from "../common/components/CategoryCard";

export default function MarketplaceHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(
        (data.categories || []).filter(
          (item) =>
            [
              "grocery",
              "fashion",
              "electronics"
            ].includes(item.slug)
        )
      );
    } catch (error) {
      console.error(
        "Category loading failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div>
          <h1>Everything You Need</h1>

          <p>
            Grocery, Fashion and Electronics
            delivered to your doorstep.
          </p>
        </div>
      </section>

      <section className="categories">
        <h2>Shop by Category</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                name={category.name}
                slug={category.slug}
                image={category.image}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}