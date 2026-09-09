import React from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

export default function ImagesSection({
  form,
  uploadingImage,
  handleImageUpload,
  removeImage,
  setThumbnail,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
        <p className="text-sm text-gray-500 mt-1">
          These are fallback/default product images.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
        <ImagePlus size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">Upload Product Image</p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG, JPEG, WEBP up to 5MB
        </p>

        <label className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          <Plus size={18} />
          {uploadingImage ? "Uploading..." : "Choose Image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="hidden"
          />
        </label>
      </div>

      {form.images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
          {form.images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`relative border rounded-xl p-2 bg-gray-50 group cursor-pointer ${
                form.thumbnail === image
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              }`}
              onClick={() => setThumbnail(image)}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-contain rounded-lg"
              />

              {form.thumbnail === image && (
                <span className="absolute left-2 bottom-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded">
                  Thumbnail
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 mt-5">
          No images uploaded yet
        </p>
      )}
    </section>
  );
}
