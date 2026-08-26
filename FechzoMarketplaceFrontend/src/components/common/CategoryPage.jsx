// src/pages/CategoryPage.jsx  (for /grocery, /fashion, /electronics)
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StoreCard from "../components/cards/StoreCard";
import axios from "axios"; // or your preferred fetch method

export default function CategoryPage() {
  const { category } = useParams(); // "grocery" | "fashion" | "electronics"
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        // Map frontend route to backend storeType
        const typeMap = {
          grocery: "grocery",
          fashion: "fashion",
          electronics: "electronic", // note: your schema uses "electronic"
        };

        const res = await axios.get(`/api/stores?storeType=${typeMap[category]}&status=approved`);
        setStores(res.data.stores || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [category]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 capitalize">
        {category} Stores
      </h1>

      {stores.length === 0 ? (
        <p className="text-slate-500 text-center py-20">No stores found in this category yet.</p>
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