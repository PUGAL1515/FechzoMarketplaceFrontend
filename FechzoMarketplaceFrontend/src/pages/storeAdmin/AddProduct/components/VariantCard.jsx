import React from "react";
import {
  Trash2,
  Upload,
  Image as ImageIcon,
  Palette,
  Ruler,
  X,
} from "lucide-react";

export default function VariantCard({
  variant,
  index,
  storeType,
  variants,
  uploadingVariantImage,
  onUpdate,
  onRemove,
  onUpdateAttribute,
  onRemoveAttribute,
  onUploadImage,
  onRemoveImage,
  onCopyImages,
}) {
  const attributeSuggestions =
    storeType === "grocery"
      ? ["weight", "packSize"]
      : storeType === "fashion"
      ? ["color", "size"]
      : storeType === "electronics"
      ? ["storage", "color"]
      : ["color", "size"];

  const addSuggestedAttribute = (key) => {
    const existingValue = variant.attributes?.[key] || "";
    const value = window.prompt(`Enter ${key}`, existingValue);
    if (!value?.trim()) return;
    onUpdateAttribute(index, key, value.trim());
  };

  const variantImages = Array.isArray(variant.images) ? variant.images : [];

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Variant {index + 1}</h3>
          <p className="text-xs text-gray-500">
            SKU, price, MRP, stock, attributes and images
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>

      {/* BASIC VARIANT FIELDS */}
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="label">SKU *</label>
          <input
            value={variant.sku}
            onChange={(e) => onUpdate(index, "sku", e.target.value)}
            placeholder={
              storeType === "grocery"
                ? "RICE-1KG"
                : storeType === "electronics"
                ? "A56-128-BLK"
                : "TS-BLK-M"
            }
            className="input"
          />
        </div>

        <div>
          <label className="label">Selling Price *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.price}
            onChange={(e) => onUpdate(index, "price", e.target.value)}
            placeholder="699"
            className="input"
          />
        </div>

        <div>
          <label className="label">MRP *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.mrp}
            onChange={(e) => onUpdate(index, "mrp", e.target.value)}
            placeholder="999"
            className="input"
          />
        </div>

        <div>
          <label className="label">Stock *</label>
          <input
            type="number"
            min="0"
            value={variant.stock}
            onChange={(e) => onUpdate(index, "stock", e.target.value)}
            placeholder="20"
            className="input"
          />
        </div>
      </div>

      {/* ATTRIBUTES */}
      <div className="mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-gray-800">Variant Attributes</p>
            <p className="text-xs text-gray-500">
              {storeType === "grocery" && "Example: weight = 1 KG"}
              {storeType === "fashion" && "Example: color = Black, size = M"}
              {storeType === "electronics" &&
                "Example: storage = 128GB, color = Black"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {attributeSuggestions.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => addSuggestedAttribute(key)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600"
              >
                + {key}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(variant.attributes || {}).length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(variant.attributes).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    {key}
                  </p>
                  <input
                    value={value}
                    onChange={(e) =>
                      onUpdateAttribute(index, key, e.target.value)
                    }
                    className="w-full border-0 outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttribute(index, key)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-400 text-center">
            No variant attributes added.
          </div>
        )}
      </div>

      {/* VARIANT IMAGES */}
      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Palette size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Variant Images</p>
              <p className="text-xs text-gray-500 mt-1">
                Upload images specific to this color / variant.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold cursor-pointer">
              <Upload size={16} />
              {uploadingVariantImage === index ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                disabled={uploadingVariantImage !== null}
                onChange={(e) => onUploadImage(index, e)}
              />
            </label>

            {variants.length > 1 && (
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                defaultValue=""
                onChange={(e) => {
                  const sourceIndex = Number(e.target.value);
                  if (Number.isInteger(sourceIndex)) {
                    onCopyImages(index, sourceIndex);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">Copy images from...</option>
                {variants.map(
                  (item, itemIndex) =>
                    itemIndex !== index && (
                      <option key={item._id || itemIndex} value={itemIndex}>
                        Variant {itemIndex + 1}{" "}
                        {item.attributes?.color
                          ? `- ${item.attributes.color}`
                          : ""}
                      </option>
                    )
                )}
              </select>
            )}
          </div>
        </div>

        {variantImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {variantImages.map((image, imageIndex) => (
              <div
                key={`${image}-${imageIndex}`}
                className="relative group border border-gray-200 rounded-xl p-2 bg-gray-50"
              >
                <img
                  src={image}
                  alt={`Variant ${index + 1} image ${imageIndex + 1}`}
                  className="w-full h-28 object-contain rounded-lg bg-white"
                />
                <span className="absolute left-2 bottom-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                  Image {imageIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveImage(index, imageIndex)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <ImageIcon size={30} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No variant images uploaded</p>
            <p className="text-xs text-gray-400 mt-1">
              For example, Black variant → Black shirt images
            </p>
          </div>
        )}

        {storeType === "fashion" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {variant.attributes?.color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                <Palette size={14} />
                {variant.attributes.color}
              </span>
            )}
            {variant.attributes?.size && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                <Ruler size={14} />
                {variant.attributes.size}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
