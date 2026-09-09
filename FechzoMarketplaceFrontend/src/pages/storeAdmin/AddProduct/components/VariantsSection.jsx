import React from "react";
import { Plus } from "lucide-react";
import VariantCard from "./VariantCard";

export default function VariantsSection({
  form,
  normalizedStoreType,
  uploadingVariantImage,
  addVariant,
  removeVariant,
  updateVariant,
  updateVariantAttribute,
  removeVariantAttribute,
  handleVariantImageUpload,
  removeVariantImage,
  copyImagesFromVariant,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Product Variants</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add different colors, sizes, storage options, weights, etc.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Variant
        </button>
      </div>

      <div className="space-y-5">
        {form.variants.map((variant, variantIndex) => (
          <VariantCard
            key={variant._id || variantIndex}
            variant={variant}
            index={variantIndex}
            storeType={normalizedStoreType}
            variants={form.variants}
            uploadingVariantImage={uploadingVariantImage}
            onUpdate={updateVariant}
            onRemove={removeVariant}
            onUpdateAttribute={updateVariantAttribute}
            onRemoveAttribute={removeVariantAttribute}
            onUploadImage={handleVariantImageUpload}
            onRemoveImage={removeVariantImage}
            onCopyImages={copyImagesFromVariant}
          />
        ))}
      </div>
    </section>
  );
}
