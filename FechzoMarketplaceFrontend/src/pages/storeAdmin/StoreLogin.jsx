import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  Store,
  ArrowRight,
} from "lucide-react";

const API = "http://localhost:5000";

const StoreLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const storeType = searchParams.get("type") || "store";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // STORE TITLE
  // =========================================================

  const getStoreTitle = () => {
    switch (storeType) {
      case "grocery":
        return "Grocery Store";

      case "fashion":
        return "Fashion Store";

      case "electronic":
      case "electronics":
        return "Electronic Store";

      case "restaurant":
        return "Restaurant";

      default:
        return "Store";
    }
  };

  // =========================================================
  // CHECK EXISTING LOGIN
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("storeToken");
    const store = localStorage.getItem("store");

    if (token && store) {
      navigate("/store-admin/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear old error
    setError("");

    // Validate username
    if (!formData.username.trim()) {
      setError("Please enter your username");
      return;
    }

    // Validate password
    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/api/stores/auth/login`,
        {
          username: formData.username.trim(),
          password: formData.password,
        }
      );

      console.log("Store Login Response:", response.data);

      // =====================================================
      // SUCCESS
      // =====================================================

      if (response.data?.success) {
        const token = response.data?.token;
        const store = response.data?.store;

        // Check token
        if (!token) {
          setError("Login successful but authentication token is missing.");
          return;
        }

        // Check store
        if (!store) {
          setError("Login successful but store information is missing.");
          return;
        }

        // ===================================================
        // GET STORE ID
        // ===================================================

        const storeId = store._id || store.id;

        if (!storeId) {
          console.error(
            "Store ID missing from login response:",
            store
          );

          setError(
            "Store ID is missing from server response."
          );

          return;
        }

        // ===================================================
        // SAVE STORE AUTHENTICATION
        // ===================================================

        localStorage.setItem(
          "storeToken",
          token
        );

        localStorage.setItem(
          "store",
          JSON.stringify(store)
        );

        localStorage.setItem(
          "storeId",
          storeId
        );

        localStorage.setItem(
          "storeType",
          store.storeType || storeType
        );

        localStorage.setItem(
          "storeUsername",
          formData.username.trim()
        );

        localStorage.setItem(
          "storeRememberMe",
          rememberMe ? "true" : "false"
        );

        // ===================================================
        // OPTIONAL: SAVE STORE NAME
        // ===================================================

        if (store.storeName) {
          localStorage.setItem(
            "storeName",
            store.storeName
          );
        }

        // ===================================================
        // REDIRECT TO STORE ADMIN DASHBOARD
        // ===================================================

        navigate("/store-admin/dashboard", {
          replace: true,
        });
      } else {
        setError(
          response.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Store Login Error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your username and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14276f] via-[#1d3b9f] to-[#4258d5]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="w-full bg-gradient-to-r from-[#1d3b8f] to-[#080c6e] shadow-lg">

        <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/"
            className="text-white text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            FECHZO
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-10 lg:gap-12 text-white font-semibold text-base lg:text-lg">

            <Link
              to="/"
              className="flex items-center gap-2 hover:text-yellow-300 transition"
            >
              <span>⌂</span>
              Home
            </Link>

            <Link
              to="/services"
              className="flex items-center gap-2 hover:text-yellow-300 transition"
            >
              <span>♟</span>
              Services
            </Link>

            <Link
              to="/about"
              className="flex items-center gap-2 hover:text-yellow-300 transition"
            >
              <span>●</span>
              About
            </Link>

            <Link
              to="/business"
              className="flex items-center gap-2 hover:text-yellow-300 transition"
            >
              Business
              <span>⌄</span>
            </Link>

            <Link
              to="/support"
              className="flex items-center gap-2 hover:text-yellow-300 transition"
            >
              <span>🎧</span>
              Support
            </Link>

          </nav>

          {/* SIGN IN */}

          <button
            onClick={() => navigate("/signin")}
            className="bg-yellow-400 hover:bg-yellow-300 text-[#17266f] font-bold px-6 md:px-7 py-2.5 md:py-3 rounded-xl transition shadow-md"
          >
            Sign In
          </button>

        </div>
      </header>

      {/* =====================================================
          LOGIN SECTION
      ===================================================== */}

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-10 md:py-12">

        <div className="w-full max-w-[1030px] bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[520px]">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="flex flex-col items-center justify-center px-6 sm:px-10 py-12 bg-white">

              {/* STORE ICON */}

              <div className="relative mb-8">

                <div className="w-44 h-44 sm:w-56 sm:h-56 bg-blue-50 rounded-full flex items-center justify-center">

                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-[#3154d8] to-[#182c91] rounded-3xl flex items-center justify-center shadow-xl">

                    <Store
                      size={70}
                      sm:size={90}
                      strokeWidth={1.4}
                      className="text-white"
                    />

                  </div>

                </div>

              </div>

              <h2 className="text-2xl font-bold text-[#12266f] text-center">
                {getStoreTitle()}
              </h2>

              <p className="text-gray-500 text-center mt-2 max-w-sm leading-relaxed">
                Manage your store, products, orders and
                business operations from your Fechzo Store
                Admin.
              </p>

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="flex items-center px-6 sm:px-8 md:px-14 py-12">

              <div className="w-full max-w-md mx-auto">

                {/* HEADING */}

                <div className="mb-8">

                  <h1 className="text-3xl sm:text-4xl font-normal text-[#09266f]">
                    Login to {getStoreTitle()}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    Enter your store credentials to continue
                  </p>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleLogin}>

                  {/* USERNAME */}

                  <div className="mb-5">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>

                    <div className="relative">

                      <User
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        autoComplete="username"
                        disabled={loading}
                        className="w-full h-14 pl-12 pr-4 border-2 border-gray-300 rounded-lg outline-none focus:border-[#3854d6] focus:ring-2 focus:ring-blue-100 transition text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="mb-5">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        disabled={loading}
                        className="w-full h-14 pl-12 pr-12 border-2 border-gray-300 rounded-lg outline-none focus:border-[#3854d6] focus:ring-2 focus:ring-blue-100 transition text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* REMEMBER + FORGOT */}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">

                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                        disabled={loading}
                        className="w-4 h-4 accent-[#3854d6]"
                      />

                      <span className="text-sm">
                        Remember Me
                      </span>

                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/store-admin/forgot-password"
                        )
                      }
                      className="text-[#3854d6] hover:underline text-sm font-medium text-left"
                    >
                      Forgot Password?
                    </button>

                  </div>

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-lg bg-[#4057d5] hover:bg-[#3047c5] disabled:bg-gray-400 text-white font-semibold text-lg transition shadow-md flex items-center justify-center gap-2"
                  >

                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                        Logging in...
                      </>
                    ) : (
                      <>
                        Log in

                        <ArrowRight size={20} />
                      </>
                    )}

                  </button>

                </form>

                {/* REGISTER */}

                <div className="text-center mt-7 text-gray-600">

                  Don't have an account?{" "}

                  <Link
                    to="/register-store"
                    className="text-[#3854d6] font-medium hover:underline"
                  >
                    Register
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default StoreLogin;