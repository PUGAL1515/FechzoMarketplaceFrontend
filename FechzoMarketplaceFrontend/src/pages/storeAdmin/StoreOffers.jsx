import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { format } from "date-fns";

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

    if (!form.title || !form.offerType || form.discountValue === "" || !form.startDate || !form.endDate) {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offers</h1>
          <p className="text-sm text-gray-500">Create and manage store offers & coupons</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Create Offer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search by title or coupon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={fetchOffers}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
        >
          Search
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              {editId ? "Edit Offer" : "Create Offer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 20% OFF on all products"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Offer Type *</label>
                  <select
                    name="offerType"
                    value={form.offerType}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Discount Value *
                  </label>
                  <input
                    name="discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={handleChange}
                    required
                    min={0}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder={form.offerType === "percentage" ? "20" : "100"}
                  />
                </div>
              </div>

              {form.offerType === "percentage" && (
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Max Discount (₹)
                  </label>
                  <input
                    name="maxDiscount"
                    type="number"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min={0}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. 150"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Min Order Value (₹)
                </label>
                <input
                  name="minOrderValue"
                  type="number"
                  value={form.minOrderValue}
                  onChange={handleChange}
                  min={0}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isCoupon"
                  checked={form.isCoupon}
                  onChange={handleChange}
                  id="isCoupon"
                />
                <label htmlFor="isCoupon" className="text-sm text-gray-700">
                  This is a coupon code
                </label>
              </div>

              {form.isCoupon && (
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Coupon Code *
                  </label>
                  <input
                    name="couponCode"
                    value={form.couponCode}
                    onChange={handleChange}
                    required={form.isCoupon}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm uppercase"
                    placeholder="SAVE50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start Date *
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End Date *
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Badge Text
                </label>
                <input
                  name="badgeText"
                  value={form.badgeText}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="20% OFF"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Usage Limit (total)
                  </label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min={0}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Per User Limit
                  </label>
                  <input
                    name="usagePerUser"
                    type="number"
                    value={form.usagePerUser}
                    onChange={handleChange}
                    min={1}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="px-4 py-2.5 border rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Discount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Coupon
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Validity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                    No offers yet. Create your first offer.
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {o.title}
                      {o.badgeText && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          {o.badgeText}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {o.offerType?.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {o.offerType === "percentage"
                        ? `${o.discountValue}%`
                        : o.offerType === "flat"
                        ? `₹${o.discountValue}`
                        : "Free delivery"}
                      {o.minOrderValue > 0 && (
                        <div className="text-xs text-gray-400">
                          Min ₹{o.minOrderValue}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {o.isCoupon && o.couponCode ? (
                        <span className="font-mono text-indigo-600">
                          {o.couponCode}
                        </span>
                      ) : (
                        <span className="text-gray-400">Auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {o.startDate
                        ? format(new Date(o.startDate), "dd MMM yy")
                        : "-"}{" "}
                      →{" "}
                      {o.endDate
                        ? format(new Date(o.endDate), "dd MMM yy")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(o)}
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(o._id)}
                          className="text-amber-600 hover:underline text-xs font-medium"
                        >
                          {o.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o._id)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Delete
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