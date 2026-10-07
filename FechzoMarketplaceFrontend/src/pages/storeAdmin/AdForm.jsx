import React, { useState, useEffect } from "react";
import api from "../../api";
import { X, Image as ImageIcon, Loader2, Save } from "lucide-react";

const emptyForm = {
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
};

export default function AdForm({ open, onClose, editId = null, onSuccess }) {
  const isEditing = !!editId;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setForm(emptyForm);

    if (!isEditing) return;

    const fetchAd = async () => {
      try {
        setFetching(true);
        const { data } = await api.get(`/ads/${editId}`);
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
  }, [open, editId, isEditing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        await api.put(`/ads/${editId}`, payload);
      } else {
        await api.post(`/ads`, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? "Edit Ad" : "Create Ad"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Update your promotional banner"
                : "Fill in the details below"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {fetching ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-blue-600 animate-spin" />
              <p className="text-sm text-gray-500">Loading ad data...</p>
            </div>
          ) : (
            <form id="ad-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Basic Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Big Summer Sale"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={form.subtitle}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Up to 60% off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Optional longer description..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      name="ctaText"
                      value={form.ctaText}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      CTA Link *
                    </label>
                    <input
                      type="text"
                      name="ctaLink"
                      value={form.ctaLink}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/offers or /category/fashion"
                    />
                  </div>
                </div>
              </section>

              {/* Images & Visuals */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Images & Visuals
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Main Image URL *
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  {form.image ? (
                    <div className="mt-2.5 w-full max-w-xs h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2.5 w-full max-w-xs h-28 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={form.badge}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Limited Time"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Icon (emoji)
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="🔥 or 📱"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Background Gradient
                  </label>
                  <select
                    name="bgColor"
                    value={form.bgColor}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="from-blue-600 to-indigo-700">Blue → Indigo</option>
                    <option value="from-emerald-500 to-teal-600">Emerald → Teal</option>
                    <option value="from-pink-500 to-rose-600">Pink → Rose</option>
                    <option value="from-orange-500 to-amber-600">Orange → Amber</option>
                    <option value="from-purple-600 to-violet-700">Purple → Violet</option>
                  </select>
                  <div
                    className={`mt-2.5 h-8 rounded-xl bg-linear-to-r ${form.bgColor}`}
                  />
                </div>
              </section>

              {/* Type & Placement */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Type & Placement
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Ad Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="hero">Hero</option>
                      <option value="secondary">Secondary</option>
                      <option value="sponsored">Sponsored</option>
                      <option value="strip">Strip</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Position *
                    </label>
                    <select
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="home-hero">Home Hero</option>
                      <option value="home-secondary">Home Secondary</option>
                      <option value="home-sponsored">Home Sponsored</option>
                      <option value="home-strip">Home Strip</option>
                      <option value="category-top">Category Top</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Priority
                    </label>
                    <input
                      type="number"
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 sm:pt-7">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      id="isActive"
                      className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </section>

              {/* Sponsored */}
              {(form.type === "sponsored" ||
                form.position === "home-sponsored") && (
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                      Sponsored Deal Details
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          Price
                        </label>
                        <input
                          type="text"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="₹1,299"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          Original Price
                        </label>
                        <input
                          type="text"
                          name="originalPrice"
                          value={form.originalPrice}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="₹2,999"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          Discount Text
                        </label>
                        <input
                          type="text"
                          name="discountText"
                          value={form.discountText}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="57% OFF"
                        />
                      </div>
                    </div>
                  </section>
                )}

              {/* Scheduling */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Scheduling{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </section>
            </form>
          )}
        </div>

        {/* Footer */}
        {!fetching && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="ad-form"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? "Update Ad" : "Create Ad"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}