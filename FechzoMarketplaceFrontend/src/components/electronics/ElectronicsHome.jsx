import { Link } from "react-router-dom";

export default function ElectronicsHome() {
  return (
    <div className="category-home electronics">
      <section className="category-hero">
        <h1>Electronics</h1>

        <p>
          Latest gadgets and electronics
          at great prices.
        </p>

        <Link to="/electronics/products">
          Shop Electronics
        </Link>
      </section>

      <section>
        <h2>Explore Electronics</h2>

        <div className="category-grid">
          <div>📱 Mobiles</div>
          <div>💻 Laptops</div>
          <div>📺 TVs</div>
          <div>🎧 Accessories</div>
          <div>🏠 Home Appliances</div>
        </div>
      </section>
    </div>
  );
}