import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API = "http://localhost:5000";

export default function AdForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    mobileImage: "",
    ctaText: "Shop Now",
    ctaLink: "",
    type: "hero",
    position: "home-hero",
    categories: ["all"],
    badge: "",
    bgColor: "from-blue-600 to-indigo-700",
    icon: "",
    discountText: "",
    price: "",
    originalPrice: "",
    priority: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Load ad data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchAd = async () => {
        try {
          setFetching(true);
          const { data } = await axios.get(`${API}/api/ads/${id}`);
          const ad = data.ad;

          setForm({
            title: ad.title || "",
            subtitle: ad.subtitle || "",
            description: ad.description || "",
            image: ad.image || "",
            mobileImage: ad.mobileImage || "",
            ctaText: ad.ctaText || "Shop Now",
            ctaLink: ad.ctaLink || "",
            type: ad.type || "hero",
            position: ad.position || "home-hero",
            categories: ad.categories || ["all"],
            badge: ad.badge || "",
            bgColor: ad.bgColor || "from-blue-600 to-indigo-700",
            icon: ad.icon || "",
            discountText: ad.discountText || "",
            price: ad.price || "",
            originalPrice: ad.originalPrice || "",
            priority: ad.priority || 0,
            isActive: ad.isActive ?? true,
            startDate: ad.startDate
              ? new Date(ad.startDate).toISOString().slice(0, 16)
              : "",
            endDate: ad.endDate
              ? new Date(ad.endDate).toISOString().slice(0, 16)
              : "",
          });
        } catch (err) {
          console.error(err);
          setError("Failed to load ad");
        } finally {
          setFetching(false);
        }
      };

      fetchAd();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        priority: Number(form.priority) || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };

      if (isEditing) {
        await axios.put(`${API}/api/ads/${id}`, payload);
      } else {
        await axios.post(`${API}/api/ads`, payload);
      }

      navigate("/store-admin/ads");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading ad data...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/store-admin/ads")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          Back to Ads
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Ad" : "Create New Ad"}
        </h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below to {isEditing ? "update" : "create"} a
          promotional banner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Big Summer Sale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Up to 60% off"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional longer description..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Text
              </label>
              <input
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Link *
              </label>
              <input
                type="text"
                name="ctaLink"
                value={form.ctaLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/offers or /category/fashion"
              />
            </div>
          </div>
        </div>

        {/* Images & Visuals */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Images & Visuals</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Main Image URL *
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-3 h-32 object-cover rounded-xl border"
              />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Badge Text
              </label>
              <input
                type="text"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Limited Time"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Icon (emoji)
              </label>
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="🔥 or 📱"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Background Gradient
            </label>
            <select
              name="bgColor"
              value={form.bgColor}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="from-blue-600 to-indigo-700">Blue → Indigo</option>
              <option value="from-emerald-500 to-teal-600">Emerald → Teal</option>
              <option value="from-pink-500 to-rose-600">Pink → Rose</option>
              <option value="from-orange-500 to-amber-600">Orange → Amber</option>
              <option value="from-purple-600 to-violet-700">Purple → Violet</option>
            </select>
          </div>
        </div>

        {/* Type & Position */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Type & Placement</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ad Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="hero">Hero</option>
                <option value="secondary">Secondary</option>
                <option value="sponsored">Sponsored</option>
                <option value="strip">Strip</option>
                <option value="banner">Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Position *
              </label>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="home-hero">Home Hero</option>
                <option value="home-secondary">Home Secondary</option>
                <option value="home-sponsored">Home Sponsored</option>
                <option value="home-strip">Home Strip</option>
                <option value="category-top">Category Top</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <input
                type="number"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                id="isActive"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Sponsored fields */}
        {(form.type === "sponsored" || form.position === "home-sponsored") && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Sponsored Deal Details</h2>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="₹1,299"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Original Price
                </label>
                <input
                  type="text"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="₹2,999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount Text
                </label>
                <input
                  type="text"
                  name="discountText"
                  value={form.discountText}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="57% OFF"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scheduling */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Scheduling (Optional)</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/store-admin/ads")}
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Ad"
              : "Create Ad"}
          </button>
        </div>
      </form>
    </div>
  );
}