export const getObjectId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    return String(value._id || value.id || value.$oid || "").trim();
  }

  return "";
};

export const getCategoryMongoId = (category) => {
  if (!category) return "";
  return getObjectId(category._id || category.id || category.categoryId);
};

export const getCategoryName = (category) => {
  return category?.name || category?.categoryName || category?.title || "";
};

export const extractCategoryArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  const result =
    data?.categories || data?.productCategories || data?.data || [];

  return Array.isArray(result) ? result : [];
};

export const generateSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const createUniqueSlug = (name) => {
  const baseSlug = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniquePart =
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 6);

  return `${baseSlug}-${uniquePart}`;
};

export const generateProductId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROD-${timestamp}-${random}`;
};

export const normalizeAttribute = (value) =>
  String(value || "").trim().toLowerCase();
