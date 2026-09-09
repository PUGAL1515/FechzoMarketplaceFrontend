import React from "react";
import { FolderPlus, Plus } from "lucide-react";
import { getCategoryMongoId, getCategoryName, getObjectId } from "../utils";

export default function CategorySection({
  form,
  categories,
  productCategories,
  categoryLoading,
  selectedCategoryName,
  handleMainCategoryChange,
  updateField,
  setShowCategoryModal,
  setShowSubCategoryModal,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Category</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select main category and sub-category.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCategoryModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <FolderPlus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="label">Main Category *</label>
          <select
            value={form.categoryId || ""}
            onChange={(e) => handleMainCategoryChange(e.target.value)}
            className="input"
            required
          >
            <option value="">Select Main Category</option>
            {categories.map((category) => {
              const id = getCategoryMongoId(category);
              return (
                <option key={id || category.categoryId} value={id}>
                  {getCategoryName(category)}
                </option>
              );
            })}
          </select>

          {form.categoryId && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-green-700">Selected Main Category</p>
              <p className="text-sm font-semibold text-green-800">
                {selectedCategoryName || "Selected"}
              </p>
              <p className="text-[11px] text-green-600 break-all">
                ID: {form.categoryId}
              </p>
            </div>
          )}

          {categories.length === 0 && !categoryLoading && (
            <p className="text-xs text-red-500 mt-2">
              No main categories available.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Sub Category *</label>
            <button
              type="button"
              disabled={!form.categoryId}
              onClick={() => setShowSubCategoryModal(true)}
              className={`inline-flex items-center gap-1 text-sm font-semibold ${
                form.categoryId
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <Plus size={16} />
              Add Sub Category
            </button>
          </div>

          <select
            value={form.subcategoryId || ""}
            onChange={(e) =>
              updateField("subcategoryId", getObjectId(e.target.value))
            }
            disabled={!form.categoryId}
            className="input disabled:bg-gray-100"
            required
          >
            <option value="">
              {!form.categoryId
                ? "Select main category first"
                : categoryLoading
                ? "Loading sub-categories..."
                : "Select Sub Category"}
            </option>

            {productCategories.map((category) => {
              const id = getCategoryMongoId(category);
              return (
                <option key={id || category.categoryId} value={id}>
                  {getCategoryName(category)}
                </option>
              );
            })}
          </select>

          {form.subcategoryId && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-green-700">Selected Sub Category</p>
              <p className="text-[11px] text-green-600 break-all">
                ID: {form.subcategoryId}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
