import { Link } from "react-router-dom";

export default function GroceryHome() {
  return (
    <div className="category-home grocery">
      <section className="category-hero">
        <h1>Fresh Grocery</h1>

        <p>
          Fresh groceries delivered to your
          doorstep.
        </p>

        <Link to="/grocery/products">
          Shop Grocery
        </Link>
      </section>

      <section>
        <h2>Popular Grocery Categories</h2>

        <div className="category-grid">
          <div>🥦 Vegetables</div>
          <div>🍎 Fruits</div>
          <div>🍚 Rice & Grains</div>
          <div>🥛 Dairy</div>
          <div>🍪 Snacks</div>
          <div>🥤 Beverages</div>
        </div>
      </section>
    </div>
  );
}