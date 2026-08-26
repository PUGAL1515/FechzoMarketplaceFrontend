import { useEffect, useState } from "react";
import StoreCard from "../../components/common/StoreCard"; // adjust path if needed
import axios from "axios";

export default function FashionHome() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          "/api/stores?storeType=fashion&status=approved"
        );

        // Safe extraction
        let storeList = [];
        if (Array.isArray(res.data)) {
          storeList = res.data;
        } else if (Array.isArray(res.data?.stores)) {
          storeList = res.data.stores;
        } else if (Array.isArray(res.data?.data)) {
          storeList = res.data.data;
        }

        setStores(storeList);
      } catch (err) {
        console.error("Failed to load fashion stores:", err);
        setError("Failed to load fashion stores. Please try again.");
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // ----------------- UI -----------------

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Fashion Stores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover the latest styles for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Fashion Stores</h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover the latest styles for everyone
        </p>
      </div>

      {/* Store Cards */}
      {stores.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No fashion stores available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}