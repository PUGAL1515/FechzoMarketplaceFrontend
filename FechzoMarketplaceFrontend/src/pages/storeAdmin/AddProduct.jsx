import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  FolderPlus,
  Tags,
  ImagePlus,
  Package,
  Save,
} from "lucide-react";

const API = "http://localhost:5000";

export default function AddProduct({
  editProduct = null,
  onBack,
  onSuccess,
}) {
  const storeId = localStorage.getItem("storeId");

  /*
   * =========================================================
   * STATES
   * =========================================================
   */

  const [categories, setCategories] = useState([]);

  const [productCategories, setProductCategories] =
    useState([]);

  const [loading, setLoading] = useState(false);

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [highlight, setHighlight] = useState("");

  const [attributeKey, setAttributeKey] =
    useState("");

  const [attributeValue, setAttributeValue] =
    useState("");

  /*
   * =========================================================
   * MODALS
   * =========================================================
   */

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showSubCategoryModal, setShowSubCategoryModal] =
    useState(false);

  /*
   * =========================================================
   * CATEGORY FORM
   * =========================================================
   */

  const [categoryForm, setCategoryForm] =
    useState({
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
      sortOrder: 0,
    });

  /*
   * =========================================================
   * SUB CATEGORY FORM
   * =========================================================
   */

  const [subCategoryForm, setSubCategoryForm] =
    useState({
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
      sortOrder: 0,
    });

  /*
   * =========================================================
   * PRODUCT FORM
   * =========================================================
   */

  const [form, setForm] = useState({
    productId: "",
    storeId: storeId || "",
    branchId: "",

    mainCategory: "",
    productCategory: "",

    name: "",
    description: "",
    brand: "",

    images: [],

    price: "",
    discountPrice: "",
    stock: "",

    unit: "piece",
    sku: "",

    highlights: [],

    attributes: {},

    deliveryInfo: "Free Delivery",

    returnPolicy: "7 Days Replacement",

    isAvailable: true,

    isActive: true,
  });

  /*
   * =========================================================
   * LOAD EDIT PRODUCT
   * =========================================================
   */

  useEffect(() => {
    if (!editProduct) {
      return;
    }

    const mainCategory =
      editProduct.mainCategory?._id ||
      editProduct.mainCategory ||
      "";

    const productCategory =
      editProduct.productCategory?._id ||
      editProduct.productCategory ||
      "";

    setForm({
      productId:
        editProduct.productId || "",

      storeId:
        editProduct.storeId?._id ||
        editProduct.storeId ||
        storeId ||
        "",

      branchId:
        editProduct.branchId?._id ||
        editProduct.branchId ||
        "",

      mainCategory,

      productCategory,

      name:
        editProduct.name || "",

      description:
        editProduct.description || "",

      brand:
        editProduct.brand || "",

      images:
        Array.isArray(editProduct.images)
          ? editProduct.images
          : [],

      price:
        editProduct.price ?? "",

      discountPrice:
        editProduct.discountPrice ?? "",

      stock:
        editProduct.stock ?? "",

      unit:
        editProduct.unit || "piece",

      sku:
        editProduct.sku || "",

      highlights:
        Array.isArray(editProduct.highlights)
          ? editProduct.highlights
          : [],

      attributes:
        editProduct.attributes || {},

      deliveryInfo:
        editProduct.deliveryInfo ||
        "Free Delivery",

      returnPolicy:
        editProduct.returnPolicy ||
        "7 Days Replacement",

      isAvailable:
        editProduct.isAvailable !== false,

      isActive:
        editProduct.isActive !== false,
    });

    if (mainCategory) {
      fetchProductCategories(
        mainCategory
      );
    }
  }, [editProduct]);

  /*
   * =========================================================
   * FETCH CATEGORIES
   * =========================================================
   */

  useEffect(() => {
    fetchCategories();
  }, []);

  /*
   * =========================================================
   * FETCH MAIN CATEGORIES
   * =========================================================
   */

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API}/api/categories`
      );

      setCategories(
        response.data.categories || []
      );
    } catch (error) {
      console.error(
        "Categories fetch failed:",
        error
      );

      setCategories([]);
    }
  };

  /*
   * =========================================================
   * FETCH SUB CATEGORIES
   * =========================================================
   */

  const fetchProductCategories = async (
    categoryId
  ) => {
    if (!categoryId) {
      setProductCategories([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/api/categories/product-categories`,
        {
          params: {
            categoryId,
          },
        }
      );

      setProductCategories(
        response.data.categories || []
      );
    } catch (error) {
      console.error(
        "Product categories fetch failed:",
        error
      );

      setProductCategories([]);
    }
  };

  /*
   * =========================================================
   * FIELD UPDATE
   * =========================================================
   */

  const updateField = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * =========================================================
   * CATEGORY CHANGE
   * =========================================================
   */

  const handleMainCategoryChange =
    async (categoryId) => {
      setForm((prev) => ({
        ...prev,
        mainCategory: categoryId,
        productCategory: "",
      }));

      setProductCategories([]);

      if (categoryId) {
        await fetchProductCategories(
          categoryId
        );
      }
    };

  /*
   * =========================================================
   * IMAGE UPLOAD
   * =========================================================
   */

  const handleImageUpload = async (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file"
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 5MB"
      );

      e.target.value = "";

      return;
    }

    try {
      setUploadingImage(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      const response =
        await axios.post(
          `${API}/api/upload`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const uploadedImage =
        response.data?.imageUrl;

      if (!uploadedImage) {
        throw new Error(
          "Image URL not returned"
        );
      }

      setForm((prev) => ({
        ...prev,

        images: [
          ...prev.images,
          uploadedImage,
        ],
      }));
    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to upload image"
      );
    } finally {
      setUploadingImage(false);

      e.target.value = "";
    }
  };

  /*
   * =========================================================
   * REMOVE IMAGE
   * =========================================================
   */

  const removeImage = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,

      images:
        prev.images.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /*
   * =========================================================
   * HIGHLIGHTS
   * =========================================================
   */

  const addHighlight = () => {
    const value =
      highlight.trim();

    if (!value) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      highlights: [
        ...prev.highlights,
        value,
      ],
    }));

    setHighlight("");
  };

  const removeHighlight = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,

      highlights:
        prev.highlights.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /*
   * =========================================================
   * ATTRIBUTES
   * =========================================================
   */

  const addAttribute = () => {
    const key =
      attributeKey.trim();

    const value =
      attributeValue.trim();

    if (!key || !value) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      attributes: {
        ...prev.attributes,

        [key]: value,
      },
    }));

    setAttributeKey("");

    setAttributeValue("");
  };

  const removeAttribute = (
    key
  ) => {
    setForm((prev) => {
      const updated = {
        ...prev.attributes,
      };

      delete updated[key];

      return {
        ...prev,
        attributes: updated,
      };
    });
  };

  /*
   * =========================================================
   * SLUG
   * =========================================================
   */

  const generateSlug = (
    value
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");
  };

  /*
   * =========================================================
   * CATEGORY FORM UPDATE
   * =========================================================
   */

  const updateCategoryForm = (
    field,
    value
  ) => {
    setCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSubCategoryForm = (
    field,
    value
  ) => {
    setSubCategoryForm(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );
  };

  /*
   * =========================================================
   * CATEGORY NAME
   * =========================================================
   */

  const handleCategoryNameChange =
    (value) => {
      setCategoryForm((prev) => ({
        ...prev,

        name: value,

        slug:
          generateSlug(value),
      }));
    };

  const handleSubCategoryNameChange =
    (value) => {
      setSubCategoryForm(
        (prev) => ({
          ...prev,

          name: value,

          slug:
            generateSlug(value),
        })
      );
    };

  /*
   * =========================================================
   * CREATE MAIN CATEGORY
   * =========================================================
   */

  const createMainCategory =
    async (e) => {
      e.preventDefault();

      if (
        !categoryForm.categoryId ||
        !categoryForm.name ||
        !categoryForm.slug
      ) {
        alert(
          "Category ID, name and slug are required"
        );

        return;
      }

      try {
        setCategoryLoading(true);

        const response =
          await axios.post(
            `${API}/api/categories`,
            {
              categoryId:
                categoryForm.categoryId
                  .trim()
                  .toUpperCase(),

              name:
                categoryForm.name.trim(),

              slug:
                categoryForm.slug.trim(),

              description:
                categoryForm.description.trim(),

              icon:
                categoryForm.icon.trim(),

              image:
                categoryForm.image.trim(),

              parentCategory:
                null,

              isActive:
                true,

              sortOrder:
                Number(
                  categoryForm.sortOrder
                ) || 0,
            }
          );

        const newCategory =
          response.data?.category;

        alert(
          "Main category created successfully"
        );

        await fetchCategories();

        if (newCategory?._id) {
          setForm((prev) => ({
            ...prev,

            mainCategory:
              newCategory._id,

            productCategory:
              "",
          }));

          setProductCategories([]);
        }

        setCategoryForm({
          categoryId: "",
          name: "",
          slug: "",
          description: "",
          icon: "",
          image: "",
          sortOrder: 0,
        });

        setShowCategoryModal(false);
      } catch (error) {
        console.error(
          "Create category error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Failed to create category"
        );
      } finally {
        setCategoryLoading(false);
      }
    };

  /*
   * =========================================================
   * CREATE SUB CATEGORY
   * =========================================================
   */

  const createSubCategory =
    async (e) => {
      e.preventDefault();

      if (!form.mainCategory) {
        alert(
          "Please select a main category first"
        );

        return;
      }

      if (
        !subCategoryForm.categoryId ||
        !subCategoryForm.name ||
        !subCategoryForm.slug
      ) {
        alert(
          "Sub-category ID, name and slug are required"
        );

        return;
      }

      try {
        setCategoryLoading(true);

        const response =
          await axios.post(
            `${API}/api/categories`,
            {
              categoryId:
                subCategoryForm.categoryId
                  .trim()
                  .toUpperCase(),

              name:
                subCategoryForm.name.trim(),

              slug:
                subCategoryForm.slug.trim(),

              description:
                subCategoryForm.description.trim(),

              icon:
                subCategoryForm.icon.trim(),

              image:
                subCategoryForm.image.trim(),

              parentCategory:
                form.mainCategory,

              isActive:
                true,

              sortOrder:
                Number(
                  subCategoryForm.sortOrder
                ) || 0,
            }
          );

        const newSubCategory =
          response.data?.category;

        alert(
          "Sub-category created successfully"
        );

        await fetchProductCategories(
          form.mainCategory
        );

        if (
          newSubCategory?._id
        ) {
          setForm((prev) => ({
            ...prev,

            productCategory:
              newSubCategory._id,
          }));
        }

        setSubCategoryForm({
          categoryId: "",
          name: "",
          slug: "",
          description: "",
          icon: "",
          image: "",
          sortOrder: 0,
        });

        setShowSubCategoryModal(
          false
        );
      } catch (error) {
        console.error(
          "Create sub-category error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Failed to create sub-category"
        );
      } finally {
        setCategoryLoading(false);
      }
    };

  /*
   * =========================================================
   * PRODUCT SUBMIT
   * =========================================================
   */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    /*
     * VALIDATION
     */

    if (!form.productId.trim()) {
      alert(
        "Product ID is required"
      );

      return;
    }

    if (!form.mainCategory) {
      alert(
        "Please select main category"
      );

      return;
    }

    if (!form.productCategory) {
      alert(
        "Please select product category"
      );

      return;
    }

    if (!form.name.trim()) {
      alert(
        "Product name is required"
      );

      return;
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      alert(
        "Please enter a valid product price"
      );

      return;
    }

    if (
      form.discountPrice &&
      Number(form.discountPrice) >=
        Number(form.price)
    ) {
      alert(
        "Selling price must be less than MRP / Price"
      );

      return;
    }

    if (
      Number(form.stock) < 0
    ) {
      alert(
        "Stock cannot be negative"
      );

      return;
    }

    if (
      form.images.length === 0
    ) {
      alert(
        "Please upload at least one product image"
      );

      return;
    }

    /*
     * PAYLOAD
     */

    const payload = {
      ...form,

      storeId:
        form.storeId ||
        storeId,

      price:
        Number(form.price),

      discountPrice:
        Number(
          form.discountPrice
        ) || 0,

      stock:
        Number(form.stock) || 0,

      branchId:
        form.branchId ||
        null,
    };

    try {
      setLoading(true);

      if (editProduct) {
        await axios.put(
          `${API}/api/products/${editProduct._id}`,
          payload
        );
      } else {
        await axios.post(
          `${API}/api/products`,
          payload
        );
      }

      alert(
        editProduct
          ? "Product updated successfully"
          : "Product created successfully"
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * RESET CATEGORY MODAL
   * =========================================================
   */

  const closeCategoryModal =
    () => {
      if (categoryLoading) {
        return;
      }

      setShowCategoryModal(
        false
      );
    };

  const closeSubCategoryModal =
    () => {
      if (categoryLoading) {
        return;
      }

      setShowSubCategoryModal(
        false
      );
    };

  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center gap-4 mb-6">

        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-xl hover:bg-gray-200 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div>

          <div className="flex items-center gap-2">

            <Package
              size={22}
              className="text-blue-600"
            />

            <h1 className="text-2xl font-bold text-gray-900">
              {editProduct
                ? "Edit Product"
                : "Add New Product"}
            </h1>

          </div>

          <p className="text-sm text-gray-500 mt-1">
            Add complete product information for your marketplace store.
          </p>

        </div>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Basic Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter the basic product details.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* PRODUCT ID */}

            <div>

              <label className="label">
                Product ID
              </label>

              <input
                value={
                  form.productId
                }
                onChange={(e) =>
                  updateField(
                    "productId",
                    e.target.value
                  )
                }
                disabled={!!editProduct}
                placeholder="GRC-RICE-0001"
                className="input disabled:bg-gray-100"
                required
              />

            </div>

            {/* SKU */}

            <div>

              <label className="label">
                SKU
              </label>

              <input
                value={form.sku}
                onChange={(e) =>
                  updateField(
                    "sku",
                    e.target.value
                  )
                }
                placeholder="RICE-5KG-001"
                className="input"
              />

            </div>

          </div>

          {/* NAME */}

          <div className="mt-5">

            <label className="label">
              Product Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              placeholder="India Gate Basmati Rice 5kg"
              className="input"
              required
            />

          </div>

          {/* BRAND / UNIT */}

          <div className="grid md:grid-cols-2 gap-5 mt-5">

            <div>

              <label className="label">
                Brand
              </label>

              <input
                value={form.brand}
                onChange={(e) =>
                  updateField(
                    "brand",
                    e.target.value
                  )
                }
                placeholder="India Gate"
                className="input"
              />

            </div>

            <div>

              <label className="label">
                Unit
              </label>

              <select
                value={form.unit}
                onChange={(e) =>
                  updateField(
                    "unit",
                    e.target.value
                  )
                }
                className="input"
              >

                <option value="piece">
                  Piece
                </option>

                <option value="kg">
                  Kg
                </option>

                <option value="gram">
                  Gram
                </option>

                <option value="liter">
                  Liter
                </option>

                <option value="pack">
                  Pack
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* ===================================================
            CATEGORY
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Category
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Select the marketplace category for this product.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowCategoryModal(
                  true
                )
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >

              <FolderPlus
                size={18}
              />

              Add Category

            </button>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* MAIN CATEGORY */}

            <div>

              <label className="label">
                Main Category
              </label>

              <select
                value={
                  form.mainCategory
                }
                onChange={(e) =>
                  handleMainCategoryChange(
                    e.target.value
                  )
                }
                className="input"
              >

                <option value="">
                  Select Main Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

              {categories.length ===
                0 && (
                <p className="text-xs text-red-500 mt-2">
                  No main categories available. Click "Add Category".
                </p>
              )}

            </div>

            {/* SUB CATEGORY */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label className="label !mb-0">
                  Product / Sub Category
                </label>

                <button
                  type="button"
                  disabled={
                    !form.mainCategory
                  }
                  onClick={() =>
                    setShowSubCategoryModal(
                      true
                    )
                  }
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    form.mainCategory
                      ? "text-blue-600 hover:text-blue-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >

                  <Plus size={16} />

                  Add Sub Category

                </button>

              </div>

              <select
                value={
                  form.productCategory
                }
                onChange={(e) =>
                  updateField(
                    "productCategory",
                    e.target.value
                  )
                }
                disabled={
                  !form.mainCategory
                }
                className="input disabled:bg-gray-100 disabled:cursor-not-allowed"
              >

                <option value="">
                  {!form.mainCategory
                    ? "Select main category first"
                    : "Select Product Category"}
                </option>

                {productCategories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

              {form.mainCategory &&
                productCategories.length ===
                  0 && (
                  <p className="text-xs text-orange-500 mt-2">
                    No sub-categories found. Click "Add Sub Category".
                  </p>
                )}

            </div>

          </div>

        </section>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Description
          </h2>

          <textarea
            rows={6}
            value={
              form.description
            }
            onChange={(e) =>
              updateField(
                "description",
                e.target.value
              )
            }
            placeholder="Enter detailed product description..."
            className="input resize-none"
          />

        </section>

        {/* ===================================================
            PRICING
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Pricing & Stock
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">

            {/* MRP */}

            <div>

              <label className="label">
                MRP / Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  updateField(
                    "price",
                    e.target.value
                  )
                }
                className="input"
                placeholder="799"
                required
              />

            </div>

            {/* SELLING PRICE */}

            <div>

              <label className="label">
                Selling Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.discountPrice
                }
                onChange={(e) =>
                  updateField(
                    "discountPrice",
                    e.target.value
                  )
                }
                className="input"
                placeholder="699"
              />

            </div>

            {/* STOCK */}

            <div>

              <label className="label">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  updateField(
                    "stock",
                    e.target.value
                  )
                }
                className="input"
                placeholder="25"
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            PRODUCT IMAGES
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-gray-900">
              Product Images
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Upload product images from your computer.
            </p>

          </div>

          {/* UPLOAD */}

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">

            <ImagePlus
              size={40}
              className="mx-auto text-gray-400 mb-3"
            />

            <p className="text-sm font-medium text-gray-700">
              Upload Product Image
            </p>

            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, JPEG, WEBP up to 5MB
            </p>

            <label className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">

              <Plus size={18} />

              {uploadingImage
                ? "Uploading..."
                : "Choose Image"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={
                  handleImageUpload
                }
                disabled={
                  uploadingImage
                }
                className="hidden"
              />

            </label>

          </div>

          {/* PREVIEW */}

          {form.images.length >
          0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">

              {form.images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative border rounded-xl p-2 bg-gray-50 group"
                  >

                    <img
                      src={image}
                      alt={`Product ${
                        index + 1
                      }`}
                      className="w-full h-32 object-contain rounded-lg"
                    />

                    {index ===
                      0 && (
                      <span className="absolute left-2 bottom-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded">
                        Main Image
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow"
                    >

                      <Trash2
                        size={13}
                      />

                    </button>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 mt-5">
              No images uploaded yet
            </p>
          )}

        </section>

        {/* ===================================================
            HIGHLIGHTS
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900">
            Product Highlights
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Add important selling points of the product.
          </p>

          <div className="flex gap-3 mt-5">

            <input
              value={highlight}
              onChange={(e) =>
                setHighlight(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  e.preventDefault();
                  addHighlight();
                }
              }}
              placeholder="Premium Quality"
              className="input"
            />

            <button
              type="button"
              onClick={
                addHighlight
              }
              className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus />
            </button>

          </div>

          <div className="mt-4 space-y-2">

            {form.highlights.map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center justify-between border rounded-lg px-4 py-3"
                >

                  <span className="text-sm">
                    ✓ {item}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeHighlight(
                        index
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2
                      size={17}
                    />
                  </button>

                </div>
              )
            )}

          </div>

        </section>

        {/* ===================================================
            SPECIFICATIONS
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900">
            Specifications
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Add product specifications such as weight, color, size, etc.
          </p>

          <div className="grid md:grid-cols-2 gap-3 mt-5">

            <input
              value={attributeKey}
              onChange={(e) =>
                setAttributeKey(
                  e.target.value
                )
              }
              placeholder="Specification - Weight"
              className="input"
            />

            <div className="flex gap-2">

              <input
                value={
                  attributeValue
                }
                onChange={(e) =>
                  setAttributeValue(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    e.preventDefault();
                    addAttribute();
                  }
                }}
                placeholder="Value - 5 KG"
                className="input"
              />

              <button
                type="button"
                onClick={
                  addAttribute
                }
                className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus />
              </button>

            </div>

          </div>

          {Object.keys(
            form.attributes
          ).length > 0 && (
            <div className="mt-5 border rounded-lg overflow-hidden">

              {Object.entries(
                form.attributes
              ).map(
                ([
                  key,
                  value,
                ]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b last:border-b-0 px-4 py-3"
                  >

                    <span className="font-medium text-gray-700">
                      {key}
                    </span>

                    <span className="flex items-center gap-5 text-gray-600">

                      {value}

                      <button
                        type="button"
                        onClick={() =>
                          removeAttribute(
                            key
                          )
                        }
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            DELIVERY
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Delivery & Returns
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="label">
                Delivery Information
              </label>

              <input
                value={
                  form.deliveryInfo
                }
                onChange={(e) =>
                  updateField(
                    "deliveryInfo",
                    e.target.value
                  )
                }
                className="input"
                placeholder="Free Delivery"
              />

            </div>

            <div>

              <label className="label">
                Return Policy
              </label>

              <input
                value={
                  form.returnPolicy
                }
                onChange={(e) =>
                  updateField(
                    "returnPolicy",
                    e.target.value
                  )
                }
                className="input"
                placeholder="7 Days Replacement"
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            STATUS
        =================================================== */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Product Status
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">

            <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50">

              <input
                type="checkbox"
                checked={
                  form.isAvailable
                }
                onChange={(e) =>
                  updateField(
                    "isAvailable",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />

              <div>

                <p className="font-semibold text-gray-800">
                  Available
                </p>

                <p className="text-xs text-gray-500">
                  Product can be purchased by customers.
                </p>

              </div>

            </label>

            <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50">

              <input
                type="checkbox"
                checked={
                  form.isActive
                }
                onChange={(e) =>
                  updateField(
                    "isActive",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />

              <div>

                <p className="font-semibold text-gray-800">
                  Active
                </p>

                <p className="text-xs text-gray-500">
                  Product is active in your store.
                </p>

              </div>

            </label>

          </div>

        </section>

        {/* ===================================================
            ACTION BUTTONS
        =================================================== */}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pb-10">

          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              uploadingImage
            }
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save size={18} />

                {editProduct
                  ? "Update Product"
                  : "Create Product"}
              </>
            )}

          </button>

        </div>

      </form>

      {/* =====================================================
          MAIN CATEGORY MODAL
      ===================================================== */}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div className="flex items-center gap-2">

                <FolderPlus
                  className="text-blue-600"
                />

                <div>

                  <h2 className="text-lg font-bold">
                    Add Main Category
                  </h2>

                  <p className="text-xs text-gray-500">
                    Create a marketplace category
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeCategoryModal
                }
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                createMainCategory
              }
              className="p-6 space-y-4"
            >

              {/* CATEGORY ID */}

              <div>

                <label className="label">
                  Category ID
                </label>

                <input
                  value={
                    categoryForm.categoryId
                  }
                  onChange={(e) =>
                    updateCategoryForm(
                      "categoryId",
                      e.target.value
                    )
                  }
                  placeholder="GROCERY"
                  className="input"
                  required
                />

              </div>

              {/* NAME */}

              <div>

                <label className="label">
                  Category Name
                </label>

                <input
                  value={
                    categoryForm.name
                  }
                  onChange={(e) =>
                    handleCategoryNameChange(
                      e.target.value
                    )
                  }
                  placeholder="Grocery"
                  className="input"
                  required
                />

              </div>

              {/* SLUG */}

              <div>

                <label className="label">
                  Slug
                </label>

                <input
                  value={
                    categoryForm.slug
                  }
                  onChange={(e) =>
                    updateCategoryForm(
                      "slug",
                      e.target.value
                    )
                  }
                  placeholder="grocery"
                  className="input"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="label">
                  Description
                </label>

                <textarea
                  value={
                    categoryForm.description
                  }
                  onChange={(e) =>
                    updateCategoryForm(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Grocery products"
                  className="input resize-none"
                  rows={3}
                />

              </div>

              {/* IMAGE */}

              <div>

                <label className="label">
                  Image URL
                </label>

                <input
                  value={
                    categoryForm.image
                  }
                  onChange={(e) =>
                    updateCategoryForm(
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className="input"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={
                    closeCategoryModal
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    categoryLoading
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {categoryLoading
                    ? "Creating..."
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          SUB CATEGORY MODAL
      ===================================================== */}

      {showSubCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div className="flex items-center gap-2">

                <Tags
                  className="text-blue-600"
                />

                <div>

                  <h2 className="text-lg font-bold">
                    Add Sub Category
                  </h2>

                  <p className="text-xs text-gray-500">
                    Under:{" "}
                    <span className="font-semibold">
                      {
                        categories.find(
                          (c) =>
                            c._id ===
                            form.mainCategory
                        )?.name
                      }
                    </span>
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeSubCategoryModal
                }
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                createSubCategory
              }
              className="p-6 space-y-4"
            >

              {/* ID */}

              <div>

                <label className="label">
                  Sub Category ID
                </label>

                <input
                  value={
                    subCategoryForm.categoryId
                  }
                  onChange={(e) =>
                    updateSubCategoryForm(
                      "categoryId",
                      e.target.value
                    )
                  }
                  placeholder="GROCERY-RICE"
                  className="input"
                  required
                />

              </div>

              {/* NAME */}

              <div>

                <label className="label">
                  Sub Category Name
                </label>

                <input
                  value={
                    subCategoryForm.name
                  }
                  onChange={(e) =>
                    handleSubCategoryNameChange(
                      e.target.value
                    )
                  }
                  placeholder="Rice & Grains"
                  className="input"
                  required
                />

              </div>

              {/* SLUG */}

              <div>

                <label className="label">
                  Slug
                </label>

                <input
                  value={
                    subCategoryForm.slug
                  }
                  onChange={(e) =>
                    updateSubCategoryForm(
                      "slug",
                      e.target.value
                    )
                  }
                  placeholder="rice-grains"
                  className="input"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="label">
                  Description
                </label>

                <textarea
                  value={
                    subCategoryForm.description
                  }
                  onChange={(e) =>
                    updateSubCategoryForm(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Rice and grain products"
                  className="input resize-none"
                  rows={3}
                />

              </div>

              {/* IMAGE */}

              <div>

                <label className="label">
                  Image URL
                </label>

                <input
                  value={
                    subCategoryForm.image
                  }
                  onChange={(e) =>
                    updateSubCategoryForm(
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className="input"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={
                    closeSubCategoryModal
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    categoryLoading
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {categoryLoading
                    ? "Creating..."
                    : "Create Sub Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          LOCAL STYLES
      ===================================================== */}

      <style>{`
        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 13px;
          outline: none;
          background: white;
          color: #111827;
          transition: all 0.2s ease;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.10);
        }

        .input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>

    </div>
  );
}