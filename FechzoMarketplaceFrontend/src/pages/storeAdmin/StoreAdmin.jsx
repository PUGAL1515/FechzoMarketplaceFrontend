import React, { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Settings,
  Menu,
  X,
  Store,
  LogOut,
  ChevronDown,
  CircleCheck,
  UserRound,
} from "lucide-react";

import StoreDashboard from "./StoreDashboard";
import StoreProducts from "./StoreProducts";
import StoreSettings from "./StoreSettings";

export default function StoreAdmin() {
  const [activePage, setActivePage] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [store, setStore] = useState(null);

  /*
   * =========================================================
   * PRODUCT VIEW
   * =========================================================
   *
   * list
   * add
   * edit
   */

  const [productView, setProductView] = useState("list");

  const [selectedProduct, setSelectedProduct] = useState(null);

  /*
   * =========================================================
   * LOAD STORE
   * =========================================================
   */

  useEffect(() => {
    const storedStore = localStorage.getItem("store");

    if (!storedStore) {
      return;
    }

    try {
      const parsedStore = JSON.parse(storedStore);

      setStore(parsedStore);
    } catch (error) {
      console.error(
        "Failed to parse store data:",
        error
      );
    }
  }, []);

  /*
   * =========================================================
   * PROTECT STORE ADMIN
   * =========================================================
   */

  useEffect(() => {
    const token = localStorage.getItem("storeToken");
    const storeId = localStorage.getItem("storeId");

    if (!token || !storeId) {
      window.location.href = "/store-login";
    }
  }, []);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("storeToken");
    localStorage.removeItem("store");
    localStorage.removeItem("storeId");
    localStorage.removeItem("storeName");
    localStorage.removeItem("storeType");
    localStorage.removeItem("storeUsername");

    window.location.href = "/store-login";
  };

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const handleNavigation = (
    page,
    action = null,
    product = null
  ) => {
    setActivePage(page);

    setSidebarOpen(false);
    setProfileOpen(false);

    if (page === "products") {
      if (action === "add") {
        setProductView("add");
        setSelectedProduct(null);
      } else if (action === "edit") {
        setProductView("edit");
        setSelectedProduct(product);
      } else {
        setProductView("list");
        setSelectedProduct(null);
      }
    }
  };

  /*
   * =========================================================
   * STORE LOGO
   * =========================================================
   */

  const StoreLogo = ({
    size = "normal",
  }) => {
    const classes =
      size === "large"
        ? "w-14 h-14 rounded-xl"
        : "w-10 h-10 rounded-xl";

    if (store?.logo) {
      return (
        <img
          src={store.logo}
          alt={store.storeName || "Store"}
          className={`${classes} object-cover border border-gray-200`}
        />
      );
    }

    return (
      <div
        className={`${classes} bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center`}
      >
        <Store
          className="text-white"
          size={
            size === "large"
              ? 28
              : 21
          }
        />
      </div>
    );
  };

  /*
   * =========================================================
   * MENU
   * =========================================================
   */

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      id: "categories",
      label: "Categories",
      icon: Tags,
    },
    {
      id: "settings",
      label: "Store Settings",
      icon: Settings,
    },
  ];

  /*
   * =========================================================
   * PAGE TITLE
   * =========================================================
   */

  const getPageTitle = () => {
    switch (activePage) {
      case "products":
        return productView === "add"
          ? "Add Product"
          : productView === "edit"
          ? "Edit Product"
          : "Products";

      case "orders":
        return "Orders";

      case "categories":
        return "Categories";

      case "settings":
        return "Store Settings";

      default:
        return "Dashboard";
    }
  };

  /*
   * =========================================================
   * PAGE CONTENT
   * =========================================================
   */

  const renderPage = () => {
    /*
     * DASHBOARD
     */

    if (activePage === "dashboard") {
      return (
        <StoreDashboard
          store={store}
          onNavigate={handleNavigation}
        />
      );
    }

    /*
     * PRODUCTS
     */

    if (activePage === "products") {
      return (
        <StoreProducts
          view={productView}
          selectedProduct={selectedProduct}
          onViewChange={setProductView}
          onSelectProduct={setSelectedProduct}
        />
      );
    }

    /*
     * ORDERS
     */

    if (activePage === "orders") {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <ShoppingBag
                  size={22}
                  className="text-green-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Orders
                </h1>

                <p className="text-sm text-gray-500">
                  Manage customer orders
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <ShoppingBag
                size={40}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 font-semibold text-gray-700">
                Orders Management
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Order management will be available here.
              </p>
            </div>

          </div>
        </div>
      );
    }

    /*
     * CATEGORIES
     */

    if (activePage === "categories") {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <Tags
                  size={22}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Categories
                </h1>

                <p className="text-sm text-gray-500">
                  Manage marketplace product categories
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <Tags
                size={40}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 font-semibold text-gray-700">
                Category Management
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage main categories and sub-categories here.
              </p>
            </div>

          </div>
        </div>
      );
    }

    /*
     * SETTINGS
     */

    if (activePage === "settings") {
      return <StoreSettings />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">

        <div className="h-16 px-4 flex items-center justify-between">

          <div className="flex items-center gap-3 min-w-0">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={22} />
            </button>

            <StoreLogo />

            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate max-w-[150px]">
                {store?.storeName ||
                  "Fechzo Seller"}
              </p>

              <p className="text-xs text-gray-500 capitalize">
                {store?.storeType ||
                  "Store"}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setProfileOpen((prev) => !prev)
            }
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <UserRound size={21} />
          </button>

        </div>

      </div>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >

        {/* SIDEBAR HEADER */}

        <div className="h-20 px-5 border-b border-gray-100 flex items-center">

          <div className="flex items-center gap-3 min-w-0">

            <StoreLogo />

            <div className="min-w-0">

              <p className="font-bold text-gray-900 truncate">
                {store?.storeName ||
                  "Fechzo Seller"}
              </p>

              <p className="text-xs text-gray-500 capitalize">
                {store?.storeType ||
                  "Marketplace"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1"
          >
            <X size={21} />
          </button>

        </div>

        {/* STORE STATUS */}

        <div className="px-4 pt-5">

          <div className="rounded-xl bg-green-50 border border-green-100 p-3">

            <div className="flex items-center gap-2">

              <CircleCheck
                size={17}
                className="text-green-600"
              />

              <span className="text-sm font-semibold text-green-700">
                Store Approved
              </span>

            </div>

            <p className="text-xs text-green-600 mt-1 ml-6">
              Your store is live
            </p>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          <p className="px-3 pb-2 text-[11px] uppercase tracking-wider font-bold text-gray-400">
            Store Management
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              activePage === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() =>
                  handleNavigation(item.id)
                }
                className={`
                  w-full flex items-center gap-3
                  px-3.5 py-3
                  rounded-xl
                  text-left
                  transition-all

                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >

                <Icon size={19} />

                <span className="text-sm font-medium">
                  {item.label}
                </span>

                {item.id === "orders" && (
                  <span
                    className={`
                      ml-auto text-[10px]
                      px-2 py-0.5 rounded-full

                      ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-blue-50 text-blue-600"
                      }
                    `}
                  >
                    New
                  </span>
                )}

              </button>
            );
          })}

        </nav>

        {/* SELLER INFO */}

        <div className="p-4 border-t border-gray-100">

          <div className="bg-gray-50 rounded-xl p-3 mb-3">

            <p className="text-xs text-gray-400">
              Seller Account
            </p>

            <p className="text-sm font-semibold text-gray-800 truncate mt-1">
              @{store?.username ||
                localStorage.getItem(
                  "storeUsername"
                ) ||
                "seller"}
            </p>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
          >

            <LogOut size={19} />

            <span className="text-sm font-medium">
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="lg:ml-64 min-h-screen">

        {/* DESKTOP TOP BAR */}

        <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white border-b border-gray-200 px-8 items-center justify-between">

          {/* LEFT */}

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Manage your Fechzo marketplace store
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">

            {/* STORE LIVE */}

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50">

              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

              <span className="text-xs font-semibold text-green-700">
                Store Live
              </span>

            </div>

            {/* PROFILE */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
              >

                <StoreLogo />

                <div className="text-left">

                  <p className="text-sm font-bold text-gray-900 max-w-[170px] truncate">
                    {store?.storeName ||
                      "Store Admin"}
                  </p>

                  <p className="text-xs text-gray-500 capitalize">
                    {store?.storeType ||
                      "Seller"}
                  </p>

                </div>

                <ChevronDown
                  size={17}
                  className="text-gray-400"
                />

              </button>

              {/* DROPDOWN */}

              {profileOpen && (
                <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-50">

                  {/* PROFILE */}

                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

                    <div className="flex items-center gap-3">

                      {store?.logo ? (
                        <img
                          src={store.logo}
                          alt={store.storeName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <Store size={25} />
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="font-bold truncate">
                          {store?.storeName ||
                            "Fechzo Seller"}
                        </p>

                        <p className="text-xs text-blue-100 capitalize">
                          {store?.storeType ||
                            "Marketplace"}{" "}
                          Store
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="p-3">

                    <div className="px-3 py-2">

                      <p className="text-[11px] text-gray-400 uppercase">
                        Seller Username
                      </p>

                      <p className="text-sm font-semibold text-gray-800">
                        @
                        {store?.username ||
                          localStorage.getItem(
                            "storeUsername"
                          ) ||
                          "seller"}
                      </p>

                    </div>

                    <div className="px-3 py-2">

                      <p className="text-[11px] text-gray-400 uppercase">
                        Store ID
                      </p>

                      <p className="text-xs font-mono text-gray-600 break-all">
                        {store?._id ||
                          store?.id ||
                          localStorage.getItem(
                            "storeId"
                          ) ||
                          "-"}
                      </p>

                    </div>

                    <div className="border-t my-2" />

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigation(
                          "settings"
                        )
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                    >

                      <Settings size={17} />

                      Store Settings

                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-sm text-red-600"
                    >

                      <LogOut size={17} />

                      Logout

                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* DASHBOARD STORE BANNER */}

        {activePage === "dashboard" && (
          <div className="px-4 md:px-6 lg:px-8 pt-5">

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg">

              <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-white/10" />

              <div className="absolute right-20 -bottom-24 w-52 h-52 rounded-full bg-white/10" />

              <div className="relative p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">

                {/* STORE */}

                <div className="flex items-center gap-4">

                  {store?.logo ? (
                    <img
                      src={store.logo}
                      alt={store.storeName}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                      <Store
                        size={35}
                        className="text-white"
                      />
                    </div>
                  )}

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <h1 className="text-xl md:text-2xl font-bold">
                        {store?.storeName ||
                          "Your Store"}
                      </h1>

                      <span className="px-2.5 py-1 bg-green-400/20 border border-green-300/30 rounded-full text-[11px] font-semibold">
                        ● LIVE
                      </span>

                    </div>

                    <p className="text-blue-100 text-sm mt-1 capitalize">
                      {store?.storeType ||
                        "Marketplace"}{" "}
                      Store
                    </p>

                    <p className="text-blue-100/80 text-xs mt-1">
                      Welcome back, @
                      {store?.username ||
                        "seller"}
                    </p>

                  </div>

                </div>

                {/* INFO */}

                <div className="flex items-center gap-3">

                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">

                    <p className="text-[10px] text-blue-100 uppercase">
                      Status
                    </p>

                    <p className="text-sm font-bold capitalize">
                      {store?.status ||
                        "Approved"}
                    </p>

                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">

                    <p className="text-[10px] text-blue-100 uppercase">
                      Seller
                    </p>

                    <p className="text-sm font-bold">
                      Active
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* PAGE */}

        {renderPage()}

      </main>

    </div>
  );
}