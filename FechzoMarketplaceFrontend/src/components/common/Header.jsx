import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Search,
  MapPin,
  User,
  ChevronDown,
  ShoppingCart,
  Heart,
  Package,
  MapPinned,
  LogOut,
  UserRound,
  Menu,
  X,
  ShoppingBasket,
  Shirt,
  Smartphone,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import SignInModal from "./SignInModal";
import SearchBar from "./SearchBar";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartCount } = useCart();

  // ============================================================
  // STATES
  // ============================================================

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentCategory = location.pathname.split("/")[1];

  // ============================================================
  // ONLY 3 CATEGORIES
  // ============================================================

  const navItems = [
    {
      name: "Grocery",
      path: "/grocery",
      icon: ShoppingBasket,
    },
    {
      name: "Fashion",
      path: "/fashion",
      icon: Shirt,
    },
    {
      name: "Electronics",
      path: "/electronics",
      icon: Smartphone,
    },
  ];
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
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfile &&
        !event.target.closest(".profile-dropdown")
      ) {
        setShowProfile(false);
      }

      if (
        showLocation &&
        !event.target.closest(".location-dropdown")
      ) {
        setShowLocation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [showProfile, showLocation]);

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

    navigate("/");
  };

  // ============================================================
  // USER NAME
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

  // ============================================================
  // USER INITIAL
  // ============================================================

  const getUserInitial = () => {
    return getUserName().charAt(0).toUpperCase();
  };

  // ============================================================
  // USER AVATAR
  // ============================================================

  const avatarUrl =
    user?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    null;

 

  // ============================================================
  // ACTIVE CATEGORY
  // ============================================================

  const isActiveCategory = (item) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }

    return currentCategory === item.path.substring(1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">

        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <div className="bg-white">

          <div className="max-w-[1500px] mx-auto px-4 lg:px-8">

            <div className="h-[68px] flex items-center gap-4 lg:gap-6">

              {/* ==================================================
                  FECHZO LOGO
              ================================================== */}

              <Link
                to="/"
                className="flex items-center shrink-0 group"
                aria-label="Fechzo Home"
              >
                <div className="flex items-center gap-2">

                  {/* Logo Icon */}

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-gradient-to-br
                      from-[#1e3a8a]
                      to-[#02066f]
                      flex
                      items-center
                      justify-center
                      shadow-md
                      group-hover:scale-105
                      transition-transform
                    "
                  >
                    <span
                      className="
                        text-white
                        text-2xl
                        font-black
                        italic
                      "
                    >
                      F
                    </span>
                  </div>

                  {/* Logo Text */}

                  <div className="leading-none">

                    <div
                      className="
                        text-xl
                        sm:text-2xl
                        font-extrabold
                        tracking-tight
                        text-[#1e3a8a]
                      "
                    >
                      Fechzo
                    </div>

                    <div
                      className="
                        text-[9px]
                        sm:text-[10px]
                        text-gray-400
                        font-medium
                        mt-0.5
                      "
                    >
                      Shop Smart
                    </div>

                  </div>

                </div>
              </Link>

             <SearchBar />

              {/* ==================================================
                  LOCATION
              ================================================== */}

              <div
                className="
                  relative
                  location-dropdown
                  hidden
                  xl:block
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowLocation((prev) => !prev)
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    px-2
                    py-2
                    rounded-lg
                    hover:bg-gray-50
                    transition
                  "
                >

                  <MapPin
                    size={21}
                    strokeWidth={2}
                    className="text-gray-800"
                  />

                  <div className="text-left">

                    <div className="text-[10px] text-gray-500">
                      Deliver to
                    </div>

                    <div
                      className="
                        text-sm
                        font-semibold
                        text-gray-800
                        flex
                        items-center
                        gap-1
                        whitespace-nowrap
                      "
                    >
                      Select location

                      <ChevronDown
                        size={14}
                        className={
                          showLocation
                            ? "rotate-180"
                            : ""
                        }
                      />
                    </div>

                  </div>

                </button>

                {/* LOCATION DROPDOWN */}

                {showLocation && (
                  <div
                    className="
                      absolute
                      right-0
                      top-[52px]
                      w-[300px]
                      bg-white
                      border
                      border-gray-200
                      rounded-xl
                      shadow-2xl
                      p-4
                      z-[200]
                    "
                  >

                    <div className="flex items-center gap-3 mb-4">

                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          bg-blue-50
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <MapPin
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      <div>

                        <div className="font-semibold text-gray-800">
                          Delivery Location
                        </div>

                        <div className="text-xs text-gray-500">
                          Choose your delivery location
                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3
                        px-4
                        rounded-lg
                        bg-blue-50
                        text-blue-700
                        border
                        border-blue-100
                        hover:bg-blue-100
                        transition
                        text-sm
                        font-semibold
                      "
                    >
                      <MapPinned size={18} />

                      Select delivery location
                    </button>

                  </div>
                )}

              </div>

              {/* ==================================================
                  LOGIN / USER
              ================================================== */}

              <div className="relative profile-dropdown shrink-0">

                {user ? (

                  <>
                    {/* LOGGED USER */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowProfile((prev) => !prev)
                      }
                      className="
                        flex
                        items-center
                        gap-2
                        px-2
                        sm:px-3
                        py-2
                        rounded-lg
                        hover:bg-gray-50
                        transition
                      "
                    >

                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          bg-gradient-to-br
                          from-[#1e3a8a]
                          to-[#02066f]
                          text-white
                          flex
                          items-center
                          justify-center
                          font-bold
                          overflow-hidden
                        "
                      >

                        {avatarUrl ? (

                          <img
                            src={avatarUrl}
                            alt={getUserName()}
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />

                        ) : (

                          getUserInitial()

                        )}

                      </div>

                      <div className="hidden lg:block text-left">

                        <div className="text-[10px] text-gray-500">
                          Welcome
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-gray-800
                            max-w-[90px]
                            truncate
                          "
                        >
                          {getUserName()}
                        </div>

                      </div>

                      <ChevronDown
                        size={15}
                        className={`
                          hidden
                          sm:block
                          text-gray-500
                          transition-transform
                          ${
                            showProfile
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />

                    </button>

                    {/* ==================================================
                        PROFILE DROPDOWN
                    ================================================== */}

                    {showProfile && (
                      <div
                        className="
                          absolute
                          right-0
                          top-[53px]
                          w-[280px]
                          bg-white
                          rounded-xl
                          border
                          border-gray-200
                          shadow-2xl
                          overflow-hidden
                          z-[200]
                        "
                      >

                        {/* USER INFO */}

                        <div
                          className="
                            px-4
                            py-4
                            bg-gray-50
                            border-b
                            border-gray-100
                          "
                        >

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                w-12
                                h-12
                                rounded-full
                                bg-gradient-to-br
                                from-[#1e3a8a]
                                to-[#02066f]
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                overflow-hidden
                                shrink-0
                              "
                            >

                              {avatarUrl ? (

                                <img
                                  src={avatarUrl}
                                  alt={getUserName()}
                                  className="
                                    w-full
                                    h-full
                                    object-cover
                                  "
                                />

                              ) : (

                                getUserInitial()

                              )}

                            </div>

                            <div className="min-w-0">

                              <p
                                className="
                                  font-bold
                                  text-gray-800
                                  truncate
                                "
                              >
                                {getUserName()}
                              </p>

                              {user.email && (
                                <p
                                  className="
                                    text-xs
                                    text-gray-500
                                    truncate
                                    mt-0.5
                                  "
                                >
                                  {user.email}
                                </p>
                              )}

                              {user.phone && (
                                <p
                                  className="
                                    text-xs
                                    text-gray-500
                                    truncate
                                  "
                                >
                                  {user.phone}
                                </p>
                              )}

                            </div>

                          </div>

                        </div>

                        {/* PROFILE MENU */}

                        <div className="p-2">

                          <Link
                            to="/profile"
                            onClick={() =>
                              setShowProfile(false)
                            }
                            className="
                              flex
                              items-center
                              gap-3
                              px-3
                              py-3
                              rounded-lg
                              text-sm
                              text-gray-700
                              hover:bg-gray-50
                              transition
                            "
                          >
                            <UserRound size={18} />

                            My Profile
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() =>
                              setShowProfile(false)
                            }
                            className="
                              flex
                              items-center
                              gap-3
                              px-3
                              py-3
                              rounded-lg
                              text-sm
                              text-gray-700
                              hover:bg-gray-50
                              transition
                            "
                          >
                            <Package size={18} />

                            My Orders
                          </Link>

                          <Link
                            to="/addresses"
                            onClick={() =>
                              setShowProfile(false)
                            }
                            className="
                              flex
                              items-center
                              gap-3
                              px-3
                              py-3
                              rounded-lg
                              text-sm
                              text-gray-700
                              hover:bg-gray-50
                              transition
                            "
                          >
                            <MapPinned size={18} />

                            Addresses
                          </Link>

                        </div>

                        {/* LOGOUT */}

                        <div
                          className="
                            border-t
                            border-gray-100
                            p-2
                          "
                        >

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-3
                              py-3
                              rounded-lg
                              text-sm
                              text-red-600
                              hover:bg-red-50
                              transition
                            "
                          >
                            <LogOut size={18} />

                            Logout
                          </button>

                        </div>

                      </div>
                    )}

                  </>

                ) : (

                  /* ==================================================
                     LOGIN BUTTON
                  ================================================== */

                  <button
                    type="button"
                    onClick={() => setShowSignIn(true)}
                    className="
                      flex
                      items-center
                      gap-2
                      px-3
                      sm:px-4
                      py-2.5
                      rounded-lg
                      text-gray-800
                      hover:bg-gray-50
                      transition
                      font-semibold
                      text-sm
                    "
                  >

                    <User size={20} />

                    <span className="hidden sm:block">
                      Login
                    </span>

                    <ChevronDown
                      size={15}
                      className="hidden sm:block"
                    />

                  </button>

                )}

              </div>

              {/* ==================================================
                  WISHLIST
              ================================================== */}

              <Link
                to="/wishlist"
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  px-2
                  py-2
                  text-gray-800
                  hover:text-blue-700
                  transition
                  shrink-0
                "
                aria-label="Wishlist"
              >

                <Heart
                  size={23}
                  strokeWidth={1.8}
                />

                <span className="hidden lg:block text-sm font-medium">
                  Wishlist
                </span>

              </Link>

              {/* ==================================================
                  CART
              ================================================== */}

              <Link
                to="/cart"
                className="
                  flex
                  items-center
                  gap-2
                  px-2
                  py-2
                  text-gray-800
                  hover:text-blue-700
                  transition
                  shrink-0
                "
                aria-label={`Cart with ${cartCount} items`}
              >

                <div className="relative">

                  <ShoppingCart
                    size={25}
                    strokeWidth={1.8}
                  />

                  {cartCount > 0 && (
                    <span
                      className="
                        absolute
                        -top-2
                        -right-2
                        min-w-[18px]
                        h-[18px]
                        px-1
                        bg-red-500
                        text-white
                        rounded-full
                        text-[10px]
                        font-bold
                        flex
                        items-center
                        justify-center
                        border-2
                        border-white
                      "
                    >
                      {cartCount > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}

                </div>

                <span className="hidden lg:block text-sm font-medium">
                  Cart
                </span>

              </Link>

              {/* ==================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setShowMobileMenu((prev) => !prev)
                }
                className="
                  md:hidden
                  p-2
                  rounded-lg
                  hover:bg-gray-100
                  transition
                "
                aria-label="Menu"
              >

                {showMobileMenu ? (
                  <X size={23} />
                ) : (
                  <Menu size={23} />
                )}

              </button>

            </div>

            {/* ====================================================
                MOBILE SEARCH
            ==================================================== */}

         <SearchBar mobile />

          </div>
        </div>

        {/* ==========================================================
            CATEGORY BAR
        ========================================================== */}

        <div
          className="
            border-t
            border-gray-100
            bg-white
          "
        >

          <div className="max-w-[1500px] mx-auto px-4 lg:px-8">

            <div
              className="
                flex
                items-center
                justify-center
                md:justify-start
                gap-4
                sm:gap-8
                overflow-x-auto
                scrollbar-hide
              "
            >

              {navItems.map((item) => {

                const active = isActiveCategory(item);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      relative
                      flex
                      flex-col
                      items-center
                      justify-center
                      min-w-[90px]
                      sm:min-w-[105px]
                      py-3
                      gap-1.5
                      text-center
                      whitespace-nowrap
                      transition-all
                      group
                      ${
                        active
                          ? "text-[#1e3a8a]"
                          : "text-gray-700 hover:text-[#1e3a8a]"
                      }
                    `}
                  >

                    {/* CATEGORY ICON */}

                    <div
                      className={`
                        w-11
                        h-11
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        ${
                          active
                            ? "bg-blue-50"
                            : "bg-gray-50 group-hover:bg-blue-50"
                        }
                      `}
                    >

                      <Icon
                        size={27}
                        strokeWidth={1.8}
                      />

                    </div>

                    {/* CATEGORY NAME */}

                    <span
                      className={`
                        text-[13px]
                        sm:text-sm
                        ${
                          active
                            ? "font-bold"
                            : "font-medium"
                        }
                      `}
                    >
                      {item.name}
                    </span>

                    {/* ACTIVE LINE */}

                    {active && (
                      <span
                        className="
                          absolute
                          bottom-0
                          left-2
                          right-2
                          h-[3px]
                          bg-[#1e3a8a]
                          rounded-t-full
                        "
                      />
                    )}

                  </Link>
                );
              })}

            </div>

          </div>

        </div>

        {/* ==========================================================
            MOBILE MENU
        ========================================================== */}

        {showMobileMenu && (
          <div
            className="
              md:hidden
              border-t
              border-gray-100
              bg-white
              shadow-lg
            "
          >

            <div className="p-4">

              <div className="grid grid-cols-3 gap-3">

                {navItems.map((item) => {

                  const Icon = item.icon;

                  const active = isActiveCategory(item);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() =>
                        setShowMobileMenu(false)
                      }
                      className={`
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-2
                        p-3
                        rounded-xl
                        ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-50 text-gray-700"
                        }
                      `}
                    >

                      <Icon
                        size={25}
                        strokeWidth={1.8}
                      />

                      <span className="text-xs font-semibold">
                        {item.name}
                      </span>

                    </Link>
                  );
                })}

              </div>

              {/* MOBILE LOCATION */}

              <div
                className="
                  mt-4
                  pt-4
                  border-t
                  border-gray-100
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowLocation((prev) => !prev)
                  }
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    hover:bg-gray-50
                    text-left
                  "
                >

                  <MapPin
                    size={20}
                    className="text-gray-700"
                  />
                  <div>
                    <div className="text-xs text-gray-500">
                      Deliver to
                    </div>
                    <div className="text-sm font-semibold">
                      Select delivery location
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==========================================================
          SIGN IN MODAL
      ========================================================== */}

      {showSignIn && (
        <SignInModal
          toggleModal={() => setShowSignIn(false)}
          setIsAuthenticated={() => {
            window.dispatchEvent(
              new Event("auth-changed")
            );
          }}
        />
      )}
    </>
  );
}