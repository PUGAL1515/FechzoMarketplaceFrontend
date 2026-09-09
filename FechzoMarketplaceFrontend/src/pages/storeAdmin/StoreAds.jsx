import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  ArrowLeft,
  Search,
} from "lucide-react";

const API = "http://localhost:5000";

export default function StoreAds() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/ads`);
      setAds(data.ads || []);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      await axios.delete(`${API}/api/ads/${id}`);
      setAds((prev) => prev.filter((ad) => ad._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete ad");
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(`${API}/api/ads/${id}/toggle`);
      setAds((prev) =>
        prev.map((ad) => (ad._id === id ? data.ad : ad))
      );
    } catch (error) {
      console.error("Toggle failed:", error);
      alert("Failed to toggle status");
    }
  };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title?.toLowerCase().includes(search.toLowerCase()) ||
      ad.subtitle?.toLowerCase().includes(search.toLowerCase());

    const matchesPosition =
      filterPosition === "all" || ad.position === filterPosition;

    return matchesSearch && matchesPosition;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/store-admin/dashboard")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Manage Ads
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage promotional banners for your store.
            </p>
          </div>

          <button
            onClick={() => navigate("/store-admin/ads/create")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            <Plus size={19} />
            Create Ad
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search ads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Positions</option>
          <option value="home-hero">Home Hero</option>
          <option value="home-secondary">Home Secondary</option>
          <option value="home-sponsored">Home Sponsored</option>
          <option value="home-strip">Home Strip</option>
          <option value="category-top">Category Top</option>
        </select>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No ads found
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first promotional ad to get started.
          </p>
          <button
            onClick={() => navigate("/store-admin/ads/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAds.map((ad) => (
            <div
              key={ad._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {ad.image ? (
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}

                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ad.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ad.isActive ? "Active" : "Inactive"}
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {ad.position}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {ad.title}
                </h3>
                {ad.subtitle && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {ad.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span className="capitalize">{ad.type}</span>
                  <span>•</span>
                  <span>Priority: {ad.priority}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/store-admin/ads/edit/${ad._id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggle(ad._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    {ad.isActive ? (
                      <>
                        <ToggleRight size={15} />
                        Disable
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={15} />
                        Enable
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}