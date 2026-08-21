import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";

import AddProduct from "./AddProduct";

const API = "http://localhost:5000";

const getAuthConfig = () => {
  const token =
    localStorage.getItem("storeToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export default function StoreProducts() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [error, setError] = useState("");

  const storeId = localStorage.getItem("storeId");

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = useCallback(async () => {
    if (!storeId) {
      setError("Store ID not found. Please login again.");
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/api/products`, {
        params: {
          storeId,
          limit: 100,
        },
        ...getAuthConfig(),
      });

      console.log("Products API response:", response.data);

      const productList =
        response.data?.products ||
        response.data?.data ||
        [];

      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error(
        "Products fetch failed:",
        error.response?.data || error
      );

      setProducts([]);

      setError(
        error.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const handleAddProduct = () => {
    setEditProduct(null);
    setShowAddProduct(true);
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEdit = (product) => {
    console.log("Editing product:", product);

    setEditProduct(product);
    setShowAddProduct(true);
  };

  // =========================================================
  // CLOSE ADD / EDIT
  // =========================================================

  const handleCloseProductForm = () => {
    setShowAddProduct(false);
    setEditProduct(null);
  };

  // =========================================================
  // PRODUCT SAVED
  // =========================================================

  const handleProductSuccess = async () => {
    handleCloseProductForm();
    await fetchProducts();
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (product) => {
    if (!storeId) {
      alert("Store ID not found. Please login again.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);

      console.log("Deleting product:", {
        productId: product._id,
        storeId,
      });

      const response = await axios.delete(
        `${API}/api/products/${product._id}`,
        {
          params: {
            storeId,
          },
          ...getAuthConfig(),
        }
      );

      console.log("Delete response:", response.data);

      alert(
        response.data?.message ||
          "Product deleted successfully."
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.name
          ?.toLowerCase()
          .includes(searchText) ||
        product.productId
          ?.toLowerCase()
          .includes(searchText) ||
        product.sku
          ?.toLowerCase()
          .includes(searchText) ||
        product.brand
          ?.toLowerCase()
          .includes(searchText) ||
        product.mainCategory?.name
          ?.toLowerCase()
          .includes(searchText) ||
        product.productCategory?.name
          ?.toLowerCase()
          .includes(searchText);

      const isActive =
        product.isActive !== false &&
        product.isAvailable !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive) ||
        (statusFilter === "outofstock" &&
          Number(product.stock || 0) <= 0);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  // =========================================================
  // COUNTS
  // =========================================================

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) =>
      product.isActive !== false &&
      product.isAvailable !== false
  ).length;

  const inactiveProducts =
    totalProducts - activeProducts;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 0
  ).length;

  // =========================================================
  // ADD / EDIT PAGE
  // =========================================================

  if (showAddProduct) {
    return (
      <AddProduct
        editProduct={editProduct}
        storeId={storeId}
        onBack={handleCloseProductForm}
        onSuccess={handleProductSuccess}
      />
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage products, pricing, stock and availability
            for your store.
          </p>

          {storeId && (
            <p className="mt-1 text-xs text-gray-400">
              Store ID: {storeId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />

            Add Product
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            statusFilter === "all"
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalProducts}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            statusFilter === "active"
              ? "border-green-500 ring-2 ring-green-100"
              : "border-gray-200 hover:border-green-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            {activeProducts}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("inactive")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            statusFilter === "inactive"
              ? "border-red-500 ring-2 ring-red-100"
              : "border-gray-200 hover:border-red-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {inactiveProducts}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("outofstock")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            statusFilter === "outofstock"
              ? "border-orange-500 ring-2 ring-orange-100"
              : "border-gray-200 hover:border-orange-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-1 text-2xl font-bold text-orange-600">
            {outOfStockProducts}
          </p>
        </button>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product, SKU, brand or category..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">
              All Products
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="outofstock">
              Out of Stock
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          COUNT
      ===================================================== */}

      <div className="mb-3 mt-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {filteredProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800">
            {totalProducts}
          </span>{" "}
          products
        </p>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Product
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Category
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Price
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Stock
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-5 py-4 text-right font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-16 text-center"
                  >
                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-blue-500"
                    />

                    <p className="mt-3 text-gray-500">
                      Loading products...
                    </p>
                  </td>
                </tr>
              )}

              {/* EMPTY */}

              {!loading &&
                filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-16 text-center"
                    >
                      <Package
                        size={45}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 font-medium text-gray-600">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {search
                          ? "Try a different search."
                          : "Start by adding your first product."}
                      </p>

                      {!search &&
                        products.length === 0 && (
                          <button
                            type="button"
                            onClick={handleAddProduct}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            <Plus size={17} />
                            Add Product
                          </button>
                        )}
                    </td>
                  </tr>
                )}

              {/* PRODUCTS */}

              {!loading &&
                filteredProducts.map((product) => {
                  const originalPrice =
                    Number(product.price || 0);

                  const discountPrice =
                    Number(
                      product.discountPrice || 0
                    );

                  const sellingPrice =
                    discountPrice > 0
                      ? discountPrice
                      : originalPrice;

                  const stock = Number(
                    product.stock || 0
                  );

                  const isActive =
                    product.isActive !== false &&
                    product.isAvailable !== false;

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* PRODUCT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={22}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">
                              {product.name || "-"}
                            </p>

                            {product.brand && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                {product.brand}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-gray-400">
                              ID:{" "}
                              {product.productId || "-"}
                            </p>

                            <p className="text-xs text-gray-400">
                              SKU: {product.sku || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {product.mainCategory?.name ||
                            "-"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.productCategory?.name ||
                            "-"}
                        </p>
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          ₹
                          {sellingPrice.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {discountPrice > 0 &&
                          discountPrice <
                            originalPrice && (
                            <p className="mt-1 text-xs text-gray-400 line-through">
                              ₹
                              {originalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          )}
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4">
                        <span
                          className={
                            stock <= 0
                              ? "font-semibold text-red-600"
                              : stock <= 5
                              ? "font-semibold text-orange-600"
                              : "font-semibold text-green-600"
                          }
                        >
                          {stock}{" "}
                          {product.unit || "units"}
                        </span>

                        {stock <= 5 && (
                          <p className="mt-1 text-xs text-gray-400">
                            {stock <= 0
                              ? "Out of stock"
                              : "Low stock"}
                          </p>
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        {isActive ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(product)
                            }
                            disabled={actionLoading}
                            title="Edit product"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteProduct(product)
                            }
                            disabled={actionLoading}
                            title="Delete product"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}