import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function HighlightsSection({
  highlight,
  setHighlight,
  form,
  addHighlight,
  removeHighlight,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900">Product Highlights</h2>
      <p className="text-sm text-gray-500 mt-1">Add important selling points.</p>

      <div className="flex gap-3 mt-5">
        <input
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHighlight();
            }
          }}
          placeholder="Premium Quality"
          className="input"
        />
        <button
          type="button"
          onClick={addHighlight}
          className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus />
        </button>
      </div>

      {form.highlights.length > 0 && (
        <div className="mt-4 space-y-2">
          {form.highlights.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <span className="text-sm">✓ {item}</span>
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="text-red-500"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
