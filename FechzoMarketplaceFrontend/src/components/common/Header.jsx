import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const location = useLocation();
  const { cartCount } = useCart();

  const currentCategory = location.pathname.split("/")[1];

  const navItems = [
    { name: "Grocery", path: "/grocery", icon: "🛒" },
    { name: "Fashion", path: "/fashion", icon: "👗" },
    { name: "Electronics", path: "/electronics", icon: "📱" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(30,58,138,0.08)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-[70px] gap-2 sm:gap-4">
          
          {/* Logo - Always visible & compact on mobile */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
            aria-label="Fechzo Home"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30 bg-gradient-to-br from-[#1e3a8a] to-[#02066f] group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-lg sm:text-xl tracking-tighter">F</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#1e3a8a] to-[#02066f] bg-clip-text text-transparent">
                Fechzo
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 -mt-0.5 hidden xs:block">
                Shop Smart
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            {navItems.map((item) => {
              const isActive = currentCategory === item.path.slice(1);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-600 hover:text-[#1e3a8a] hover:bg-white/80"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #1e3a8a, #02066f)" }
                      : {}
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative group flex items-center gap-2 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-blue-900/25 hover:shadow-blue-900/40 shrink-0"
            style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
            aria-label={`Cart with ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 group-hover:rotate-[-8deg] transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <span className="font-semibold text-sm hidden sm:inline tracking-wide">
              Cart
            </span>

            {/* Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md shadow-rose-500/40 border-2 border-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Navigation - Full width scrollable bar below logo row */}
        <div className="md:hidden pb-3 -mt-1">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = currentCategory === item.path.slice(1);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? "text-white shadow-md shadow-blue-900/25"
                      : "bg-slate-100 text-slate-600 active:scale-95"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #1e3a8a, #02066f)" }
                      : {}
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}