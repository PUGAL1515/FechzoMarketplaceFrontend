import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard"; // adjust path if needed
import axios from "axios";

export default function StorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, productsRes] = await Promise.all([
          axios.get(`/api/stores/${storeId}`),
          axios.get(`/api/products?storeId=${storeId}&isActive=true`),
        ]);

        setStore(storeRes.data.store || storeRes.data);
        setProducts(productsRes.data.products || productsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) fetchData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading store...
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Store not found</h2>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl text-white font-semibold"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #02066f)" }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  // Detect category from storeType for ProductCard links
  const category =
    store.storeType === "electronic"
      ? "electronics"
      : store.storeType || "grocery";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-6">
      {/* Store Header */}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-5 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <img
            src={
              store.logo ||
              store.storefrontImage ||
              store.images?.[0] ||
              "https://via.placeholder.com/120"
            }
            alt={store.storeName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {store.storeName}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                  store.isOpen ? "bg-emerald-500" : "bg-slate-400"
                }`}
              >
                {store.isOpen ? "Open" : "Closed"}
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              {store.address?.fullAddress ||
                `${store.address?.city || ""} ${store.address?.state || ""}`}
            </p>

            {store.description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {store.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Products ({products.length})
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No products available in this store yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              category={category}
            />
          ))}
        </div>
      )}
    </div>
  );
}