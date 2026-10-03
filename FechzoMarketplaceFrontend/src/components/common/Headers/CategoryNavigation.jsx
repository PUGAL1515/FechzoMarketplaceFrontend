import React from "react";

import {
  ChevronDown,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  NAV_ITEMS,
} from "./headerData";

export default function CategoryNavigation() {

  const location = useLocation();

  const currentCategory =
    location.pathname.split("/")[1];

  const isActiveCategory = (item) => {

    if (item.path === "/") {
      return location.pathname === "/";
    }

    return (
      currentCategory ===
      item.path.substring(1)
    );
  };

  return (
    <div
      className="
        hidden
        md:block
        absolute
        left-1/2
        -translate-x-1/2
        top-full
        z-[150]
      "
    >

      <div className="group">

        {/* Categories Button */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            px-5
            py-1.5
            bg-white
            border
            border-gray-200
            border-t-0
            rounded-b-xl
            shadow-sm
            cursor-pointer
            transition-all
            duration-300
            group-hover:shadow-md
            group-hover:px-6
          "
        >

          <span
            className="
              w-1.5
              h-1.5
              rounded-full
              bg-[#1e3a8a]
              animate-pulse
            "
          />

          <span
            className="
              text-[11px]
              font-semibold
              text-gray-500
              uppercase
              tracking-wider
            "
          >
            Categories
          </span>

          <ChevronDown
            size={13}
            className="
              text-gray-500
              transition-transform
              duration-300
              group-hover:rotate-180
            "
          />

        </div>

        {/* Dropdown */}

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            top-full
            pt-2
            opacity-0
            invisible
            translate-y-[-8px]
            scale-95
            group-hover:opacity-100
            group-hover:visible
            group-hover:translate-y-0
            group-hover:scale-100
            transition-all
            duration-300
            ease-out
          "
        >

          <div
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-2xl
              p-2
              flex
              items-center
              gap-2
              min-w-max
            "
          >

            {NAV_ITEMS.map((item) => {

              const active =
                isActiveCategory(item);

              const Icon =
                item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    relative
                    flex
                    items-center
                    gap-2.5
                    px-4
                    py-2.5
                    rounded-xl
                    whitespace-nowrap
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-sm
                    ${
                      active
                        ? `
                          bg-blue-50
                          text-[#1e3a8a]
                        `
                        : `
                          text-gray-700
                          hover:bg-gray-50
                          hover:text-[#1e3a8a]
                        `
                    }
                  `}
                >

                  {/* Icon */}

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-200
                      ${
                        active
                          ? `
                            bg-white
                            shadow-sm
                          `
                          : `
                            bg-gray-100
                          `
                      }
                    `}
                  >

                    <Icon
                      size={19}
                      strokeWidth={1.8}
                    />

                  </div>

                  {/* Name */}

                  <span
                    className={`
                      text-sm
                      ${
                        active
                          ? "font-bold"
                          : "font-medium"
                      }
                    `}
                  >
                    {item.name}
                  </span>

                  {/* Active Dot */}

                  {active && (
                    <span
                      className="
                        absolute
                        top-1.5
                        right-1.5
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-[#1e3a8a]
                      "
                    />
                  )}

                </Link>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}