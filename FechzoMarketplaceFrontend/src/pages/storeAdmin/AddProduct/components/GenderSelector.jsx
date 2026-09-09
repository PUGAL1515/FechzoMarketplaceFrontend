import React from "react";
import {
  User,
  Users,
  Baby,
  Check,
} from "lucide-react";

const GENDER_OPTIONS = [
  {
    value: "men",
    label: "Men",
    description: "Men's products",
    icon: User,
  },
  {
    value: "women",
    label: "Women",
    description: "Women's products",
    icon: User,
  },
  {
    value: "boys",
    label: "Boys",
    description: "Boys products",
    icon: Users,
  },
  {
    value: "girls",
    label: "Girls",
    description: "Girls products",
    icon: Users,
  },
  {
    value: "baby-kids",
    label: "Baby / Kids",
    description: "Baby & kids products",
    icon: Baby,
  },
  {
    value: "unisex",
    label: "Unisex",
    description: "Suitable for everyone",
    icon: Users,
  },
];

const GenderSelector = ({
  value = "",
  onChange,
  required = false,
  error = "",
  disabled = false,
}) => {
  const handleSelect = (gender) => {
    if (disabled) return;

    if (typeof onChange === "function") {
      onChange(gender);
    }
  };

  const selectedOption = GENDER_OPTIONS.find(
    (option) => option.value === value
  );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">
            Gender
          </h3>

          {required && (
            <span className="text-sm font-bold text-red-500">
              *
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Select the target gender for this product.
        </p>
      </div>

      {/* =====================================================
          GENDER OPTIONS
      ===================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

        {GENDER_OPTIONS.map((option) => {
          const Icon = option.icon;

          const isSelected =
            String(value || "").toLowerCase() ===
            option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option.value)}
              aria-pressed={isSelected}
              className={`
                group relative
                flex min-h-[105px]
                w-full flex-col
                items-center justify-center
                rounded-xl
                border-2
                px-3 py-4
                text-center
                transition-all
                duration-200

                ${
                  isSelected
                    ? `
                      border-blue-600
                      bg-blue-50
                      text-blue-700
                      shadow-md
                    `
                    : `
                      border-gray-200
                      bg-white
                      text-gray-600
                      hover:border-blue-300
                      hover:bg-blue-50/50
                      hover:shadow-sm
                    `
                }

                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }

                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-1
              `}
            >

              {/* =================================================
                  SELECTED CHECK
              ================================================= */}
              {isSelected && (
                <span
                  className="
                    absolute
                    right-2
                    top-2
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-600
                    text-white
                  "
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                  />
                </span>
              )}

              {/* =================================================
                  ICON
              ================================================= */}
              <span
                className={`
                  mb-2
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-200

                  ${
                    isSelected
                      ? `
                        bg-blue-100
                        text-blue-600
                      `
                      : `
                        bg-gray-100
                        text-gray-500
                        group-hover:bg-blue-100
                        group-hover:text-blue-600
                      `
                  }
                `}
              >
                <Icon size={22} strokeWidth={2} />
              </span>

              {/* =================================================
                  LABEL
              ================================================= */}
              <span className="text-sm font-semibold">
                {option.label}
              </span>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}
              <span
                className={`
                  mt-1
                  text-[10px]
                  leading-tight
                  ${
                    isSelected
                      ? "text-blue-500"
                      : "text-gray-400"
                  }
                `}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          SELECTED DISPLAY
      ===================================================== */}
      {selectedOption && (
        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            px-4
            py-3
          "
        >
          <div>
            <p className="text-xs font-medium text-blue-500">
              Selected Gender
            </p>

            <p className="mt-0.5 text-sm font-bold text-blue-700">
              {selectedOption.label}
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-white
            "
          >
            <Check
              size={18}
              strokeWidth={3}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          VALIDATION ERROR
      ===================================================== */}
      {error ? (
        <p className="mt-3 text-xs font-medium text-red-500">
          {error}
        </p>
      ) : (
        required &&
        !value && (
          <p className="mt-3 text-xs text-gray-400">
            Please select a gender before saving this
            fashion product.
          </p>
        )
      )}
    </div>
  );
};

export default GenderSelector;