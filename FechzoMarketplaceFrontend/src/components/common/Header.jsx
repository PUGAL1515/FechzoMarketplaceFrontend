import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const location = useLocation();
  const { cartCount } = useCart();

  const category =
    location.pathname.split("/")[1];

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          Fechzo
        </Link>

        <nav>
          <Link to="/grocery">Grocery</Link>
          <Link to="/fashion">Fashion</Link>
          <Link to="/electronics">Electronics</Link>
        </nav>

        <Link to="/cart" className="cart-btn">
          🛒 Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}