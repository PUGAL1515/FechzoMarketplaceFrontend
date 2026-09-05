import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";

import AddProduct from "./AddProduct";

const API = "http://localhost:5000";

/* =========================================================
   AUTH CONFIG
========================================================= */

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

/* =========================================================
   SAFE NUMBER
========================================================= */

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/* =========================================================
   STORE PRODUCTS
========================================================= */

export default function StoreProducts() {
  /* =======================================================
     STATE
  ======================================================= */

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const storeId = localStorage.getItem("storeId");

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

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

      const response = await axios.get(
        `${API}/api/products`,
        {
          params: {
            storeId,
            limit: 100,
          },
          ...getAuthConfig(),
        }
      );

      console.log(
        "Products API response:",
        response.data
      );

      const productList =
        response.data?.products ??
        response.data?.data ??
        [];

      setProducts(
        Array.isArray(productList)
          ? productList
          : []
      );
    } catch (err) {
      console.error(
        "Products fetch failed:",
        err.response?.data || err
      );

      setProducts([]);

      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =======================================================
     CLEAR SUCCESS MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const handleAddProduct = () => {
    setEditProduct(null);
    setShowAddProduct(true);
    setError("");
  };

  /* =======================================================
     EDIT PRODUCT
  ======================================================= */

  const handleEdit = (product) => {
    console.log("Editing product:", product);

    setEditProduct(product);
    setShowAddProduct(true);
    setError("");
  };

  /* =======================================================
     VIEW PRODUCT
  ======================================================= */

  const handleView = (product) => {
    console.log("Product details:", product);

    alert(
      `Product: ${product.name || "-"}\nSKU: ${
        product.sku || "-"
      }\nStock: ${safeNumber(product.stock)}`
    );
  };

  /* =======================================================
     CLOSE ADD / EDIT
  ======================================================= */

  const handleCloseProductForm = () => {
    setShowAddProduct(false);
    setEditProduct(null);
  };

  /* =======================================================
     PRODUCT SAVED
  ======================================================= */

  const handleProductSuccess = async () => {
    handleCloseProductForm();

    setSuccessMessage(
      editProduct
        ? "Product updated successfully."
        : "Product added successfully."
    );

    await fetchProducts();
  };

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const deleteProduct = async (product) => {
    if (!storeId) {
      setError(
        "Store ID not found. Please login again."
      );
      return;
    }

    if (!product?._id) {
      setError("Product ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      setError("");

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

      console.log(
        "Delete response:",
        response.data
      );

      setSuccessMessage(
        response.data?.message ||
          "Product deleted successfully."
      );

      await fetchProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || "";

      const productId =
        product.productId?.toLowerCase() || "";

      const sku =
        product.sku?.toLowerCase() || "";

      const brand =
        product.brand?.toLowerCase() || "";

      const mainCategory =
        product.mainCategory?.name?.toLowerCase() ||
        "";

      const subCategory =
        product.productCategory?.name?.toLowerCase() ||
        product.subCategory?.name?.toLowerCase() ||
        "";

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        productId.includes(searchText) ||
        sku.includes(searchText) ||
        brand.includes(searchText) ||
        mainCategory.includes(searchText) ||
        subCategory.includes(searchText);

      const stock = Array.isArray(product.variants)
  ? product.variants.reduce(
      (total, variant) => total + safeNumber(variant.stock),
      0
    )
  : safeNumber(product.stock);

      const isActive =
        product.isActive !== false &&
        product.isAvailable !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          isActive) ||
        (statusFilter === "inactive" &&
          !isActive) ||
        (statusFilter === "outofstock" &&
          stock <= 0);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) =>
      product.isActive !== false &&
      product.isAvailable !== false
  ).length;

  const inactiveProducts =
    totalProducts - activeProducts;

  const outOfStockProducts = products.filter((product) => {
  const stock = Array.isArray(product.variants)
    ? product.variants.reduce(
        (total, variant) => total + safeNumber(variant.stock),
        0
      )
    : safeNumber(product.stock);

  return stock <= 0;
}).length;

  const lowStockProducts =
    products.filter((product) => {
      const stock = Array.isArray(product.variants)
  ? product.variants.reduce(
      (total, variant) => total + safeNumber(variant.stock),
      0
    )
  : safeNumber(product.stock);

      return stock > 0 && stock <= 5;
    }).length;

  /* =======================================================
     STATUS FILTER
  ======================================================= */

  const handleStatusFilter = (filter) => {
    setStatusFilter(filter);
  };

  /* =======================================================
     ADD / EDIT PAGE
  ======================================================= */

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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Products
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage products, pricing, stock and
                availability.
              </p>
            </div>

          </div>

          {storeId && (
            <div className="mt-3 inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              Store ID:
              <span className="ml-1 font-medium text-gray-700">
                {storeId}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus size={18} />

            Add Product
          </button>

        </div>
      </div>

      {/* ===================================================
          SUCCESS MESSAGE
      =================================================== */}

      {successMessage && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />

            <span>
              {successMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-green-600 hover:text-green-800"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

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

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">

        {/* TOTAL */}

        <button
          type="button"
          onClick={() =>
            handleStatusFilter("all")
          }
          className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "all"
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <Package
              size={18}
              className="text-blue-500"
            />

          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalProducts}
          </p>
        </button>

        {/* ACTIVE */}

        <button
          type="button"
          onClick={() =>
            handleStatusFilter("active")
          }
          className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "active"
              ? "border-green-500 ring-2 ring-green-100"
              : "border-gray-200 hover:border-green-300"
          }`}
        >
          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Active
            </p>

            <CheckCircle2
              size={18}
              className="text-green-500"
            />

          </div>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeProducts}
          </p>
        </button>

        {/* INACTIVE */}

        <button
          type="button"
          onClick={() =>
            handleStatusFilter("inactive")
          }
          className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "inactive"
              ? "border-red-500 ring-2 ring-red-100"
              : "border-gray-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Inactive
            </p>

            <AlertCircle
              size={18}
              className="text-red-500"
            />

          </div>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {inactiveProducts}
          </p>
        </button>

        {/* OUT OF STOCK */}

        <button
          type="button"
          onClick={() =>
            handleStatusFilter("outofstock")
          }
          className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
            statusFilter === "outofstock"
              ? "border-orange-500 ring-2 ring-orange-100"
              : "border-gray-200 hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <AlertTriangle
              size={18}
              className="text-orange-500"
            />

          </div>

          <p className="mt-2 text-2xl font-bold text-orange-600">
            {outOfStockProducts}
          </p>
        </button>

        {/* LOW STOCK */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm">

          <div className="flex items-center justify-between">

            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <AlertTriangle
              size={18}
              className="text-yellow-500"
            />

          </div>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {lowStockProducts}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            1–5 units remaining
          </p>

        </div>

      </div>

      {/* ===================================================
          SEARCH / FILTER
      =================================================== */}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

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
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={17} />
              </button>
            )}

          </div>

          {/* FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-48"
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

      {/* ===================================================
          RESULT COUNT
      =================================================== */}

      <div className="mb-3 mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

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

        {(search ||
          statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="text-left text-sm font-medium text-blue-600 hover:underline sm:text-right"
          >
            Clear filters
          </button>
        )}

      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] text-sm">

            {/* TABLE HEADER */}

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

            {/* TABLE BODY */}

            <tbody className="divide-y divide-gray-100">

              {/* LOADING */}

              {loading && (
                <tr>

                  <td
                    colSpan="6"
                    className="py-20 text-center"
                  >

                    <RefreshCw
                      size={30}
                      className="mx-auto animate-spin text-blue-500"
                    />

                    <p className="mt-3 font-medium text-gray-600">
                      Loading products...
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Please wait
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
                      className="py-20 text-center"
                    >

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <Package
                          size={32}
                          className="text-gray-400"
                        />
                      </div>

                      <p className="mt-4 font-semibold text-gray-700">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {search ||
                        statusFilter !== "all"
                          ? "Try changing your search or filters."
                          : "Start by adding your first product."}
                      </p>

                      {!search &&
                        statusFilter === "all" &&
                        products.length === 0 && (
                          <button
                            type="button"
                            onClick={
                              handleAddProduct
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
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
                filteredProducts.map(
                  (product) => {
                    const originalPrice =
                      safeNumber(
                        product.price
                      );

                    const discountPrice =
                      safeNumber(
                        product.discountPrice
                      );

                    const sellingPrice =
                      discountPrice > 0 &&
                      discountPrice <
                        originalPrice
                        ? discountPrice
                        : originalPrice;

                    const stock = Array.isArray(product.variants)
  ? product.variants.reduce(
      (total, variant) =>
        total + safeNumber(variant.stock),
      0
    )
  : safeNumber(product.stock);

                    const isActive =
                      product.isActive !==
                        false &&
                      product.isAvailable !==
                        false;

                    const image =
                      product.images?.[0] ||
                      product.image ||
                      "";

                    const category =
                      product.mainCategory
                        ?.name ||
                      product.category
                        ?.name ||
                      "-";

                    const subCategory =
                      product.productCategory
                        ?.name ||
                      product.subCategory
                        ?.name ||
                      "";

                    return (
                      <tr
                        key={product._id}
                        className="group transition hover:bg-gray-50"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">

                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    product.name ||
                                    "Product"
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(
                                    e
                                  ) => {
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

                              <p className="max-w-[260px] truncate font-semibold text-gray-800">
                                {product.name ||
                                  "-"}
                              </p>

                              {product.brand && (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {product.brand}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-gray-400">
                                ID:{" "}
                                {product.productId ||
                                  "-"}
                              </p>

                              <p className="text-xs text-gray-400">
                                SKU:{" "}
                                {product.sku ||
                                  "-"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-gray-800">
                            {category}
                          </p>

                          {subCategory && (
                            <p className="mt-1 text-xs text-gray-500">
                              {subCategory}
                            </p>
                          )}

                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-gray-900">
                            ₹
                            {sellingPrice.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          {discountPrice >
                            0 &&
                            discountPrice <
                              originalPrice && (
                              <div className="mt-1 flex items-center gap-2">

                                <p className="text-xs text-gray-400 line-through">
                                  ₹
                                  {originalPrice.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                                  OFFER
                                </span>

                              </div>
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
                            {product.unit ||
                              "units"}
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
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-1">

                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  product
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="View product"
                              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                            >
                              <Eye
                                size={17}
                              />
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Edit product"
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                            >
                              <Edit
                                size={17}
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Delete product"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {actionLoading ? (
                                <RefreshCw
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ===================================================
          FOOTER INFO
      =================================================== */}

      {!loading &&
        products.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Total:{" "}
              <span className="font-medium text-gray-600">
                {totalProducts}
              </span>{" "}
              products
            </p>

            <p>
              Active:{" "}
              <span className="font-medium text-green-600">
                {activeProducts}
              </span>{" "}
              · Inactive:{" "}
              <span className="font-medium text-red-600">
                {inactiveProducts}
              </span>{" "}
              · Out of stock:{" "}
              <span className="font-medium text-orange-600">
                {outOfStockProducts}
              </span>
            </p>

          </div>
        )}

    </div>
  );
}

