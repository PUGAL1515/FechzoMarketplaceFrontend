import React from "react";
import { Tags, X } from "lucide-react";

export default function SubCategoryModal({
  subCategoryForm,
  categoryLoading,
  selectedCategoryName,
  updateSubCategoryForm,
  handleSubCategoryNameChange,
  createSubCategory,
  closeSubCategoryModal,
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Tags className="text-blue-600" />
            <div>
              <h2 className="text-lg font-bold">Add Sub Category</h2>
              <p className="text-xs text-gray-500">
                Under:{" "}
                <span className="font-semibold">{selectedCategoryName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSubCategoryModal}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <form onSubmit={createSubCategory} className="p-6 space-y-4">
          <div>
            <label className="label">Sub Category ID *</label>
            <input
              value={subCategoryForm.categoryId}
              onChange={(e) =>
                updateSubCategoryForm("categoryId", e.target.value)
              }
              placeholder="FASHION-SHIRTS"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Sub Category Name *</label>
            <input
              value={subCategoryForm.name}
              onChange={(e) => handleSubCategoryNameChange(e.target.value)}
              placeholder="Shirts"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Slug *</label>
            <input
              value={subCategoryForm.slug}
              onChange={(e) => updateSubCategoryForm("slug", e.target.value)}
              placeholder="shirts"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={subCategoryForm.description}
              onChange={(e) =>
                updateSubCategoryForm("description", e.target.value)
              }
              placeholder="Shirt products"
              className="input resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Image URL</label>
            <input
              value={subCategoryForm.image}
              onChange={(e) => updateSubCategoryForm("image", e.target.value)}
              placeholder="https://..."
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeSubCategoryModal}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={categoryLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {categoryLoading ? "Creating..." : "Create Sub Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
