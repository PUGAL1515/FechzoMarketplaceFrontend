import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  Store,
  TrendingUp,
  Plus,
  ArrowRight,
  Settings,
  Tags,
} from "lucide-react";

const API = "http://localhost:5000";

export default function StoreDashboard({ store, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const storeId = localStorage.getItem("storeId");

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/api/products`,
        {
          params: {
            storeId,
          },
        }
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Products fetch failed:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.isActive === true
  ).length;

  const availableProducts = products.filter(
    (product) => product.isAvailable === true
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.stock || 0) <= 0
  ).length;

  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Available",
      value: availableProducts,
      icon: Store,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Out of Stock",
      value: outOfStock,
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "Add a new product to your store.",
      icon: Plus,
      color: "text-blue-600",
      bg: "bg-blue-50",
      page: "products",
    },
    {
      title: "Manage Orders",
      description: "View and manage customer orders.",
      icon: ShoppingBag,
      color: "text-green-600",
      bg: "bg-green-50",
      page: "orders",
    },
    {
      title: "Categories",
      description: "Manage marketplace categories.",
      icon: Tags,
      color: "text-purple-600",
      bg: "bg-purple-50",
      page: "categories",
    },
    {
      title: "Store Settings",
      description: "Update your store information.",
      icon: Settings,
      color: "text-orange-600",
      bg: "bg-orange-50",
      page: "settings",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Seller Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-gray-700">
                {store?.storeName || "Seller"}
              </span>
              . Manage your store and products.
            </p>
          </div>

          <button
            onClick={() => onNavigate("products", "add")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            <Plus size={19} />
            Add Product
          </button>

        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? "..." : card.value}
                  </h2>
                </div>

                <div
                  className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon
                    size={22}
                    className={card.iconColor}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* STORE SUMMARY */}

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.storeName}
                className="w-16 h-16 rounded-xl object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center">
                <Store
                  size={28}
                  className="text-white"
                />
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {store?.storeName || "Your Store"}
              </h2>

              <p className="text-sm text-gray-500 capitalize">
                {store?.storeType || "Marketplace"} Store
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />

                <span className="text-xs font-semibold text-green-600">
                  Store Live
                </span>
              </div>
            </div>

          </div>

          <button
            onClick={() => onNavigate("settings")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-gray-50 text-sm font-medium"
          >
            Store Settings
            <ArrowRight size={16} />
          </button>

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="mt-8">

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>

          <p className="text-sm text-gray-500">
            Quickly manage your marketplace store.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                onClick={() =>
                  onNavigate(
                    action.page,
                    action.page === "products"
                      ? "add"
                      : undefined
                  )
                }
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-blue-400 hover:shadow-md transition group"
              >

                <div
                  className={`w-11 h-11 ${action.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon
                    size={21}
                    className={action.color}
                  />
                </div>

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-gray-900">
                    {action.title}
                  </h3>

                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-blue-600 transition"
                  />

                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>

              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
}