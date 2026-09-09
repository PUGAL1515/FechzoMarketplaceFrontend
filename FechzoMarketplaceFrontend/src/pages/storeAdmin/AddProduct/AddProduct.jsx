import React from "react";
import { ArrowLeft, Package, Save } from "lucide-react";

import { formStyles } from "./styles";
import useProductForm from "./useProductForm";

import GenderSelector from "./components/GenderSelector";
import BasicInfoSection from "./components/BasicInfoSection";
import CategorySection from "./components/CategorySection";
import UnitSection from "./components/UnitSection";
import ImagesSection from "./components/ImagesSection";
import VariantsSection from "./components/VariantsSection";
import SpecsSection from "./components/SpecsSection";
import HighlightsSection from "./components/HighlightsSection";
import StatusSection from "./components/StatusSection";
import CategoryModal from "./components/CategoryModal";
import SubCategoryModal from "./components/SubCategoryModal";

export default function AddProduct({
  editProduct = null,
  onBack,
  onSuccess,
}) {
  const {
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

    // ==============================
    // FORM FUNCTIONS
    // ==============================
    updateField,
    handleMainCategoryChange,
    handleNameChange,

    // ==============================
    // IMAGE FUNCTIONS
    // ==============================
    handleImageUpload,
    removeImage,
    setThumbnail,
    handleVariantImageUpload,
    removeVariantImage,
    copyImagesFromVariant,

    // ==============================
    // HIGHLIGHT / SPEC FUNCTIONS
    // ==============================
    addHighlight,
    removeHighlight,
    addSpecification,
    removeSpecification,

    // ==============================
    // VARIANT FUNCTIONS
    // ==============================
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantAttribute,
    removeVariantAttribute,

    // ==============================
    // CATEGORY FUNCTIONS
    // ==============================
    updateCategoryForm,
    updateSubCategoryForm,
    handleCategoryNameChange,
    handleSubCategoryNameChange,
    createMainCategory,
    createSubCategory,

    // ==============================
    // SUBMIT
    // ==============================
    handleSubmit,

    // ==============================
    // MODAL FUNCTIONS
    // ==============================
    closeCategoryModal,
    closeSubCategoryModal,
  } = useProductForm({
    editProduct,
    onSuccess,
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-6 flex items-center gap-4">

        <button
          type="button"
          onClick={onBack}
          className="
            rounded-xl
            p-2.5
            transition
            hover:bg-gray-200
          "
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

          <p className="mt-1 text-sm text-gray-500">
            Add complete product information for your
            marketplace store.
          </p>
        </div>
      </div>

      {/* =====================================================
          STORE TYPE INFORMATION
      ===================================================== */}
      <div
        className="
          mb-6
          flex
          flex-wrap
          items-center
          gap-4
          rounded-2xl
          border
          border-blue-100
          bg-blue-50
          px-5
          py-4
        "
      >

        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              text-blue-500
            "
          >
            Store Type
          </p>

          <p
            className="
              text-lg
              font-bold
              capitalize
              text-blue-900
            "
          >
            {form.storeType || "Not selected"}
          </p>
        </div>

        <div
          className="
            hidden
            h-8
            w-px
            bg-blue-200
            sm:block
          "
        />

        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              text-blue-500
            "
          >
            Product Structure
          </p>

          <p className="text-sm text-blue-800">
            Product → Main Category → Sub Category → Gender → Variants
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN FORM
      ===================================================== */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}
        <BasicInfoSection
          form={form}
          normalizedStoreType={normalizedStoreType}
          handleNameChange={handleNameChange}
          updateField={updateField}
        />

        {/* ===================================================
            CATEGORY
        =================================================== */}
        <CategorySection
          form={form}
          categories={categories}
          productCategories={productCategories}
          categoryLoading={categoryLoading}
          selectedCategoryName={selectedCategoryName}
          handleMainCategoryChange={handleMainCategoryChange}
          updateField={updateField}
          setShowCategoryModal={setShowCategoryModal}
          setShowSubCategoryModal={setShowSubCategoryModal}
        />

        {/* ===================================================
            GENDER
            Fashion products only
        =================================================== */}
        {normalizedStoreType === "fashion" && (
          <GenderSelector
            value={form.gender || ""}
            onChange={(gender) => {
              updateField("gender", gender);
            }}
            required
          />
        )}

        {/* ===================================================
            UNIT
        =================================================== */}
        <UnitSection
          form={form}
          unitOptions={unitOptions}
          updateField={updateField}
        />

        {/* ===================================================
            IMAGES
        =================================================== */}
        <ImagesSection
          form={form}
          uploadingImage={uploadingImage}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          setThumbnail={setThumbnail}
        />

        {/* ===================================================
            VARIANTS
        =================================================== */}
        <VariantsSection
          form={form}
          normalizedStoreType={normalizedStoreType}
          uploadingVariantImage={uploadingVariantImage}
          addVariant={addVariant}
          removeVariant={removeVariant}
          updateVariant={updateVariant}
          updateVariantAttribute={updateVariantAttribute}
          removeVariantAttribute={removeVariantAttribute}
          handleVariantImageUpload={handleVariantImageUpload}
          removeVariantImage={removeVariantImage}
          copyImagesFromVariant={copyImagesFromVariant}
        />

        {/* ===================================================
            ELECTRONICS SPECIFICATIONS
        =================================================== */}
        {normalizedStoreType === "electronics" && (
          <SpecsSection
            attributeKey={attributeKey}
            setAttributeKey={setAttributeKey}
            attributeValue={attributeValue}
            setAttributeValue={setAttributeValue}
            form={form}
            addSpecification={addSpecification}
            removeSpecification={removeSpecification}
          />
        )}

        {/* ===================================================
            HIGHLIGHTS
        =================================================== */}
        <HighlightsSection
          highlight={highlight}
          setHighlight={setHighlight}
          form={form}
          addHighlight={addHighlight}
          removeHighlight={removeHighlight}
        />

        {/* ===================================================
            STATUS
        =================================================== */}
        <StatusSection
          form={form}
          updateField={updateField}
        />

        {/* ===================================================
            ACTIONS
        =================================================== */}
        <div
          className="
            flex
            flex-col
            justify-end
            gap-3
            pb-10
            sm:flex-row
          "
        >

          {/* CANCEL */}
          <button
            type="button"
            onClick={onBack}
            className="
              rounded-xl
              border
              border-gray-300
              px-6
              py-3
              font-medium
              transition
              hover:bg-gray-50
            "
          >
            Cancel
          </button>

          {/* SAVE / UPDATE */}
          <button
            type="submit"
            disabled={
              loading ||
              uploadingImage ||
              uploadingVariantImage !== null
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-8
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {loading ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />

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
          CATEGORY MODAL
      ===================================================== */}
      {showCategoryModal && (
        <CategoryModal
          categoryForm={categoryForm}
          categoryLoading={categoryLoading}
          updateCategoryForm={updateCategoryForm}
          handleCategoryNameChange={
            handleCategoryNameChange
          }
          createMainCategory={createMainCategory}
          closeCategoryModal={closeCategoryModal}
        />
      )}

      {/* =====================================================
          SUB CATEGORY MODAL
      ===================================================== */}
      {showSubCategoryModal && (
        <SubCategoryModal
          subCategoryForm={subCategoryForm}
          categoryLoading={categoryLoading}
          selectedCategoryName={selectedCategoryName}
          updateSubCategoryForm={updateSubCategoryForm}
          handleSubCategoryNameChange={
            handleSubCategoryNameChange
          }
          createSubCategory={createSubCategory}
          closeSubCategoryModal={closeSubCategoryModal}
        />
      )}

      {/* =====================================================
          FORM STYLES
      ===================================================== */}
      <style>{formStyles}</style>
    </div>
  );
}

