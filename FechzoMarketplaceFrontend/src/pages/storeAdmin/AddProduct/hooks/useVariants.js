import { useState } from "react";
import axios from "axios";
import { API, EMPTY_VARIANT } from "../constants";

export default function useVariants({ form, setForm }) {
  const [uploadingVariantImage, setUploadingVariantImage] = useState(null);

  const handleVariantImageUpload = async (variantIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Variant image must be less than 5MB");
      e.target.value = "";
      return;
    }

    try {
      setUploadingVariantImage(variantIndex);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedImage =
        response.data?.imageUrl ||
        response.data?.url ||
        response.data?.secure_url;

      if (!uploadedImage) {
        throw new Error("Variant image URL not returned");
      }

      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((variant, index) =>
          index === variantIndex
            ? {
                ...variant,
                images: [
                  ...(Array.isArray(variant.images) ? variant.images : []),
                  uploadedImage,
                ],
              }
            : variant
        ),
      }));
    } catch (error) {
      console.error("Variant image upload failed:", error);
      alert(
        error.response?.data?.message || "Failed to upload variant image"
      );
    } finally {
      setUploadingVariantImage(null);
      e.target.value = "";
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              images: (Array.isArray(variant.images) ? variant.images : []).filter(
                (_, i) => i !== imageIndex
              ),
            }
          : variant
      ),
    }));
  };

  const copyImagesFromVariant = (targetIndex, sourceIndex) => {
    if (targetIndex === sourceIndex) return;

    const source = form.variants[sourceIndex];
    if (!source || !Array.isArray(source.images) || source.images.length === 0) {
      alert("Selected variant has no images");
      return;
    }

    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === targetIndex
          ? { ...variant, images: [...source.images] }
          : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { ...EMPTY_VARIANT, attributes: {}, images: [] },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => {
      if (prev.variants.length === 1) return prev;
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      };
    });
  };

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const updateVariantAttribute = (variantIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) => {
        if (index !== variantIndex) return variant;
        return {
          ...variant,
          attributes: { ...variant.attributes, [key]: value },
        };
      }),
    }));
  };

  const removeVariantAttribute = (variantIndex, key) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) => {
        if (index !== variantIndex) return variant;
        const updated = { ...variant.attributes };
        delete updated[key];
        return { ...variant, attributes: updated };
      }),
    }));
  };

  return {
    uploadingVariantImage,
    handleVariantImageUpload,
    removeVariantImage,
    copyImagesFromVariant,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantAttribute,
    removeVariantAttribute,
  };
}
