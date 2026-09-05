import React, { useEffect, useMemo, useState } from "react";
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

const EMPTY_VARIANT = {
  sku: "",
  attributes: {},
  price: "",
  mrp: "",
  stock: "",
};

const EMPTY_CATEGORY_FORM = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  icon: "",
  image: "",
  sortOrder: 0,
};

const EMPTY_SUB_CATEGORY_FORM = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  icon: "",
  image: "",
  sortOrder: 0,
};

export default function AddProduct({
  editProduct = null,
  onBack,
  onSuccess,
}) {
  const storeId = localStorage.getItem("storeId") || "";

  const storedStore = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("store") || "null");
    } catch {
      return null;
    }
  }, []);

  const storeType =
    storedStore?.storeType ||
    localStorage.getItem("storeType") ||
    "";

  /* =========================================================
     STATES
  ========================================================= */

  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [highlight, setHighlight] = useState("");

  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] =
    useState(false);

  const [categoryForm, setCategoryForm] = useState({
    ...EMPTY_CATEGORY_FORM,
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    ...EMPTY_SUB_CATEGORY_FORM,
  });

  const [form, setForm] = useState({
    productId: "",

    storeId,
    storeType,

    categoryId: "",
    subcategoryId: "",

    name: "",
    slug: "",

    brand: "",

    description: "",
    shortDescription: "",

    images: [],
    thumbnail: "",

    unitType: "count",
    unit: "piece",

    highlights: [],

    specifications: {},

    variants: [
      {
        ...EMPTY_VARIANT,
        attributes: {},
      },
    ],

    status: "approved",
    isActive: true,
    isDeleted: false,
  });

  const normalizedStoreType = String(
    form.storeType || storeType || ""
  )
    .toLowerCase()
    .trim();

  /* =========================================================
     ID HELPERS
  ========================================================= */

  const getObjectId = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "object") {
      return String(
        value._id ||
          value.id ||
          value.$oid ||
          ""
      ).trim();
    }

    return "";
  };

  const getCategoryMongoId = (category) => {
    if (!category) return "";

    return getObjectId(
      category._id ||
        category.id ||
        category.categoryId
    );
  };

  const getCategoryName = (category) => {
    return (
      category?.name ||
      category?.categoryName ||
      category?.title ||
      ""
    );
  };

  const extractCategoryArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    const result =
      data?.categories ||
      data?.productCategories ||
      data?.data ||
      [];

    return Array.isArray(result) ? result : [];
  };

  /* =========================================================
     SLUG
  ========================================================= */

  const generateSlug = (value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

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

    console.log("EDIT MAIN CATEGORY:", categoryId);
    console.log("EDIT SUB CATEGORY:", subcategoryId);

    const loadedVariants =
      Array.isArray(editProduct.variants) &&
      editProduct.variants.length > 0
        ? editProduct.variants.map((variant) => ({
            sku: variant?.sku || "",
            attributes:
              variant?.attributes &&
              typeof variant.attributes === "object"
                ? variant.attributes
                : {},
            price: variant?.price ?? "",
            mrp: variant?.mrp ?? "",
            stock: variant?.stock ?? "",
          }))
        : [
            {
              ...EMPTY_VARIANT,
              attributes: {},
            },
          ];

    setForm({
      productId:
        editProduct.productId ||
        editProduct._id ||
        "",

      storeId:
        getObjectId(editProduct.storeId) ||
        storeId,

      storeType:
        editProduct.storeType ||
        editProduct.productType ||
        editProduct.storeId?.storeType ||
        storeType,

      categoryId,
      subcategoryId,

      name: editProduct.name || "",

      slug:
        editProduct.slug ||
        generateSlug(editProduct.name || ""),

      brand: editProduct.brand || "",

      description:
        editProduct.description || "",

      shortDescription:
        editProduct.shortDescription || "",

      images:
        Array.isArray(editProduct.images)
          ? editProduct.images
          : [],

      thumbnail:
        editProduct.thumbnail ||
        editProduct.images?.[0] ||
        "",

      unitType:
        editProduct.unitType ||
        "count",

      unit:
        editProduct.unit ||
        "piece",

      highlights:
        Array.isArray(editProduct.highlights)
          ? editProduct.highlights
          : [],

      specifications:
        editProduct.specifications &&
        typeof editProduct.specifications === "object"
          ? editProduct.specifications
          : {},

      variants: loadedVariants,

      status:
        editProduct.status ||
        "approved",

      isActive:
        editProduct.isActive !== false,

      isDeleted:
        editProduct.isDeleted === true,
    });

    if (categoryId) {
      fetchProductCategories(categoryId);
    }
  }, [editProduct]);

  /* =========================================================
     FETCH MAIN CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const response = await axios.get(
        `${API}/api/categories`
      );

      console.log(
        "MAIN CATEGORIES RESPONSE:",
        response.data
      );

      const fetchedCategories =
        extractCategoryArray(response.data);

      const mainCategories =
        fetchedCategories.filter((category) => {
          const parent =
            category?.parentCategory;

          return (
            parent === null ||
            parent === undefined ||
            parent === ""
          );
        });

      setCategories(
        mainCategories.length > 0
          ? mainCategories
          : fetchedCategories
      );
    } catch (error) {
      console.error(
        "Categories fetch failed:",
        error
      );

      console.error(
        "CATEGORY SERVER RESPONSE:",
        error.response?.data
      );

      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  /* =========================================================
     FETCH SUB CATEGORIES
  ========================================================= */

  const fetchProductCategories = async (
    categoryId
  ) => {
    const selectedId =
      getObjectId(categoryId);

    if (!selectedId) {
      setProductCategories([]);
      return;
    }

    try {
      setCategoryLoading(true);

      console.log(
        "FETCH SUB CATEGORIES FOR:",
        selectedId
      );

      const response = await axios.get(
        `${API}/api/categories/product-categories`,
        {
          params: {
            categoryId: selectedId,
          },
        }
      );

      console.log(
        "SUB CATEGORIES RESPONSE:",
        response.data
      );

      const fetched =
        extractCategoryArray(response.data);

      setProductCategories(fetched);
    } catch (error) {
      console.error(
        "Product categories fetch failed:",
        error
      );

      console.error(
        "SUB CATEGORY SERVER RESPONSE:",
        error.response?.data
      );

      setProductCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  /* =========================================================
     FIELD UPDATE
  ========================================================= */

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     MAIN CATEGORY CHANGE
  ========================================================= */

  const handleMainCategoryChange =
    async (categoryId) => {
      const selectedId =
        getObjectId(categoryId);

      console.log(
        "================================"
      );

      console.log(
        "MAIN CATEGORY SELECTED:",
        selectedId
      );

      setForm((prev) => ({
        ...prev,
        categoryId: selectedId,
        subcategoryId: "",
      }));

      setProductCategories([]);

      if (!selectedId) return;

      await fetchProductCategories(
        selectedId
      );
    };

  /* =========================================================
     NAME CHANGE
  ========================================================= */

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,

      slug:
        !editProduct ||
        !prev.slug ||
        prev.slug ===
          generateSlug(prev.name)
          ? generateSlug(value)
          : prev.slug,
    }));
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please select an image file"
      );
      e.target.value = "";
      return;
    }

    if (
      file.size > 5 * 1024 * 1024
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
        response.data?.imageUrl ||
        response.data?.url ||
        response.data?.secure_url;

      if (!uploadedImage) {
        throw new Error(
          "Image URL not returned"
        );
      }

      setForm((prev) => {
        const updatedImages = [
          ...prev.images,
          uploadedImage,
        ];

        return {
          ...prev,
          images: updatedImages,
          thumbnail:
            prev.thumbnail ||
            uploadedImage,
        };
      });
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

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (index) => {
    setForm((prev) => {
      const removed =
        prev.images[index];

      const updated =
        prev.images.filter(
          (_, i) => i !== index
        );

      return {
        ...prev,

        images: updated,

        thumbnail:
          prev.thumbnail === removed
            ? updated[0] || ""
            : prev.thumbnail,
      };
    });
  };

  /* =========================================================
     THUMBNAIL
  ========================================================= */

  const setThumbnail = (image) => {
    setForm((prev) => ({
      ...prev,
      thumbnail: image,
    }));
  };

  /* =========================================================
     HIGHLIGHTS
  ========================================================= */

  const addHighlight = () => {
    const value =
      highlight.trim();

    if (!value) return;

    setForm((prev) => ({
      ...prev,

      highlights: [
        ...prev.highlights,
        value,
      ],
    }));

    setHighlight("");
  };

  const removeHighlight = (index) => {
    setForm((prev) => ({
      ...prev,

      highlights:
        prev.highlights.filter(
          (_, i) => i !== index
        ),
    }));
  };

  /* =========================================================
     SPECIFICATIONS
  ========================================================= */

  const addSpecification = () => {
    const key =
      attributeKey.trim();

    const value =
      attributeValue.trim();

    if (!key || !value) {
      alert(
        "Enter specification name and value"
      );
      return;
    }

    setForm((prev) => ({
      ...prev,

      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));

    setAttributeKey("");
    setAttributeValue("");
  };

  const removeSpecification = (key) => {
    setForm((prev) => {
      const updated = {
        ...prev.specifications,
      };

      delete updated[key];

      return {
        ...prev,
        specifications: updated,
      };
    });
  };

  /* =========================================================
     VARIANTS
  ========================================================= */

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,

      variants: [
        ...prev.variants,

        {
          ...EMPTY_VARIANT,
          attributes: {},
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((prev) => {
      if (
        prev.variants.length === 1
      ) {
        return prev;
      }

      return {
        ...prev,

        variants:
          prev.variants.filter(
            (_, i) => i !== index
          ),
      };
    });
  };

  const updateVariant = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (variant, i) =>
            i === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        ),
    }));
  };

  const updateVariantAttribute =
    (
      variantIndex,
      key,
      value
    ) => {
      setForm((prev) => ({
        ...prev,

        variants:
          prev.variants.map(
            (variant, index) => {
              if (
                index !==
                variantIndex
              ) {
                return variant;
              }

              return {
                ...variant,

                attributes: {
                  ...variant.attributes,
                  [key]: value,
                },
              };
            }
          ),
      }));
    };

  const removeVariantAttribute =
    (
      variantIndex,
      key
    ) => {
      setForm((prev) => ({
        ...prev,

        variants:
          prev.variants.map(
            (variant, index) => {
              if (
                index !==
                variantIndex
              ) {
                return variant;
              }

              const updated = {
                ...variant.attributes,
              };

              delete updated[key];

              return {
                ...variant,
                attributes: updated,
              };
            }
          ),
      }));
    };

  /* =========================================================
     CATEGORY FORM
  ========================================================= */

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

  const handleCategoryNameChange =
    (value) => {
      setCategoryForm(
        (prev) => ({
          ...prev,
          name: value,
          slug:
            generateSlug(value),
        })
      );
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

  /* =========================================================
     CREATE MAIN CATEGORY
  ========================================================= */

  const createMainCategory =
    async (e) => {
      e.preventDefault();

      if (
        !categoryForm.categoryId.trim() ||
        !categoryForm.name.trim() ||
        !categoryForm.slug.trim()
      ) {
        alert(
          "Category ID, name and slug are required"
        );
        return;
      }

      try {
        setCategoryLoading(true);

        const payload = {
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

          parentCategory: null,

          storeId:
            getObjectId(storeId),

          storeType:
            normalizedStoreType,

          isActive: true,

          sortOrder:
            Number(
              categoryForm.sortOrder
            ) || 0,
        };

        console.log(
          "CREATE MAIN CATEGORY:",
          payload
        );

        const response =
          await axios.post(
            `${API}/api/categories`,
            payload
          );

        console.log(
          "CREATE MAIN CATEGORY RESPONSE:",
          response.data
        );

        const newCategory =
          response.data?.category ||
          response.data?.data;

        await fetchCategories();

        const newCategoryId =
          getCategoryMongoId(
            newCategory
          );

        if (newCategoryId) {
          setForm((prev) => ({
            ...prev,

            categoryId:
              newCategoryId,

            subcategoryId: "",
          }));

          setProductCategories([]);
        }

        alert(
          "Main category created successfully"
        );

        setCategoryForm({
          ...EMPTY_CATEGORY_FORM,
        });

        setShowCategoryModal(false);
      } catch (error) {
        console.error(
          "Create category error:",
          error
        );

        console.error(
          "CATEGORY SERVER RESPONSE:",
          error.response?.data
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

  /* =========================================================
     CREATE SUB CATEGORY
  ========================================================= */

  const createSubCategory =
    async (e) => {
      e.preventDefault();

      const parentId =
        getObjectId(
          form.categoryId
        );

      if (!parentId) {
        alert(
          "Please select a main category first"
        );
        return;
      }

      if (
        !subCategoryForm.categoryId.trim() ||
        !subCategoryForm.name.trim() ||
        !subCategoryForm.slug.trim()
      ) {
        alert(
          "Sub-category ID, name and slug are required"
        );
        return;
      }

      try {
        setCategoryLoading(true);

        const payload = {
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
            parentId,

          storeId:
            getObjectId(storeId),

          storeType:
            normalizedStoreType,

          isActive: true,

          sortOrder:
            Number(
              subCategoryForm.sortOrder
            ) || 0,
        };

        console.log(
          "CREATE SUB CATEGORY PAYLOAD:",
          payload
        );

        const response =
          await axios.post(
            `${API}/api/categories`,
            payload
          );

        console.log(
          "CREATE SUB CATEGORY RESPONSE:",
          response.data
        );

        const newSubCategory =
          response.data?.category ||
          response.data?.data;

        await fetchProductCategories(
          parentId
        );

        const newSubCategoryId =
          getCategoryMongoId(
            newSubCategory
          );

        if (newSubCategoryId) {
          setForm((prev) => ({
            ...prev,

            categoryId:
              parentId,

            subcategoryId:
              newSubCategoryId,
          }));
        }

        alert(
          "Sub-category created successfully"
        );

        setSubCategoryForm({
          ...EMPTY_SUB_CATEGORY_FORM,
        });

        setShowSubCategoryModal(
          false
        );
      } catch (error) {
        console.error(
          "Create sub-category error:",
          error
        );

        console.error(
          "SUB CATEGORY SERVER RESPONSE:",
          error.response?.data
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

  /* =========================================================
     BUILD VARIANTS
  ========================================================= */

  const buildVariants = () => {
    return form.variants.map(
      (variant) => ({
        sku: String(
          variant.sku || ""
        ).trim(),

        attributes:
          variant.attributes || {},

        price:
          Number(
            variant.price
          ) || 0,

        mrp:
          Number(
            variant.mrp
          ) || 0,

        stock:
          Number(
            variant.stock
          ) || 0,
      })
    );
  };

  /* =========================================================
     GENERATE PRODUCT ID
  ========================================================= */

  const generateProductId = () => {
    const timestamp =
      Date.now()
        .toString(36)
        .toUpperCase();

    const random =
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    return `PROD-${timestamp}-${random}`;
  };

  /* =========================================================
     SUBMIT PRODUCT
  ========================================================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const selectedMainCategoryId =
        getObjectId(
          form.categoryId
        );

      const selectedSubCategoryId =
        getObjectId(
          form.subcategoryId
        );

      const finalStoreId =
        getObjectId(
          form.storeId
        ) ||
        getObjectId(storeId);

      const finalStoreType =
        String(
          form.storeType ||
            storeType ||
            ""
        )
          .toLowerCase()
          .trim();

      console.log(
        "=============================================="
      );

      console.log(
        "FINAL STORE ID:",
        finalStoreId
      );

      console.log(
        "FINAL STORE TYPE:",
        finalStoreType
      );

      console.log(
        "FINAL MAIN CATEGORY:",
        selectedMainCategoryId
      );

      console.log(
        "FINAL SUB CATEGORY:",
        selectedSubCategoryId
      );

      /* =====================================================
         BASIC VALIDATION
      ===================================================== */

      if (!form.name.trim()) {
        alert(
          "Product name is required"
        );
        return;
      }

      if (!finalStoreId) {
        alert(
          "Store ID not found. Please login again."
        );
        return;
      }

      if (!finalStoreType) {
        alert(
          "Store type not found. Please login again."
        );
        return;
      }

      if (!selectedMainCategoryId) {
        alert(
          "Please select main category"
        );
        return;
      }

      if (!selectedSubCategoryId) {
        alert(
          "Please select sub-category"
        );
        return;
      }

      if (
        !Array.isArray(form.images) ||
        form.images.length === 0
      ) {
        alert(
          "Please upload at least one product image"
        );
        return;
      }

      if (
        !Array.isArray(form.variants) ||
        form.variants.length === 0
      ) {
        alert(
          "Please add at least one product variant"
        );
        return;
      }

      /* =====================================================
         VARIANT VALIDATION
      ===================================================== */

      for (
        let i = 0;
        i < form.variants.length;
        i++
      ) {
        const variant =
          form.variants[i];

        if (
          !String(
            variant.sku || ""
          ).trim()
        ) {
          alert(
            `Variant ${
              i + 1
            }: SKU is required`
          );
          return;
        }

        if (
          variant.price === "" ||
          Number(
            variant.price
          ) <= 0
        ) {
          alert(
            `Variant ${
              i + 1
            }: valid selling price is required`
          );
          return;
        }

        if (
          variant.mrp === "" ||
          Number(
            variant.mrp
          ) <= 0
        ) {
          alert(
            `Variant ${
              i + 1
            }: valid MRP is required`
          );
          return;
        }

        if (
          Number(
            variant.price
          ) >
          Number(
            variant.mrp
          )
        ) {
          alert(
            `Variant ${
              i + 1
            }: selling price cannot be greater than MRP`
          );
          return;
        }

        if (
          variant.stock === "" ||
          Number(
            variant.stock
          ) < 0
        ) {
          alert(
            `Variant ${
              i + 1
            }: valid stock is required`
          );
          return;
        }
      }

      /* =====================================================
         ELECTRONICS VALIDATION
      ===================================================== */

      if (
        finalStoreType ===
          "electronics" &&
        Object.keys(
          form.specifications || {}
        ).length === 0
      ) {
        alert(
          "Please add electronics specifications"
        );
        return;
      }

      const variants =
        buildVariants();

      const firstVariant =
        variants[0];

      if (!firstVariant) {
        alert(
          "At least one variant is required"
        );
        return;
      }

      /* =====================================================
         PRODUCT ID
      ===================================================== */

      const finalProductId =
        editProduct?.productId ||
        form.productId ||
        generateProductId();

      /* =====================================================
         IMPORTANT BACKEND REQUIRED FIELDS
         
         Product model requires:
         productType
         sku
         price
         productCategory
         category
         
         So DON'T remove these fields.
      ===================================================== */

      const payload = {
        /* =========================
           PRODUCT ID
        ========================= */

        productId:
          finalProductId,

        /* =========================
           STORE
        ========================= */

        storeId:
          finalStoreId,

        storeType:
          finalStoreType,

        /* =========================
           REQUIRED LEGACY / MODEL
           FIELDS
        ========================= */

        productType:
          finalStoreType,

        category:
          selectedMainCategoryId,

        productCategory:
          selectedSubCategoryId,

        sku:
          firstVariant.sku,

        price:
          firstVariant.price,

        /* =========================
           CATEGORY IDS
           BACKWARD COMPATIBILITY
        ========================= */

        categoryId:
          selectedMainCategoryId,

        subcategoryId:
          selectedSubCategoryId,

        mainCategory:
          selectedMainCategoryId,

        /* =========================
           BASIC INFORMATION
        ========================= */

        name:
          form.name.trim(),

        slug:
          form.slug.trim() ||
          generateSlug(form.name),

        brand:
          form.brand.trim(),

        description:
          form.description.trim(),

        shortDescription:
          form.shortDescription.trim(),

        /* =========================
           IMAGES
        ========================= */

        images:
          form.images,

        thumbnail:
          form.thumbnail ||
          form.images[0] ||
          "",

        /* =========================
           UNIT
        ========================= */

        unitType:
          form.unitType,

        unit:
          form.unit,

        /* =========================
           VARIANTS
        ========================= */

        variants,

        /* =========================
           BACKWARD COMPATIBILITY
        ========================= */

        stock:
          firstVariant.stock,

        attributes:
          firstVariant.attributes || {},

        discountPrice: 0,

        /* =========================
           HIGHLIGHTS
        ========================= */

        highlights:
          form.highlights,

        /* =========================
           ELECTRONICS
        ========================= */

        specifications:
          form.specifications || {},

        /* =========================
           DEFAULTS
        ========================= */

        deliveryInfo:
          "Free Delivery",

        returnPolicy:
          "7 Days Replacement",

        isAvailable: true,

        status:
          form.status,

        isActive:
          form.isActive,

        isDeleted:
          form.isDeleted,
      };

      console.log(
        "=============================================="
      );

      console.log(
        "FINAL PRODUCT PAYLOAD:"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "=============================================="
      );

      try {
        setLoading(true);

        let response;

        if (editProduct) {
          response =
            await axios.put(
              `${API}/api/products/${editProduct._id}`,
              payload
            );
        } else {
          response =
            await axios.post(
              `${API}/api/products`,
              payload
            );
        }

        console.log(
          "PRODUCT SAVE RESPONSE:",
          response.data
        );

        alert(
          editProduct
            ? "Product updated successfully"
            : "Product created successfully"
        );

        if (onSuccess) {
          onSuccess(
            response.data
          );
        }
      } catch (error) {
        console.error(
          "=============================================="
        );

        console.error(
          "PRODUCT SAVE ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "SERVER RESPONSE:",
          error.response?.data
        );

        console.error(
          "SERVER MESSAGE:",
          error.response?.data
            ?.message
        );

        console.error(
          "FULL ERROR RESPONSE:",
          JSON.stringify(
            error.response?.data || {},
            null,
            2
          )
        );

        console.error(
          "=============================================="
        );

        const serverMessage =
          error.response?.data
            ?.message;

        if (
          typeof serverMessage ===
          "string"
        ) {
          alert(serverMessage);
        } else {
          alert(
            "Failed to save product. Check browser console for server validation details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     CLOSE MODALS
  ========================================================= */

  const closeCategoryModal = () => {
    if (categoryLoading) return;

    setShowCategoryModal(false);

    setCategoryForm({
      ...EMPTY_CATEGORY_FORM,
    });
  };

  const closeSubCategoryModal = () => {
    if (categoryLoading) return;

    setShowSubCategoryModal(false);

    setSubCategoryForm({
      ...EMPTY_SUB_CATEGORY_FORM,
    });
  };

  /* =========================================================
     SELECTED CATEGORY
  ========================================================= */

  const selectedCategory =
    categories.find(
      (category) =>
        getCategoryMongoId(
          category
        ) ===
        getObjectId(
          form.categoryId
        )
    );

  const selectedCategoryName =
    getCategoryName(
      selectedCategory
    );

  /* =========================================================
     UNIT OPTIONS
  ========================================================= */

  const unitOptions =
    normalizedStoreType ===
    "grocery"
      ? [
          ["kg", "Kilogram"],
          ["gram", "Gram"],
          ["liter", "Liter"],
          ["ml", "Milliliter"],
          ["piece", "Piece"],
          ["pack", "Pack"],
          ["box", "Box"],
        ]
      : normalizedStoreType ===
        "fashion"
      ? [
          ["piece", "Piece"],
          ["pair", "Pair"],
          ["pack", "Pack"],
        ]
      : normalizedStoreType ===
        "electronics"
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

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* HEADER */}

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
            Add complete product information
            for your marketplace store.
          </p>
        </div>
      </div>

      {/* STORE TYPE */}

      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-blue-500 font-semibold uppercase">
            Store Type
          </p>

          <p className="text-lg font-bold text-blue-900 capitalize">
            {form.storeType ||
              "Not selected"}
          </p>
        </div>

        <div className="h-8 w-px bg-blue-200 hidden sm:block" />

        <div>
          <p className="text-xs text-blue-500 font-semibold uppercase">
            Product Structure
          </p>

          <p className="text-sm text-blue-800">
            Product → Main Category → Sub Category → Variants
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* BASIC INFORMATION */}

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

            <div>
              <label className="label">
                Product Name *
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  handleNameChange(
                    e.target.value
                  )
                }
                placeholder={
                  normalizedStoreType ===
                  "grocery"
                    ? "India Gate Basmati Rice"
                    : normalizedStoreType ===
                      "electronics"
                    ? "Samsung Galaxy A56"
                    : "Men Regular Fit Cotton T-Shirt"
                }
                className="input"
                required
              />
            </div>

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
                placeholder="Brand name"
                className="input"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="label">
              Slug *
            </label>

            <input
              value={form.slug}
              onChange={(e) =>
                updateField(
                  "slug",
                  e.target.value
                )
              }
              placeholder="india-gate-basmati-rice"
              className="input"
              required
            />
          </div>

          <div className="mt-5">
            <label className="label">
              Short Description
            </label>

            <input
              value={
                form.shortDescription
              }
              onChange={(e) =>
                updateField(
                  "shortDescription",
                  e.target.value
                )
              }
              placeholder="Premium Basmati Rice"
              className="input"
            />
          </div>

          <div className="mt-5">
            <label className="label">
              Description
            </label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              placeholder="Enter detailed product description..."
              className="input resize-none"
            />
          </div>

        </section>

        {/* CATEGORY */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Category
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Select main category and
                sub-category.
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
              <FolderPlus size={18} />
              Add Category
            </button>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            {/* MAIN CATEGORY */}

            <div>
              <label className="label">
                Main Category *
              </label>

              <select
                value={
                  form.categoryId || ""
                }
                onChange={(e) =>
                  handleMainCategoryChange(
                    e.target.value
                  )
                }
                className="input"
                required
              >

                <option value="">
                  Select Main Category
                </option>

                {categories.map(
                  (category) => {
                    const id =
                      getCategoryMongoId(
                        category
                      );

                    return (
                      <option
                        key={
                          id ||
                          category.categoryId
                        }
                        value={id}
                      >
                        {getCategoryName(
                          category
                        )}
                      </option>
                    );
                  }
                )}

              </select>

              {form.categoryId && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">

                  <p className="text-xs text-green-700">
                    Selected Main Category
                  </p>

                  <p className="text-sm font-semibold text-green-800">
                    {selectedCategoryName ||
                      "Selected"}
                  </p>

                  <p className="text-[11px] text-green-600 break-all">
                    ID:{" "}
                    {form.categoryId}
                  </p>

                </div>
              )}

              {categories.length ===
                0 &&
                !categoryLoading && (
                  <p className="text-xs text-red-500 mt-2">
                    No main categories
                    available.
                  </p>
                )}

            </div>

            {/* SUB CATEGORY */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label className="label !mb-0">
                  Sub Category *
                </label>

                <button
                  type="button"
                  disabled={
                    !form.categoryId
                  }
                  onClick={() =>
                    setShowSubCategoryModal(
                      true
                    )
                  }
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    form.categoryId
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
                  form.subcategoryId ||
                  ""
                }
                onChange={(e) =>
                  updateField(
                    "subcategoryId",
                    getObjectId(
                      e.target.value
                    )
                  )
                }
                disabled={
                  !form.categoryId
                }
                className="input disabled:bg-gray-100"
                required
              >

                <option value="">
                  {!form.categoryId
                    ? "Select main category first"
                    : categoryLoading
                    ? "Loading sub-categories..."
                    : "Select Sub Category"}
                </option>

                {productCategories.map(
                  (category) => {
                    const id =
                      getCategoryMongoId(
                        category
                      );

                    return (
                      <option
                        key={
                          id ||
                          category.categoryId
                        }
                        value={id}
                      >
                        {getCategoryName(
                          category
                        )}
                      </option>
                    );
                  }
                )}

              </select>

              {form.subcategoryId && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">

                  <p className="text-xs text-green-700">
                    Selected Sub Category
                  </p>

                  <p className="text-[11px] text-green-600 break-all">
                    ID:{" "}
                    {
                      form.subcategoryId
                    }
                  </p>

                </div>
              )}

              {form.categoryId &&
                productCategories.length ===
                  0 &&
                !categoryLoading && (
                  <p className="text-xs text-orange-500 mt-2">
                    No sub-categories
                    found under{" "}
                    <strong>
                      {
                        selectedCategoryName
                      }
                    </strong>
                    .
                  </p>
                )}

            </div>

          </div>
        </section>

        {/* UNIT */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Unit Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
  <label className="label">
    Unit Type
  </label>

  <select
    value={form.unitType}
    onChange={(e) =>
      updateField("unitType", e.target.value)
    }
    className="input"
  >
    <option value="count">
      Piece
    </option>

    <option value="weight">
      Weight
    </option>

    <option value="volume">
      Volume
    </option>

    <option value="length">
      Length
    </option>

    <option value="pack">
      Pack
    </option>
  </select>
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
                {unitOptions.map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

        </section>

        {/* IMAGES */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Product Images
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Click an image to make it the
              thumbnail.
            </p>
          </div>

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

          {form.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">

              {form.images.map(
                (image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`relative border rounded-xl p-2 bg-gray-50 group cursor-pointer ${
                      form.thumbnail ===
                      image
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-gray-200"
                    }`}
                    onClick={() =>
                      setThumbnail(
                        image
                      )
                    }
                  >

                    <img
                      src={image}
                      alt={`Product ${
                        index + 1
                      }`}
                      className="w-full h-32 object-contain rounded-lg"
                    />

                    {form.thumbnail ===
                      image && (
                      <span className="absolute left-2 bottom-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded">
                        Thumbnail
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        removeImage(
                          index
                        );
                      }}
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

        {/* VARIANTS */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Product Variants
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add different sizes, colors,
                storage options, weights, etc.
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

            {form.variants.map(
              (
                variant,
                variantIndex
              ) => (
                <VariantCard
                  key={
                    variantIndex
                  }
                  variant={
                    variant
                  }
                  index={
                    variantIndex
                  }
                  storeType={
                    normalizedStoreType
                  }
                  onUpdate={
                    updateVariant
                  }
                  onRemove={
                    removeVariant
                  }
                  onUpdateAttribute={
                    updateVariantAttribute
                  }
                  onRemoveAttribute={
                    removeVariantAttribute
                  }
                />
              )
            )}

          </div>

        </section>

        {/* ELECTRONICS */}

        {normalizedStoreType ===
          "electronics" && (
          <section className="bg-white border border-gray-200 rounded-2xl p-6">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Electronics Specifications
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add display, processor, RAM,
                camera, battery, warranty,
                etc.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">

              <input
                value={attributeKey}
                onChange={(e) =>
                  setAttributeKey(
                    e.target.value
                  )
                }
                placeholder="Specification - RAM"
                className="input"
              />

              <div className="flex gap-2">

                <input
                  value={attributeValue}
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
                      addSpecification();
                    }
                  }}
                  placeholder="Value - 8GB"
                  className="input"
                />

                <button
                  type="button"
                  onClick={
                    addSpecification
                  }
                  className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus />
                </button>

              </div>

            </div>

            {Object.keys(
              form.specifications
            ).length > 0 && (
              <div className="mt-5 border rounded-xl overflow-hidden">

                {Object.entries(
                  form.specifications
                ).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b last:border-b-0 px-4 py-3"
                    >

                      <span className="font-medium text-gray-700">
                        {key}
                      </span>

                      <span className="flex items-center gap-5 text-gray-600">

                        {String(value)}

                        <button
                          type="button"
                          onClick={() =>
                            removeSpecification(
                              key
                            )
                          }
                          className="text-red-500"
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
        )}

        {/* HIGHLIGHTS */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900">
            Product Highlights
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Add important selling points.
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

          {form.highlights.length >
            0 && (
            <div className="mt-4 space-y-2">

              {form.highlights.map(
                (item, index) => (
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
                      className="text-red-500"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* STATUS */}

        <section className="bg-white border border-gray-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Product Status
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">

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
                  Product is active.
                </p>
              </div>

            </label>

            <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-gray-50">

              <input
                type="checkbox"
                checked={
                  form.isDeleted
                }
                onChange={(e) =>
                  updateField(
                    "isDeleted",
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />

              <div>
                <p className="font-semibold text-gray-800">
                  Deleted
                </p>

                <p className="text-xs text-gray-500">
                  Soft delete product.
                </p>
              </div>

            </label>

            <div className="border rounded-xl p-4">

              <p className="font-semibold text-gray-800">
                Status
              </p>

              <select
                value={
                  form.status
                }
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value
                  )
                }
                className="input mt-2"
              >

                <option value="approved">
                  Approved
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="rejected">
                  Rejected
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* ACTIONS */}

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

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div className="flex items-center gap-2">

                <FolderPlus className="text-blue-600" />

                <div>
                  <h2 className="text-lg font-bold">
                    Add Main Category
                  </h2>

                  <p className="text-xs text-gray-500">
                    Create marketplace category
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

            <form
              onSubmit={
                createMainCategory
              }
              className="p-6 space-y-4"
            >

              <div>
                <label className="label">
                  Category ID *
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

              <div>
                <label className="label">
                  Category Name *
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

              <div>
                <label className="label">
                  Slug *
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

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div className="flex items-center gap-2">

                <Tags className="text-blue-600" />

                <div>

                  <h2 className="text-lg font-bold">
                    Add Sub Category
                  </h2>

                  <p className="text-xs text-gray-500">
                    Under:{" "}
                    <span className="font-semibold">
                      {
                        selectedCategoryName
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

            <form
              onSubmit={
                createSubCategory
              }
              className="p-6 space-y-4"
            >

              <div>
                <label className="label">
                  Sub Category ID *
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

              <div>
                <label className="label">
                  Sub Category Name *
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

              <div>
                <label className="label">
                  Slug *
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

      {/* LOCAL STYLES */}

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

/* ===========================================================
   VARIANT CARD
=========================================================== */

function VariantCard({
  variant,
  index,
  storeType,
  onUpdate,
  onRemove,
  onUpdateAttribute,
  onRemoveAttribute,
}) {
  const attributeSuggestions =
    storeType === "grocery"
      ? ["weight", "packSize"]
      : storeType === "fashion"
      ? ["color", "size"]
      : storeType === "electronics"
      ? ["storage", "color"]
      : ["color", "size"];

  const addSuggestedAttribute =
    (key) => {
      const value =
        window.prompt(
          `Enter ${key}`
        );

      if (
        !value?.trim()
      ) {
        return;
      }

      onUpdateAttribute(
        index,
        key,
        value.trim()
      );
    };

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">

      <div className="flex items-center justify-between mb-5">

        <div>
          <h3 className="font-bold text-gray-900">
            Variant {index + 1}
          </h3>

          <p className="text-xs text-gray-500">
            SKU, price, MRP, stock and
            attributes
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onRemove(index)
          }
          className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold"
        >
          <Trash2 size={16} />
          Remove
        </button>

      </div>

      <div className="grid md:grid-cols-4 gap-4">

        <div>
          <label className="label">
            SKU *
          </label>

          <input
            value={
              variant.sku
            }
            onChange={(e) =>
              onUpdate(
                index,
                "sku",
                e.target.value
              )
            }
            placeholder={
              storeType ===
              "grocery"
                ? "RICE-1KG"
                : storeType ===
                  "electronics"
                ? "A56-128-BLK"
                : "TS-BLK-S"
            }
            className="input"
          />
        </div>

        <div>
          <label className="label">
            Selling Price *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={
              variant.price
            }
            onChange={(e) =>
              onUpdate(
                index,
                "price",
                e.target.value
              )
            }
            placeholder="699"
            className="input"
          />
        </div>

        <div>
          <label className="label">
            MRP *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={
              variant.mrp
            }
            onChange={(e) =>
              onUpdate(
                index,
                "mrp",
                e.target.value
              )
            }
            placeholder="999"
            className="input"
          />
        </div>

        <div>
          <label className="label">
            Stock *
          </label>

          <input
            type="number"
            min="0"
            value={
              variant.stock
            }
            onChange={(e) =>
              onUpdate(
                index,
                "stock",
                e.target.value
              )
            }
            placeholder="20"
            className="input"
          />
        </div>

      </div>

      <div className="mt-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

          <div>

            <p className="font-semibold text-gray-800">
              Variant Attributes
            </p>

            <p className="text-xs text-gray-500">

              {storeType ===
                "grocery" &&
                "Example: weight = 1 KG"}

              {storeType ===
                "fashion" &&
                "Example: color = Black, size = M"}

              {storeType ===
                "electronics" &&
                "Example: storage = 128GB, color = Black"}

            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            {attributeSuggestions.map(
              (key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() =>
                    addSuggestedAttribute(
                      key
                    )
                  }
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600"
                >
                  + {key}
                </button>
              )
            )}

          </div>

        </div>

        {Object.keys(
          variant.attributes || {}
        ).length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">

            {Object.entries(
              variant.attributes
            ).map(
              ([key, value]) => (
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
                        onUpdateAttribute(
                          index,
                          key,
                          e.target.value
                        )
                      }
                      className="w-full border-0 outline-none text-sm"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveAttribute(
                        index,
                        key
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>

                </div>
              )
            )}

          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-400 text-center">
            No variant attributes added.
          </div>
        )}

      </div>

    </div>
  );
}