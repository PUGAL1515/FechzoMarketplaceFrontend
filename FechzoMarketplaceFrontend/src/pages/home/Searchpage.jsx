import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Store,
  ShoppingBag,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";
import api from "../../../src/api/api";

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setStores([]);
      setProducts([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/api/marketplace/search?q=${encodeURIComponent(query)}`
        );

        console.log("SEARCH RESPONSE:", response.data);

        if (response.data?.success) {
          setStores(response.data.stores?.results || []);
          setProducts(response.data.products?.results || []);
        } else {
          setStores([]);
          setProducts([]);
        }
      } catch (err) {
        console.error("Search API Error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load search results."
        );

        setStores([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const getProductImage = (product) => {
    return (
      product?.thumbnail ||
      product?.images?.[0] ||
      "/images/product-placeholder.png"
    );
  };

  const getProductPrice = (product) => {
    const variant = product?.variants?.[0];

    return variant?.price ?? 0;
  };

  const getProductMrp = (product) => {
    const variant = product?.variants?.[0];

    return variant?.mrp ?? 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
              <Search className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Search Results
              </h1>

              {query && (
                <p className="mt-0.5 text-sm text-gray-500">
                  Showing results for{" "}
                  <span className="font-semibold text-gray-700">
                    "{query}"
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                Searching...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* =================================================
                STORES
            ================================================= */}
            {stores.length > 0 && (
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-blue-600" />

                      <h2 className="text-lg font-bold text-gray-900">
                        Stores
                      </h2>

                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {stores.length}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Stores matching your search
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stores.map((store) => (
                    <Link
                      key={store._id}
                      to={`/store/${store._id}`}
                      className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* Store Image */}
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        {store.storefrontImage ? (
                          <img
                            src={store.storefrontImage}
                            alt={store.storeName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : store.logo ? (
                          <div className="flex h-full items-center justify-center">
                            <img
                              src={store.logo}
                              alt={store.storeName}
                              className="h-24 w-24 rounded-xl object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Store className="h-14 w-14 text-gray-300" />
                          </div>
                        )}

                        {/* Open status */}
                        <div className="absolute right-3 top-3">
                          {store.isOpen ? (
                            <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                              Open
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-white">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Store details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-gray-900">
                              {store.storeName}
                            </h3>

                            <p className="mt-1 text-sm capitalize text-gray-500">
                              {store.storeType}
                            </p>
                          </div>

                          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                        </div>

                        {store.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                            {store.description}
                          </p>
                        )}

                        {store.address?.city && (
                          <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />

                            <span className="capitalize">
                              {store.address.city}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* =================================================
                PRODUCTS
            ================================================= */}
            {products.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />

                      <h2 className="text-lg font-bold text-gray-900">
                        Products
                      </h2>

                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {products.length}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Products matching your search
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product) => {
                    const price = getProductPrice(product);
                    const mrp = getProductMrp(product);

                    return (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        {/* Product image */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                          {product.status === "approved" && (
                            <div className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-1 text-[10px] font-semibold text-white">
                              Available
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-3">
                          <p className="mb-1 text-xs font-medium capitalize text-blue-600">
                            {product.storeType}
                          </p>

                          <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900">
                            {product.name}
                          </h3>

                          {product.brand && (
                            <p className="mt-1 truncate text-xs text-gray-500">
                              Brand: {product.brand}
                            </p>
                          )}

                          {/* Store */}
                          {product.storeId && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Store className="h-3.5 w-3.5 text-gray-400" />

                              <span className="truncate text-xs font-medium text-gray-600">
                                {product.storeId.storeName}
                              </span>
                            </div>
                          )}

                          {/* Rating */}
                          <div className="mt-2 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />

                            <span className="text-xs font-medium text-gray-600">
                              {product.rating || 0}
                            </span>

                            <span className="text-xs text-gray-400">
                              ({product.reviewCount || 0})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{price}
                            </span>

                            {mrp > price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{mrp}
                              </span>
                            )}
                          </div>

                          {/* Store open/closed */}
                          {product.storeId && (
                            <div className="mt-2">
                              {product.storeId.isOpen ? (
                                <span className="text-xs font-medium text-green-600">
                                  ● Store Open
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-gray-500">
                                  ● Store Closed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================
                NO RESULTS
            ================================================= */}
            {stores.length === 0 && products.length === 0 && (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-9 w-9 text-gray-400" />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-gray-900">
                    No results found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    We couldn't find any stores or products matching
                    "{query}".
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Try searching for another product, brand, or store.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}