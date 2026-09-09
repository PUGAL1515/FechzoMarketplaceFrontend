import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";

import ProductCard from "./ProductCard";

export default function StorePage() {
  const { storeId } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FILTER / SORT STATE
  // =========================

  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState("default");
  const [showSort, setShowSort] = useState(false);

  const [filters, setFilters] = useState({
    gender: "all",
    category: "all",
    subCategory: "all",
    size: "all",
    color: "all",
    availability: "all",
    minPrice: "",
    maxPrice: "",
  });

  // =========================
  // FETCH STORE + PRODUCTS
  // =========================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [storeRes, productsRes] = await Promise.all([
          axios.get(`/api/stores/${storeId}`),
          axios.get(
            `/api/products?storeId=${storeId}&isActive=true`
          ),
        ]);

        const storeData =
          storeRes.data?.store || storeRes.data;

        const productData =
          productsRes.data?.products ||
          productsRes.data ||
          [];

        setStore(storeData);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        console.error("Store fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  // =========================
  // STORE TYPE
  // =========================

  const storeType = String(
    store?.storeType || "grocery"
  )
    .toLowerCase()
    .trim();

  const isFashion = storeType === "fashion";
  const isGrocery = storeType === "grocery";

  const category =
    storeType === "electronic" ||
    storeType === "electronics"
      ? "electronics"
      : storeType || "grocery";

  // =========================
  // HELPERS
  // =========================

  const getCategoryName = (product) => {
    if (typeof product?.categoryId === "string") {
      return product.categoryId;
    }

    return (
      product?.categoryId?.name ||
      product?.category?.name ||
      product?.mainCategory?.name ||
      product?.categoryName ||
      "Uncategorized"
    );
  };

  const getSubCategoryName = (product) => {
    if (typeof product?.productCategory === "string") {
      return product.productCategory;
    }

    if (typeof product?.subcategoryId === "string") {
      return product.subcategoryId;
    }

    return (
      product?.productCategory?.name ||
      product?.subcategoryId?.name ||
      product?.subCategory?.name ||
      product?.subcategory?.name ||
      product?.subCategoryName ||
      "Uncategorized"
    );
  };

  const getGender = (product) => {
    return String(product?.gender || "")
      .toLowerCase()
      .trim();
  };

  const getVariants = (product) => {
    return Array.isArray(product?.variants)
      ? product.variants
      : [];
  };

  const getPrices = (product) => {
    const variants = getVariants(product);

    if (variants.length) {
      return variants
        .map((v) => Number(v?.price))
        .filter((price) => Number.isFinite(price) && price > 0);
    }

    const price = Number(product?.price);

    return Number.isFinite(price) && price > 0
      ? [price]
      : [];
  };

  const getProductPrice = (product) => {
    const prices = getPrices(product);

    if (!prices.length) return 0;

    return Math.min(...prices);
  };

  const getTotalStock = (product) => {
    const variants = getVariants(product);

    if (variants.length) {
      return variants.reduce(
        (total, variant) =>
          total + Number(variant?.stock || 0),
        0
      );
    }

    return Number(product?.stock || 0);
  };

  const getSizes = (product) => {
    const variants = getVariants(product);

    return variants
      .map((variant) =>
        String(variant?.attributes?.size || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);
  };

  const getColors = (product) => {
    const variants = getVariants(product);

    return variants
      .map((variant) =>
        String(variant?.attributes?.color || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);
  };

  // =========================
  // FILTER OPTIONS
  // =========================

  const filterOptions = useMemo(() => {
    const categorySet = new Set();
    const subCategorySet = new Set();
    const genderSet = new Set();
    const sizeSet = new Set();
    const colorSet = new Set();

    products.forEach((product) => {
      const categoryName = getCategoryName(product);
      const subCategoryName = getSubCategoryName(product);
      const gender = getGender(product);

      if (
        categoryName &&
        categoryName !== "Uncategorized"
      ) {
        categorySet.add(categoryName);
      }

      if (
        subCategoryName &&
        subCategoryName !== "Uncategorized"
      ) {
        subCategorySet.add(subCategoryName);
      }

      if (gender) {
        genderSet.add(gender);
      }

      getSizes(product).forEach((size) =>
        sizeSet.add(size)
      );

      getColors(product).forEach((color) =>
        colorSet.add(color)
      );
    });

    return {
      categories: [...categorySet].sort(),
      subCategories: [...subCategorySet].sort(),
      genders: [...genderSet].sort(),
      sizes: [...sizeSet].sort(),
      colors: [...colorSet].sort(),
    };
  }, [products]);

  // =========================
  // FILTER PRODUCTS
  // =========================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Gender
    if (isFashion && filters.gender !== "all") {
      result = result.filter(
        (product) =>
          getGender(product) ===
          filters.gender.toLowerCase()
      );
    }

    // Main category
    if (filters.category !== "all") {
      result = result.filter(
        (product) =>
          getCategoryName(product).toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    // Sub-category
    if (filters.subCategory !== "all") {
      result = result.filter(
        (product) =>
          getSubCategoryName(product).toLowerCase() ===
          filters.subCategory.toLowerCase()
      );
    }

    // Fashion size
    if (isFashion && filters.size !== "all") {
      result = result.filter((product) =>
        getSizes(product).includes(
          filters.size.toLowerCase()
        )
      );
    }

    // Fashion color
    if (isFashion && filters.color !== "all") {
      result = result.filter((product) =>
        getColors(product).includes(
          filters.color.toLowerCase()
        )
      );
    }

    // Availability
    if (filters.availability === "in-stock") {
      result = result.filter(
        (product) => getTotalStock(product) > 0
      );
    }

    if (filters.availability === "out-of-stock") {
      result = result.filter(
        (product) => getTotalStock(product) <= 0
      );
    }

    // Min price
    if (filters.minPrice !== "") {
      const min = Number(filters.minPrice);

      if (Number.isFinite(min)) {
        result = result.filter(
          (product) =>
            getProductPrice(product) >= min
        );
      }
    }

    // Max price
    if (filters.maxPrice !== "") {
      const max = Number(filters.maxPrice);

      if (Number.isFinite(max)) {
        result = result.filter(
          (product) =>
            getProductPrice(product) <= max
        );
      }
    }

    // =========================
    // SORT
    // =========================

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            getProductPrice(a) -
            getProductPrice(b)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            getProductPrice(b) -
            getProductPrice(a)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b?.rating || 0) -
            Number(a?.rating || 0)
        );
        break;

      case "newest":
        result.sort(
          (a, b) =>
            new Date(b?.createdAt || 0) -
            new Date(a?.createdAt || 0)
        );
        break;

      case "name":
        result.sort((a, b) =>
          String(a?.name || "").localeCompare(
            String(b?.name || "")
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    filters,
    sortBy,
    isFashion,
  ]);

  // =========================
  // FILTER COUNT
  // =========================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.gender !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.subCategory !== "all") count++;
    if (filters.size !== "all") count++;
    if (filters.color !== "all") count++;
    if (filters.availability !== "all") count++;
    if (filters.minPrice !== "") count++;
    if (filters.maxPrice !== "") count++;

    return count;
  }, [filters]);

  // =========================
  // UPDATE FILTER
  // =========================

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================
  // RESET
  // =========================

  const resetFilters = () => {
    setFilters({
      gender: "all",
      category: "all",
      subCategory: "all",
      size: "all",
      color: "all",
      availability: "all",
      minPrice: "",
      maxPrice: "",
    });

    setSortBy("default");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading store...
      </div>
    );
  }

  // =========================
  // STORE NOT FOUND
  // =========================

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Store not found
        </h2>

        <Link
          to="/"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl text-white font-semibold"
          style={{
            background:
              "linear-gradient(135deg, #1e3a8a, #02066f)",
          }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-5">

      {/* =========================
          STORE HEADER
      ========================= */}

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {store?.storeName || "Store"}
            </h1>

            <p className="text-sm text-slate-500 mt-0.5">
              {filteredProducts.length} products
            </p>
          </div>

          {/* FILTER + SORT */}

          <div className="flex items-center gap-2">

            {/* FILTER */}

            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="
                relative
                h-10
                px-3
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-700
                flex
                items-center
                gap-2
                hover:bg-slate-50
                transition
              "
            >
              <Filter size={17} />

              <span className="hidden sm:inline text-sm font-medium">
                Filter
              </span>

              {activeFilterCount > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2
                    min-w-[20px]
                    h-5
                    px-1
                    rounded-full
                    bg-blue-600
                    text-white
                    text-[11px]
                    font-bold
                    flex
                    items-center
                    justify-center
                  "
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* SORT */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowSort((prev) => !prev)
                }
                className="
                  h-10
                  px-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-700
                  flex
                  items-center
                  gap-2
                  hover:bg-slate-50
                  transition
                "
              >
                <SlidersHorizontal size={17} />

                <span className="hidden sm:inline text-sm font-medium">
                  Sort
                </span>

                <ChevronDown
                  size={15}
                  className={`transition ${
                    showSort
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {showSort && (
                <div
                  className="
                    absolute
                    right-0
                    top-12
                    z-30
                    w-48
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-xl
                    p-1.5
                  "
                >
                  {[
                    ["default", "Recommended"],
                    ["newest", "Newest"],
                    ["price-low", "Price: Low to High"],
                    ["price-high", "Price: High to Low"],
                    ["rating", "Top Rated"],
                    ["name", "Name: A-Z"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSortBy(value);
                        setShowSort(false);
                      }}
                      className={`
                        w-full
                        flex
                        items-center
                        justify-between
                        px-3
                        py-2.5
                        rounded-lg
                        text-sm
                        text-left
                        transition
                        ${
                          sortBy === value
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }
                      `}
                    >
                      {label}

                      {sortBy === value && (
                        <Check size={15} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          ACTIVE FILTER CHIPS
      ========================= */}

      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">

          {filters.gender !== "all" && (
            <FilterChip
              label={`Gender: ${filters.gender}`}
              onRemove={() =>
                updateFilter("gender", "all")
              }
            />
          )}

          {filters.category !== "all" && (
            <FilterChip
              label={`Category: ${filters.category}`}
              onRemove={() =>
                updateFilter("category", "all")
              }
            />
          )}

          {filters.subCategory !== "all" && (
            <FilterChip
              label={`Sub: ${filters.subCategory}`}
              onRemove={() =>
                updateFilter("subCategory", "all")
              }
            />
          )}

          {filters.size !== "all" && (
            <FilterChip
              label={`Size: ${filters.size}`}
              onRemove={() =>
                updateFilter("size", "all")
              }
            />
          )}

          {filters.color !== "all" && (
            <FilterChip
              label={`Color: ${filters.color}`}
              onRemove={() =>
                updateFilter("color", "all")
              }
            />
          )}

          {filters.availability !== "all" && (
            <FilterChip
              label={
                filters.availability === "in-stock"
                  ? "In Stock"
                  : "Out of Stock"
              }
              onRemove={() =>
                updateFilter(
                  "availability",
                  "all"
                )
              }
            />
          )}

          {(filters.minPrice !== "" ||
            filters.maxPrice !== "") && (
            <FilterChip
              label={`₹${filters.minPrice || 0} - ₹${
                filters.maxPrice || "∞"
              }`}
              onRemove={() => {
                updateFilter("minPrice", "");
                updateFilter("maxPrice", "");
              }}
            />
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="
              text-xs
              font-semibold
              text-blue-600
              hover:text-blue-800
              ml-1
            "
          >
            Clear all
          </button>
        </div>
      )}

      {/* =========================
          PRODUCTS
      ========================= */}

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center">

          <div className="
            w-14
            h-14
            mx-auto
            rounded-full
            bg-slate-100
            flex
            items-center
            justify-center
            text-slate-400
          ">
            <Filter size={23} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            No products found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Try changing or clearing your filters.
          </p>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-lg
                bg-blue-600
                text-white
                text-sm
                font-semibold
                hover:bg-blue-700
              "
            >
              <RotateCcw size={15} />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            gap-3
            sm:gap-4
          "
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category={category}
            />
          ))}
        </div>
      )}

      {/* =========================
          FILTER DRAWER
      ========================= */}

      {showFilters && (
        <div className="fixed inset-0 z-50">

          {/* Overlay */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilters(false)}
            className="
              absolute
              inset-0
              bg-black/40
              backdrop-blur-[2px]
              cursor-default
            "
          />

          {/* Drawer */}

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-full
              max-w-sm
              bg-white
              shadow-2xl
              flex
              flex-col
            "
          >

            {/* Drawer Header */}

            <div className="
              h-16
              px-5
              border-b
              border-slate-200
              flex
              items-center
              justify-between
            ">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Filters
                </h2>

                <p className="text-xs text-slate-500">
                  {activeFilterCount} active
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                  text-slate-600
                  hover:bg-slate-200
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* =========================
                  FASHION FILTERS
              ========================= */}

              {isFashion && (
                <>
                  {/* Gender */}

                  <FilterSection title="Gender">
                    <FilterSelect
                      value={filters.gender}
                      onChange={(value) =>
                        updateFilter(
                          "gender",
                          value
                        )
                      }
                      options={[
                        ["all", "All"],
                        ...filterOptions.genders.map(
                          (item) => [item, capitalize(item)]
                        ),
                      ]}
                    />
                  </FilterSection>

                  {/* Size */}

                  {filterOptions.sizes.length > 0 && (
                    <FilterSection title="Size">
                      <div className="flex flex-wrap gap-2">
                        <ChoiceButton
                          active={
                            filters.size === "all"
                          }
                          label="All"
                          onClick={() =>
                            updateFilter(
                              "size",
                              "all"
                            )
                          }
                        />

                        {filterOptions.sizes.map(
                          (size) => (
                            <ChoiceButton
                              key={size}
                              active={
                                filters.size ===
                                size
                              }
                              label={size.toUpperCase()}
                              onClick={() =>
                                updateFilter(
                                  "size",
                                  size
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    </FilterSection>
                  )}

                  {/* Color */}

                  {filterOptions.colors.length > 0 && (
                    <FilterSection title="Color">
                      <div className="flex flex-wrap gap-2">
                        <ChoiceButton
                          active={
                            filters.color === "all"
                          }
                          label="All"
                          onClick={() =>
                            updateFilter(
                              "color",
                              "all"
                            )
                          }
                        />

                        {filterOptions.colors.map(
                          (color) => (
                            <ChoiceButton
                              key={color}
                              active={
                                filters.color ===
                                color
                              }
                              label={capitalize(color)}
                              onClick={() =>
                                updateFilter(
                                  "color",
                                  color
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    </FilterSection>
                  )}
                </>
              )}

              {/* =========================
                  CATEGORY
              ========================= */}

              {filterOptions.categories.length > 0 && (
                <FilterSection title="Category">
                  <FilterSelect
                    value={filters.category}
                    onChange={(value) =>
                      updateFilter(
                        "category",
                        value
                      )
                    }
                    options={[
                      ["all", "All Categories"],
                      ...filterOptions.categories.map(
                        (item) => [item, item]
                      ),
                    ]}
                  />
                </FilterSection>
              )}

              {/* =========================
                  SUB CATEGORY
              ========================= */}

              {filterOptions.subCategories.length > 0 && (
                <FilterSection title="Sub Category">
                  <FilterSelect
                    value={filters.subCategory}
                    onChange={(value) =>
                      updateFilter(
                        "subCategory",
                        value
                      )
                    }
                    options={[
                      [
                        "all",
                        "All Sub Categories",
                      ],
                      ...filterOptions.subCategories.map(
                        (item) => [item, item]
                      ),
                    ]}
                  />
                </FilterSection>
              )}

              {/* =========================
                  AVAILABILITY
              ========================= */}

              <FilterSection title="Availability">
                <FilterSelect
                  value={filters.availability}
                  onChange={(value) =>
                    updateFilter(
                      "availability",
                      value
                    )
                  }
                  options={[
                    ["all", "All Products"],
                    ["in-stock", "In Stock"],
                    [
                      "out-of-stock",
                      "Out of Stock",
                    ],
                  ]}
                />
              </FilterSection>

              {/* =========================
                  PRICE
              ========================= */}

              <FilterSection title="Price Range">

                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                      Min Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        updateFilter(
                          "minPrice",
                          e.target.value
                        )
                      }
                      placeholder="₹0"
                      className="
                        w-full
                        h-10
                        px-3
                        rounded-lg
                        border
                        border-slate-200
                        outline-none
                        focus:border-blue-500
                        text-sm
                      "
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                      Max Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        updateFilter(
                          "maxPrice",
                          e.target.value
                        )
                      }
                      placeholder="₹∞"
                      className="
                        w-full
                        h-10
                        px-3
                        rounded-lg
                        border
                        border-slate-200
                        outline-none
                        focus:border-blue-500
                        text-sm
                      "
                    />
                  </div>

                </div>
              </FilterSection>

              {/* =========================
                  GROCERY NOTE
              ========================= */}

              {isGrocery && (
                <div className="
                  rounded-xl
                  bg-emerald-50
                  border
                  border-emerald-100
                  p-3
                ">
                  <p className="text-xs text-emerald-700">
                    Grocery filters are based on
                    category, sub-category,
                    availability and price.
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}

            <div className="
              p-4
              border-t
              border-slate-200
              flex
              gap-3
              bg-white
            ">

              <button
                type="button"
                onClick={resetFilters}
                className="
                  flex-1
                  h-11
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-700
                  font-semibold
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-slate-50
                "
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(false)
                }
                className="
                  flex-1
                  h-11
                  rounded-xl
                  bg-blue-600
                  text-white
                  font-semibold
                  text-sm
                  hover:bg-blue-700
                "
              >
                Show {filteredProducts.length} Products
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// FILTER SECTION
// =====================================================

function FilterSection({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 mb-2.5">
        {title}
      </h3>

      {children}
    </div>
  );
}

// =====================================================
// SELECT
// =====================================================

function FilterSelect({
  value,
  onChange,
  options,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          appearance-none
          w-full
          h-11
          px-3
          pr-9
          rounded-xl
          border
          border-slate-200
          bg-white
          text-sm
          text-slate-700
          outline-none
          focus:border-blue-500
        "
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          pointer-events-none
          text-slate-400
        "
      />
    </div>
  );
}

// =====================================================
// CHOICE BUTTON
// =====================================================

function ChoiceButton({
  active,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3
        py-2
        rounded-lg
        border
        text-xs
        font-semibold
        transition
        ${
          active
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
        }
      `}
    >
      {label}
    </button>
  );
}

// =====================================================
// FILTER CHIP
// =====================================================

function FilterChip({
  label,
  onRemove,
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1.5
        rounded-full
        bg-blue-50
        text-blue-700
        text-xs
        font-semibold
        hover:bg-blue-100
      "
    >
      {label}
      <X size={12} />
    </button>
  );
}

// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(value) {
  if (!value) return "";

  return String(value)
    .charAt(0)
    .toUpperCase() +
    String(value).slice(1);
}

