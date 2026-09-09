import React from "react";

export default function StatusSection({ form, updateField }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Product Status</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <p className="font-semibold text-gray-800">Active</p>
            <p className="text-xs text-gray-500">Product is active.</p>
          </div>
        </label>

        <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={form.isDeleted}
            onChange={(e) => updateField("isDeleted", e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <p className="font-semibold text-gray-800">Deleted</p>
            <p className="text-xs text-gray-500">Soft delete product.</p>
          </div>
        </label>

        <div className="border rounded-xl p-4">
          <p className="font-semibold text-gray-800">Status</p>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="input mt-2"
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </section>
  );
}
