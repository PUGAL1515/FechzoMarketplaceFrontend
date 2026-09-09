import { useState } from "react";
import axios from "axios";
import { API, EMPTY_CATEGORY_FORM, EMPTY_SUB_CATEGORY_FORM } from "../constants";
import {
  getObjectId,
  getCategoryMongoId,
  extractCategoryArray,
  generateSlug,
} from "../utils";

export default function useCategories({
  storeId,
  normalizedStoreType,
  form,
  setForm,
}) {
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ ...EMPTY_CATEGORY_FORM });
  const [subCategoryForm, setSubCategoryForm] = useState({
    ...EMPTY_SUB_CATEGORY_FORM,
  });

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await axios.get(`${API}/api/categories`);
      const fetchedCategories = extractCategoryArray(response.data);

      const mainCategories = fetchedCategories.filter((category) => {
        const parent = category?.parentCategory;
        return parent === null || parent === undefined || parent === "";
      });

      setCategories(
        mainCategories.length > 0 ? mainCategories : fetchedCategories
      );
    } catch (error) {
      console.error("Categories fetch failed:", error);
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchProductCategories = async (categoryId) => {
    const selectedId = getObjectId(categoryId);
    if (!selectedId) {
      setProductCategories([]);
      return;
    }

    try {
      setCategoryLoading(true);
      const response = await axios.get(
        `${API}/api/categories/product-categories`,
        { params: { categoryId: selectedId } }
      );
      const fetched = extractCategoryArray(response.data);
      setProductCategories(fetched);
    } catch (error) {
      console.error("Product categories fetch failed:", error);
      setProductCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleMainCategoryChange = async (categoryId) => {
    const selectedId = getObjectId(categoryId);
    setForm((prev) => ({
      ...prev,
      categoryId: selectedId,
      subcategoryId: "",
    }));
    setProductCategories([]);
    if (!selectedId) return;
    await fetchProductCategories(selectedId);
  };

  const updateCategoryForm = (field, value) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSubCategoryForm = (field, value) => {
    setSubCategoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryNameChange = (value) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubCategoryNameChange = (value) => {
    setSubCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const createMainCategory = async (e) => {
    e.preventDefault();

    if (
      !categoryForm.categoryId.trim() ||
      !categoryForm.name.trim() ||
      !categoryForm.slug.trim()
    ) {
      alert("Category ID, name and slug are required");
      return;
    }

    try {
      setCategoryLoading(true);
      const payload = {
        categoryId: categoryForm.categoryId.trim().toUpperCase(),
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim(),
        icon: categoryForm.icon.trim(),
        image: categoryForm.image.trim(),
        parentCategory: null,
        storeId: getObjectId(storeId),
        storeType: normalizedStoreType,
        isActive: true,
        sortOrder: Number(categoryForm.sortOrder) || 0,
      };

      const response = await axios.post(`${API}/api/categories`, payload);
      const newCategory = response.data?.category || response.data?.data;
      await fetchCategories();

      const newCategoryId = getCategoryMongoId(newCategory);
      if (newCategoryId) {
        setForm((prev) => ({
          ...prev,
          categoryId: newCategoryId,
          subcategoryId: "",
        }));
        setProductCategories([]);
      }

      alert("Main category created successfully");
      setCategoryForm({ ...EMPTY_CATEGORY_FORM });
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Create category error:", error);
      alert(error.response?.data?.message || "Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const createSubCategory = async (e) => {
    e.preventDefault();

    const parentId = getObjectId(form.categoryId);
    if (!parentId) {
      alert("Please select a main category first");
      return;
    }

    if (
      !subCategoryForm.categoryId.trim() ||
      !subCategoryForm.name.trim() ||
      !subCategoryForm.slug.trim()
    ) {
      alert("Sub-category ID, name and slug are required");
      return;
    }

    try {
      setCategoryLoading(true);
      const payload = {
        categoryId: subCategoryForm.categoryId.trim().toUpperCase(),
        name: subCategoryForm.name.trim(),
        slug: subCategoryForm.slug.trim(),
        description: subCategoryForm.description.trim(),
        icon: subCategoryForm.icon.trim(),
        image: subCategoryForm.image.trim(),
        parentCategory: parentId,
        storeId: getObjectId(storeId),
        storeType: normalizedStoreType,
        isActive: true,
        sortOrder: Number(subCategoryForm.sortOrder) || 0,
      };

      const response = await axios.post(`${API}/api/categories`, payload);
      const newSubCategory = response.data?.category || response.data?.data;
      await fetchProductCategories(parentId);

      const newSubCategoryId = getCategoryMongoId(newSubCategory);
      if (newSubCategoryId) {
        setForm((prev) => ({
          ...prev,
          categoryId: parentId,
          subcategoryId: newSubCategoryId,
        }));
      }

      alert("Sub-category created successfully");
      setSubCategoryForm({ ...EMPTY_SUB_CATEGORY_FORM });
      setShowSubCategoryModal(false);
    } catch (error) {
      console.error("Create sub-category error:", error);
      alert(error.response?.data?.message || "Failed to create sub-category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const closeCategoryModal = () => {
    if (categoryLoading) return;
    setShowCategoryModal(false);
    setCategoryForm({ ...EMPTY_CATEGORY_FORM });
  };

  const closeSubCategoryModal = () => {
    if (categoryLoading) return;
    setShowSubCategoryModal(false);
    setSubCategoryForm({ ...EMPTY_SUB_CATEGORY_FORM });
  };

  return {
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
    setProductCategories,
  };
}
