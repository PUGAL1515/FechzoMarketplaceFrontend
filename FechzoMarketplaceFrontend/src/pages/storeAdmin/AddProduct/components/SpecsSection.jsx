import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function SpecsSection({
  attributeKey,
  setAttributeKey,
  attributeValue,
  setAttributeValue,
  form,
  addSpecification,
  removeSpecification,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          Electronics Specifications
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Add display, processor, RAM, camera, battery, warranty, etc.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={attributeKey}
          onChange={(e) => setAttributeKey(e.target.value)}
          placeholder="Specification - RAM"
          className="input"
        />

        <div className="flex gap-2">
          <input
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSpecification();
              }
            }}
            placeholder="Value - 8GB"
            className="input"
          />
          <button
            type="button"
            onClick={addSpecification}
            className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus />
          </button>
        </div>
      </div>

      {Object.keys(form.specifications).length > 0 && (
        <div className="mt-5 border rounded-xl overflow-hidden">
          {Object.entries(form.specifications).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between border-b last:border-b-0 px-4 py-3"
            >
              <span className="font-medium text-gray-700">{key}</span>
              <span className="flex items-center gap-5 text-gray-600">
                {String(value)}
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
