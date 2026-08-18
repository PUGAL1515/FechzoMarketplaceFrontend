import { Link } from "react-router-dom";

export default function FashionHome() {
  return (
    <div className="category-home fashion">
      <section className="category-hero">
        <h1>Fashion</h1>

        <p>
          Discover the latest styles for
          everyone.
        </p>

        <Link to="/fashion/products">
          Shop Fashion
        </Link>
      </section>

      <section>
        <h2>Shop Fashion</h2>

        <div className="category-grid">
          <div>👔 Men</div>
          <div>👗 Women</div>
          <div>🧒 Kids</div>
          <div>👟 Footwear</div>
          <div>👜 Accessories</div>
        </div>
      </section>
    </div>
  );
}