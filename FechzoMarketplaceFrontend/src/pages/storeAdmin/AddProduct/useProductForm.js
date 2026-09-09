import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API, EMPTY_VARIANT } from "./constants";
import {
  getObjectId,
  getCategoryMongoId,
  getCategoryName,
  generateSlug,
} from "./utils";
import useCategories from "./hooks/useCategories";
import useVariants from "./hooks/useVariants";
import useProductSubmit from "./hooks/useProductSubmit";

export default function useProductForm({ editProduct, onSuccess }) {
  const storeId = localStorage.getItem("storeId") || "";

  const storedStore = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("store") || "null");
    } catch {
      return null;
    }
  }, []);

  const storeType =
    storedStore?.storeType || localStorage.getItem("storeType") || "";

  const [form, setForm] = useState({
    productId: "",
    storeId,
    storeType,
    categoryId: "",
    subcategoryId: "",
    name: "",
    slug: "",
    brand: "",
    gender: "",
    description: "",
    shortDescription: "",
    images: [],
    thumbnail: "",
    unitType: "count",
    unit: "piece",
    highlights: [],
    specifications: {},
    variants: [{ ...EMPTY_VARIANT, attributes: {}, images: [] }],
    status: "approved",
    isActive: true,
    isDeleted: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");

  const normalizedStoreType = String(form.storeType || storeType || "")
    .toLowerCase()
    .trim();

  const {
    categories,
    productCategories,
    categoryLoading,
    showCategoryModal,
    setShowCategoryModal,
    showSubCategoryModal,
    setShowSubCategoryModal,
    categoryForm,
    subCategoryForm,
    fetchCategories,
    fetchProductCategories,
    handleMainCategoryChange,
    updateCategoryForm,
    updateSubCategoryForm,
    handleCategoryNameChange,
    handleSubCategoryNameChange,
    createMainCategory,
    createSubCategory,
    closeCategoryModal,
    closeSubCategoryModal,
  } = useCategories({ storeId, normalizedStoreType, form, setForm });

  const {
    uploadingVariantImage,
    handleVariantImageUpload,
    removeVariantImage,
    copyImagesFromVariant,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantAttribute,
    removeVariantAttribute,
  } = useVariants({ form, setForm });

  const { loading, handleSubmit } = useProductSubmit({
    form,
    editProduct,
    storeId,
    storeType,
    onSuccess,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!editProduct) return;

    console.log("========== EDIT PRODUCT ==========");
    console.log(editProduct);

    const categoryId =
      getObjectId(editProduct.categoryId) ||
      getObjectId(editProduct.category) ||
      getObjectId(editProduct.mainCategory);

    const subcategoryId =
      getObjectId(editProduct.subcategoryId) ||
      getObjectId(editProduct.productCategory) ||
      getObjectId(editProduct.subCategory);

    const loadedVariants =
      Array.isArray(editProduct.variants) && editProduct.variants.length > 0
        ? editProduct.variants.map((variant) => ({
            _id: variant?._id,
            sku: variant?.sku || "",
            attributes:
              variant?.attributes && typeof variant.attributes === "object"
                ? { ...variant.attributes }
                : {},
            images: Array.isArray(variant?.images) ? [...variant.images] : [],
            price: variant?.price ?? "",
            mrp: variant?.mrp ?? "",
            stock: variant?.stock ?? "",
          }))
        : [{ ...EMPTY_VARIANT, attributes: {}, images: [] }];

    setForm({
      productId: editProduct.productId || editProduct._id || "",
      storeId: getObjectId(editProduct.storeId) || storeId,
      storeType:
        editProduct.storeType ||
        editProduct.productType ||
        editProduct.storeId?.storeType ||
        storeType,
      categoryId,
      subcategoryId,
      name: editProduct.name || "",
      slug: editProduct.slug || generateSlug(editProduct.name || ""),
      brand: editProduct.brand || "",
      gender: editProduct.gender || "",
      description: editProduct.description || "",
      shortDescription: editProduct.shortDescription || "",
      images: Array.isArray(editProduct.images) ? [...editProduct.images] : [],
      thumbnail: editProduct.thumbnail || editProduct.images?.[0] || "",
      unitType: editProduct.unitType || "count",
      unit: editProduct.unit || "piece",
      highlights: Array.isArray(editProduct.highlights)
        ? [...editProduct.highlights]
        : [],
      specifications:
        editProduct.specifications &&
        typeof editProduct.specifications === "object"
          ? { ...editProduct.specifications }
          : {},
      variants: loadedVariants,
      status: editProduct.status || "approved",
      isActive: editProduct.isActive !== false,
      isDeleted: editProduct.isDeleted === true,
    });

    if (categoryId) {
      fetchProductCategories(categoryId);
    }
  }, [editProduct]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug:
        !editProduct ||
        !prev.slug ||
        prev.slug === generateSlug(prev.name)
          ? generateSlug(value)
          : prev.slug,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
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
        throw new Error("Image URL not returned");
      }

      setForm((prev) => {
        const updatedImages = [...prev.images, uploadedImage];
        return {
          ...prev,
          images: updatedImages,
          thumbnail: prev.thumbnail || uploadedImage,
        };
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const removed = prev.images[index];
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        thumbnail:
          prev.thumbnail === removed ? updated[0] || "" : prev.thumbnail,
      };
    });
  };

  const setThumbnail = (image) => {
    setForm((prev) => ({ ...prev, thumbnail: image }));
  };

  const addHighlight = () => {
    const value = highlight.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      highlights: [...prev.highlights, value],
    }));
    setHighlight("");
  };

  const removeHighlight = (index) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    const key = attributeKey.trim();
    const value = attributeValue.trim();
    if (!key || !value) {
      alert("Enter specification name and value");
      return;
    }
    setForm((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
    setAttributeKey("");
    setAttributeValue("");
  };

  const removeSpecification = (key) => {
    setForm((prev) => {
      const updated = { ...prev.specifications };
      delete updated[key];
      return { ...prev, specifications: updated };
    });
  };

  const selectedCategory = categories.find(
    (category) =>
      getCategoryMongoId(category) === getObjectId(form.categoryId)
  );
  const selectedCategoryName = getCategoryName(selectedCategory);

  const unitOptions =
    normalizedStoreType === "grocery"
      ? [
          ["kg", "Kilogram"],
          ["gram", "Gram"],
          ["liter", "Liter"],
          ["ml", "Milliliter"],
          ["piece", "Piece"],
          ["pack", "Pack"],
          ["box", "Box"],
        ]
      : normalizedStoreType === "fashion"
      ? [
          ["piece", "Piece"],
          ["pair", "Pair"],
          ["pack", "Pack"],
        ]
      : normalizedStoreType === "electronics"
      ? [
          ["piece", "Piece"],
          ["pack", "Pack"],
        ]
      : [
          ["piece", "Piece"],
          ["kg", "Kilogram"],
          ["gram", "Gram"],
          ["liter", "Liter"],
          ["pack", "Pack"],
        ];

  return {
    form,
    normalizedStoreType,
    categories,
    productCategories,
    categoryLoading,
    loading,
    uploadingImage,
    uploadingVariantImage,
    highlight,
    setHighlight,
    attributeKey,
    setAttributeKey,
    attributeValue,
    setAttributeValue,
    showCategoryModal,
    setShowCategoryModal,
    showSubCategoryModal,
    setShowSubCategoryModal,
    categoryForm,
    subCategoryForm,
    selectedCategoryName,
    unitOptions,
    updateField,
    handleMainCategoryChange,
    handleNameChange,
    handleImageUpload,
    removeImage,
    setThumbnail,
    handleVariantImageUpload,
    removeVariantImage,
    copyImagesFromVariant,
    addHighlight,
    removeHighlight,
    addSpecification,
    removeSpecification,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantAttribute,
    removeVariantAttribute,
    updateCategoryForm,
    updateSubCategoryForm,
    handleCategoryNameChange,
    handleSubCategoryNameChange,
    createMainCategory,
    createSubCategory,
    handleSubmit,
    closeCategoryModal,
    closeSubCategoryModal,
  };
}
