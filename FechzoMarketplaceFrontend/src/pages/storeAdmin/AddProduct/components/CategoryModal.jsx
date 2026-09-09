import React from "react";
import { FolderPlus, X } from "lucide-react";

export default function CategoryModal({
  categoryForm,
  categoryLoading,
  updateCategoryForm,
  handleCategoryNameChange,
  createMainCategory,
  closeCategoryModal,
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <FolderPlus className="text-blue-600" />
            <div>
              <h2 className="text-lg font-bold">Add Main Category</h2>
              <p className="text-xs text-gray-500">Create marketplace category</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCategoryModal}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <form onSubmit={createMainCategory} className="p-6 space-y-4">
          <div>
            <label className="label">Category ID *</label>
            <input
              value={categoryForm.categoryId}
              onChange={(e) => updateCategoryForm("categoryId", e.target.value)}
              placeholder="FASHION"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Category Name *</label>
            <input
              value={categoryForm.name}
              onChange={(e) => handleCategoryNameChange(e.target.value)}
              placeholder="Fashion"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Slug *</label>
            <input
              value={categoryForm.slug}
              onChange={(e) => updateCategoryForm("slug", e.target.value)}
              placeholder="fashion"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) =>
                updateCategoryForm("description", e.target.value)
              }
              placeholder="Fashion products"
              className="input resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Image URL</label>
            <input
              value={categoryForm.image}
              onChange={(e) => updateCategoryForm("image", e.target.value)}
              placeholder="https://..."
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeCategoryModal}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={categoryLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {categoryLoading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
