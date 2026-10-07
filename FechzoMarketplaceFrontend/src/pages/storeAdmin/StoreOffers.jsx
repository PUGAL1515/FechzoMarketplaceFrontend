import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { format } from "date-fns";
import {
  Percent,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  X,
  Tag,
} from "lucide-react";

const API_BASE = "/marketplace/store/offers";

const getStoreId = () => {
  const storeData = JSON.parse(localStorage.getItem("store") || "{}");
  return (
    storeData.id ||
    storeData._id ||
    storeData.storeId ||
    localStorage.getItem("storeId") ||
    null
  );
};

const emptyForm = {
  title: "",
  description: "",
  offerType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "0",
  isCoupon: false,
  couponCode: "",
  usageLimit: "",
  usagePerUser: "1",
  startDate: "",
  endDate: "",
  badgeText: "",
};

export default function StoreOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const storeId = getStoreId();
      if (!storeId) {
        alert("Store not logged in");
        return;
      }
      const res = await api.get(API_BASE, {
        params: { storeId, search: search || undefined },
      });
      setOffers(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (offer) => {
    setEditId(offer._id);
    setForm({
      title: offer.title || "",
      description: offer.description || "",
      offerType: offer.offerType || "percentage",
      discountValue: offer.discountValue ?? "",
      maxDiscount: offer.maxDiscount ?? "",
      minOrderValue: offer.minOrderValue ?? "0",
      isCoupon: !!offer.isCoupon,
      couponCode: offer.couponCode || "",
      usageLimit: offer.usageLimit ?? "",
      usagePerUser: offer.usagePerUser ?? "1",
      startDate: offer.startDate
        ? format(new Date(offer.startDate), "yyyy-MM-dd")
        : "",
      endDate: offer.endDate
        ? format(new Date(offer.endDate), "yyyy-MM-dd")
        : "",
      badgeText: offer.badgeText || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storeId = getStoreId();
    if (!storeId) {
      alert("Store not logged in");
      return;
    }

    if (
      !form.title ||
      !form.offerType ||
      form.discountValue === "" ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("Please fill required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        storeId,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount !== "" ? Number(form.maxDiscount) : null,
        minOrderValue: Number(form.minOrderValue) || 0,
        usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : null,
        usagePerUser: Number(form.usagePerUser) || 1,
      };

      if (editId) {
        await api.put(`${API_BASE}/${editId}`, payload, {
          params: { storeId },
        });
      } else {
        await api.post(API_BASE, payload, { params: { storeId } });
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const storeId = getStoreId();
      await api.patch(`${API_BASE}/${id}/toggle`, {}, { params: { storeId } });
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      const storeId = getStoreId();
      await api.delete(`${API_BASE}/${id}`, { params: { storeId } });
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <Percent size={22} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
              <p className="text-sm text-gray-500">
                Create and manage store offers & coupons
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            <Plus size={18} />
            Create Offer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title or coupon code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={fetchOffers}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? "Edit Offer" : "Create Offer"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 20% OFF on all products"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Offer Type *
                  </label>
                  <select
                    name="offerType"
                    value={form.offerType}
                    onChange={handleChange}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Discount Value *
                  </label>
                  <input
                    name="discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={handleChange}
                    required
                    min={0}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={form.offerType === "percentage" ? "20" : "100"}
                  />
                </div>
              </div>

              {form.offerType === "percentage" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Max Discount (₹)
                  </label>
                  <input
                    name="maxDiscount"
                    type="number"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min={0}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 150"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Min Order Value (₹)
                </label>
                <input
                  name="minOrderValue"
                  type="number"
                  value={form.minOrderValue}
                  onChange={handleChange}
                  min={0}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="isCoupon"
                  checked={form.isCoupon}
                  onChange={handleChange}
                  id="isCoupon"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isCoupon" className="text-sm text-gray-700 font-medium">
                  This is a coupon code
                </label>
              </div>

              {form.isCoupon && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Coupon Code *
                  </label>
                  <input
                    name="couponCode"
                    value={form.couponCode}
                    onChange={handleChange}
                    required={form.isCoupon}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SAVE50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Start Date *
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    End Date *
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Badge Text
                </label>
                <input
                  name="badgeText"
                  value={form.badgeText}
                  onChange={handleChange}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20% OFF"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Usage Limit (total)
                  </label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min={0}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Per User Limit
                  </label>
                  <input
                    name="usagePerUser"
                    type="number"
                    value={form.usagePerUser}
                    onChange={handleChange}
                    min={1}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editId ? "Update Offer" : "Create Offer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-gray-400">
                    Loading offers...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <Tag size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No offers yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create your first offer to get started
                    </p>
                    <button
                      type="button"
                      onClick={openCreate}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
                    >
                      <Plus size={16} />
                      Create Offer
                    </button>
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/70 transition">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {o.title}
                      {o.badgeText && (
                        <span className="ml-2 text-[11px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          {o.badgeText}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                      {o.offerType?.replace("_", " ")}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {o.offerType === "percentage"
                        ? `${o.discountValue}%`
                        : o.offerType === "flat"
                        ? `₹${o.discountValue}`
                        : "Free delivery"}
                      {o.minOrderValue > 0 && (
                        <div className="text-xs text-gray-400 font-normal mt-0.5">
                          Min ₹{o.minOrderValue}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {o.isCoupon && o.couponCode ? (
                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                          {o.couponCode}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Auto</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {o.startDate
                        ? format(new Date(o.startDate), "dd MMM yy")
                        : "-"}{" "}
                      →{" "}
                      {o.endDate
                        ? format(new Date(o.endDate), "dd MMM yy")
                        : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          o.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(o)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(o._id)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                          title={o.isActive ? "Disable" : "Enable"}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o._id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}