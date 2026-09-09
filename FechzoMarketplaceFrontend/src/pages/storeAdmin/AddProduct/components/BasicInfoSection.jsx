import React from "react";

export default function BasicInfoSection({
  form,
  normalizedStoreType,
  handleNameChange,
  updateField,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the basic product details.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="label">Product Name *</label>
          <input
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={
              normalizedStoreType === "grocery"
                ? "India Gate Basmati Rice"
                : normalizedStoreType === "electronics"
                ? "Samsung Galaxy A56"
                : "Men Regular Fit Cotton T-Shirt"
            }
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Brand</label>
          <input
            value={form.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            placeholder="Brand name"
            className="input"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="label">Slug *</label>
        <input
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          placeholder="india-gate-basmati-rice"
          className="input"
          required
        />
      </div>

      <div className="mt-5">
        <label className="label">Short Description</label>
        <input
          value={form.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          placeholder="Premium Basmati Rice"
          className="input"
        />
      </div>

      <div className="mt-5">
        <label className="label">Description</label>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Enter detailed product description..."
          className="input resize-none"
        />
      </div>
    </section>
  );
}
