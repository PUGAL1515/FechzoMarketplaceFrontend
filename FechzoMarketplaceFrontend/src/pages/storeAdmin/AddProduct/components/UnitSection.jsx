import React from "react";

export default function UnitSection({ form, unitOptions, updateField }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Unit Information</h2>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="label">Unit Type</label>
          <select
            value={form.unitType}
            onChange={(e) => updateField("unitType", e.target.value)}
            className="input"
          >
            <option value="count">Piece / Count</option>
            <option value="weight">Weight</option>
            <option value="volume">Volume</option>
            <option value="length">Length</option>
            <option value="size">Size</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="label">Unit</label>
          <select
            value={form.unit}
            onChange={(e) => updateField("unit", e.target.value)}
            className="input"
          >
            {unitOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
