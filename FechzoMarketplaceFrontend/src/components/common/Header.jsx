import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const location = useLocation();
  const { cartCount } = useCart();

  const currentCategory = location.pathname.split("/")[1];

  const navItems = [
    { name: "Grocery", path: "/grocery" },
    { name: "Fashion", path: "/fashion" },
    { name: "Electronics", path: "/electronics" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
            >
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "#1e3a8a" }}>
              Fechzo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentCategory === item.path.slice(1);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-gray-800 hover:text-[#1e3a8a] hover:bg-blue-50"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #1e3a8a, #02066f)" }
                      : {}
                  }
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Mobile Navigation */}
            <div className="md:hidden flex gap-1.5">
              {navItems.map((item) => {
                const isActive = currentCategory === item.path.slice(1);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive ? "text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    style={
                      isActive
                        ? { background: "linear-gradient(135deg, #1e3a8a, #02066f)" }
                        : {}
                    }
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-white px-4 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              <span className="font-medium text-sm hidden sm:inline">Cart</span>

              {/* Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#1e3a8a] text-xs font-bold rounded-full flex items-center justify-center shadow border border-[#1e3a8a]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}