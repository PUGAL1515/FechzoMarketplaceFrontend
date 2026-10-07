import React, { useEffect, useState } from "react";
import api from "../../api";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Search,
  Megaphone,
  Filter,
} from "lucide-react";
import AdForm from "./AdForm";

export default function StoreAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/ads");
      setAds(data.ads || []);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (id) => {
    setEditId(id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      await api.delete(`/ads/${id}`);
      setAds((prev) => prev.filter((ad) => ad._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete ad");
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/ads/${id}/toggle`);
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

  const formatPosition = (pos) => {
    if (!pos) return "-";
    return pos
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
              <Megaphone size={22} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ads</h1>
              <p className="text-sm text-gray-500">
                Create and manage promotional banners for your store
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            <Plus size={18} />
            Create Ad
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title or subtitle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative sm:w-52">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="all">All Positions</option>
              <option value="home-hero">Home Hero</option>
              <option value="home-secondary">Home Secondary</option>
              <option value="home-sponsored">Home Sponsored</option>
              <option value="home-strip">Home Strip</option>
              <option value="category-top">Category Top</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 bg-white border border-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No ads found
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {search || filterPosition !== "all"
              ? "Try changing your search or filter."
              : "Create your first promotional ad to get started."}
          </p>
          {!search && filterPosition === "all" && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
            >
              <Plus size={18} />
              Create Ad
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAds.map((ad) => (
            <div
              key={ad._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative h-44 bg-gray-100">
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
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    ad.isActive
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {ad.isActive ? "Active" : "Inactive"}
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {formatPosition(ad.position)}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 line-clamp-1 text-[15px]">
                  {ad.title || "Untitled Ad"}
                </h3>

                {ad.subtitle ? (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {ad.subtitle}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">No subtitle</p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span className="capitalize bg-gray-50 px-2 py-0.5 rounded-md">
                    {ad.type || "banner"}
                  </span>
                  <span>•</span>
                  <span>Priority: {ad.priority ?? 0}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openEdit(ad._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(ad._id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition ${
                      ad.isActive
                        ? "text-amber-600 hover:bg-amber-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
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
                    type="button"
                    onClick={() => handleDelete(ad._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdForm
        open={showForm}
        onClose={closeForm}
        editId={editId}
        onSuccess={fetchAds}
      />
    </div>
  );
}