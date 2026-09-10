import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import SignInModal from "./SignInModal";

export default function Header() {
  const location = useLocation();
  const { cartCount } = useCart();

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const currentCategory = location.pathname.split("/")[1];

  const navItems = [
    { name: "Grocery", path: "/grocery", icon: "🛒" },
    { name: "Fashion", path: "/fashion", icon: "👗" },
    { name: "Electronics", path: "/electronics", icon: "📱" },
  ];

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================
  const loadUser = () => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt_token") ||
        localStorage.getItem("token");

      const storedUser = localStorage.getItem("userProfile");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-changed", loadUser);
    const timer = setTimeout(loadUser, 300);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-changed", loadUser);
      clearTimeout(timer);
    };
  }, []);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfile && !e.target.closest(".profile-dropdown")) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");

    setUser(null);
    setShowProfile(false);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/";
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const getUserName = () => {
    if (!user) return "Account";
    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.firstName ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserInitial = () => getUserName().charAt(0).toUpperCase();

  const avatarUrl =
    user?.profilePicture || user?.profileImage || user?.avatar || null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(30,58,138,0.08)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          {/* MAIN HEADER ROW */}
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-17.5 gap-2 sm:gap-4">
            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
              aria-label="Fechzo Home"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-900 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30 bg-linear-to-br from-[#1e3a8a] to-[#02066f] group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-black text-lg sm:text-xl tracking-tighter">
                    F
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-linear-to-r from-[#1e3a8a] to-[#02066f] bg-clip-text text-transparent">
                  Fechzo
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 -mt-0.5 hidden xs:block">
                  Shop Smart
                </span>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
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

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <div className="relative profile-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowProfile((prev) => !prev)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl hover:bg-slate-100 transition-all duration-200"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-[#1e3a8a] to-[#02066f] text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={getUserName()}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getUserInitial()
                      )}
                    </div>

                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Welcome
                      </span>
                      <span className="text-sm font-semibold text-slate-700 max-w-25 truncate">
                        {getUserName()}
                      </span>
                    </div>

                    <svg
                      className={`hidden sm:block w-4 h-4 text-slate-500 transition-transform ${
                        showProfile ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-100">
                      <div className="px-4 py-4 bg-linear-to-br from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#1e3a8a] to-[#02066f] text-white flex items-center justify-center font-bold overflow-hidden">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={getUserName()}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getUserInitial()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">
                              {getUserName()}
                            </p>
                            {user.email && (
                              <p className="text-xs text-slate-500 truncate">
                                {user.email}
                              </p>
                            )}
                            {user.phone && (
                              <p className="text-xs text-slate-500 truncate">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>👤</span>
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>📦</span>
                          My Orders
                        </Link>

                        <Link
                          to="/addresses"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>📍</span>
                          Addresses
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <span>🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSignIn(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-sm font-semibold text-white shadow-lg shadow-blue-900/25 hover:scale-[1.03] active:scale-95 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a, #02066f)",
                  }}
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}

              {/* CART */}
              <Link
                to="/cart"
                className="relative group flex items-center gap-2 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-blue-900/25 hover:shadow-blue-900/40 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1e3a8a, #02066f)",
                }}
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

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 bg-linear-to-br from-rose-500 to-pink-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md shadow-rose-500/40 border-2 border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* MOBILE NAVIGATION */}
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

      {/* SIGN IN MODAL */}
      {showSignIn && (
        <SignInModal
          toggleModal={() => setShowSignIn(false)}
          setIsAuthenticated={() => {
            window.dispatchEvent(new Event("auth-changed"));
          }}
        />
      )}
    </>
  );
}