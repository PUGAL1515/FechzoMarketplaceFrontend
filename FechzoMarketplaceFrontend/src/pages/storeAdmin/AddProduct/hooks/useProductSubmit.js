import { useState } from "react";
import axios from "axios";
import { API } from "../constants";
import {
  getObjectId,
  generateSlug,
  createUniqueSlug,
  generateProductId,
  normalizeAttribute,
} from "../utils";

export default function useProductSubmit({
  form,
  editProduct,
  storeId,
  storeType,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const buildVariants = () => {
    return form.variants.map((variant) => ({
      ...(variant._id ? { _id: variant._id } : {}),
      sku: String(variant.sku || "").trim(),
      attributes: variant.attributes || {},
      images: Array.isArray(variant.images)
        ? variant.images.filter(Boolean)
        : [],
      price: Number(variant.price) || 0,
      mrp: Number(variant.mrp) || 0,
      stock: Number(variant.stock) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedMainCategoryId = getObjectId(form.categoryId);
    const selectedSubCategoryId = getObjectId(form.subcategoryId);
    const finalStoreId = getObjectId(form.storeId) || getObjectId(storeId);
    const finalStoreType = String(form.storeType || storeType || "")
      .toLowerCase()
      .trim();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!finalStoreId) {
      alert("Store ID not found. Please login again.");
      return;
    }
    if (!finalStoreType) {
      alert("Store type not found. Please login again.");
      return;
    }
    if (!selectedMainCategoryId) {
      alert("Please select main category");
      return;
    }
    if (!selectedSubCategoryId) {
      alert("Please select sub-category");
      return;
    }
    if (!Array.isArray(form.images) || form.images.length === 0) {
      alert("Please upload at least one product image");
      return;
    }
    if (!Array.isArray(form.variants) || form.variants.length === 0) {
      alert("Please add at least one product variant");
      return;
    }

    const duplicateSkus = new Set();
    const fashionCombinations = new Set();

    for (let i = 0; i < form.variants.length; i++) {
      const variant = form.variants[i];
      const sku = String(variant.sku || "").trim().toLowerCase();

      if (!sku) {
        alert(`Variant ${i + 1}: SKU is required`);
        return;
      }
      if (duplicateSkus.has(sku)) {
        alert(`Variant ${i + 1}: duplicate SKU found`);
        return;
      }
      duplicateSkus.add(sku);

      if (variant.price === "" || Number(variant.price) <= 0) {
        alert(`Variant ${i + 1}: valid selling price is required`);
        return;
      }
      if (variant.mrp === "" || Number(variant.mrp) <= 0) {
        alert(`Variant ${i + 1}: valid MRP is required`);
        return;
      }
      if (Number(variant.price) > Number(variant.mrp)) {
        alert(`Variant ${i + 1}: selling price cannot be greater than MRP`);
        return;
      }
      if (variant.stock === "" || Number(variant.stock) < 0) {
        alert(`Variant ${i + 1}: valid stock is required`);
        return;
      }

      if (finalStoreType === "fashion") {
        const color = normalizeAttribute(variant.attributes?.color);
        const size = normalizeAttribute(variant.attributes?.size);

        if (!color) {
          alert(`Variant ${i + 1}: Color is required`);
          return;
        }
        if (!size) {
          alert(`Variant ${i + 1}: Size is required`);
          return;
        }

        const combination = `${color}__${size}`;
        if (fashionCombinations.has(combination)) {
          alert(`Variant ${i + 1}: ${color} + ${size} already exists`);
          return;
        }
        fashionCombinations.add(combination);
      }
    }

    if (
      finalStoreType === "electronics" &&
      Object.keys(form.specifications || {}).length === 0
    ) {
      alert("Please add electronics specifications");
      return;
    }

    const variants = buildVariants();
    const firstVariant = variants[0];
    if (!firstVariant) {
      alert("At least one variant is required");
      return;
    }

    const finalProductId = editProduct?.productId
      ? editProduct.productId
      : generateProductId();

    const finalSlug = editProduct?._id
      ? form.slug.trim() || generateSlug(form.name)
      : createUniqueSlug(form.name);

    const payload = {
      productId: finalProductId,
      storeId: finalStoreId,
      storeType: finalStoreType,
      productType: finalStoreType,
      category: selectedMainCategoryId,
      productCategory: selectedSubCategoryId,
      sku: firstVariant.sku,
      price: firstVariant.price,
      categoryId: selectedMainCategoryId,
      subcategoryId: selectedSubCategoryId,
      mainCategory: selectedMainCategoryId,
      name: form.name.trim(),
      slug: finalSlug,
      brand: form.brand.trim(),
      gender: form.gender || "",
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      images: form.images,
      thumbnail: form.thumbnail || form.images[0] || "",
      unitType: form.unitType,
      unit: form.unit,
      variants,
      stock: firstVariant.stock,
      attributes: firstVariant.attributes || {},
      discountPrice: 0,
      highlights: form.highlights,
      specifications: form.specifications || {},
      deliveryInfo: "Free Delivery",
      returnPolicy: "7 Days Replacement",
      isAvailable: true,
      status: form.status,
      isActive: form.isActive,
      isDeleted: form.isDeleted,
    };

    console.log("==============================================");
    console.log("FINAL PRODUCT PAYLOAD:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==============================================");

    try {
      setLoading(true);
      let response;

      if (editProduct) {
        response = await axios.put(
          `${API}/api/products/${editProduct._id}`,
          payload
        );
      } else {
        response = await axios.post(`${API}/api/products`, payload);
      }

      console.log("PRODUCT SAVE RESPONSE:", response.data);
      alert(
        editProduct
          ? "Product updated successfully"
          : "Product created successfully"
      );

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("PRODUCT SAVE ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);
      const serverMessage = error.response?.data?.message;
      alert(
        typeof serverMessage === "string"
          ? serverMessage
          : "Failed to save product. Check browser console."
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit };
}
