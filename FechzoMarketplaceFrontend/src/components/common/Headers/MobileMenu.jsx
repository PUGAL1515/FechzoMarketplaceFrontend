import React from "react";

import {
  MapPin,
  MapPinned,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  NAV_ITEMS,
} from "./headerData";

export default function MobileMenu({
  showMobileMenu,
  showLocation,
  setShowLocation,
  setShowMobileMenu,
  userAddress,
}) {

  const location = useLocation();

  const navigate = useNavigate();

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

  if (!showMobileMenu) {
    return null;
  }

  return (
    <div
      className="
        md:hidden
        border-t
        border-gray-100
        bg-white
        shadow-lg
      "
    >

      <div className="p-4">

        {/* Categories */}

        <div
          className="
            grid
            grid-cols-3
            gap-3
          "
        >

          {NAV_ITEMS.map((item) => {

            const Icon =
              item.icon;

            const active =
              isActiveCategory(item);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() =>
                  setShowMobileMenu(false)
                }
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  p-3
                  rounded-xl
                  transition-all
                  duration-200
                  ${
                    active
                      ? `
                        bg-blue-50
                        text-blue-700
                      `
                      : `
                        bg-gray-50
                        text-gray-700
                        hover:bg-blue-50
                        hover:text-blue-700
                      `
                  }
                `}
              >

                <Icon
                  size={25}
                  strokeWidth={1.8}
                />

                <span
                  className="
                    text-xs
                    font-semibold
                  "
                >
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

        {/* Location */}

        <div
          className="
            mt-4
            pt-4
            border-t
            border-gray-100
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowLocation(
                (prev) => !prev
              )
            }
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-lg
              hover:bg-gray-50
              text-left
            "
          >

            <MapPin
              size={20}
              className="text-gray-700"
            />

            <div className="min-w-0">

              <div
                className="
                  text-xs
                  text-gray-500
                "
              >
                Deliver to
              </div>

              <div
                className="
                  text-sm
                  font-semibold
                  truncate
                "
              >

                {userAddress
                  ? `${userAddress.city || ""}${
                      userAddress.pincode
                        ? ` - ${userAddress.pincode}`
                        : ""
                    }`
                  : "Select location"}

              </div>

            </div>

          </button>

          {/* Mobile Location Details */}

          {showLocation && (
            <div
              className="
                mt-3
                border
                border-gray-200
                rounded-xl
                p-3
              "
            >

              {userAddress ? (

                <div
                  className="
                    bg-blue-50
                    border
                    border-blue-100
                    rounded-lg
                    p-3
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >

                    <MapPin
                      size={17}
                      className="
                        text-blue-600
                        mt-0.5
                        shrink-0
                      "
                    />

                    <div
                      className="
                        text-sm
                        text-gray-700
                        min-w-0
                      "
                    >

                      <p
                        className="
                          font-semibold
                          text-gray-900
                        "
                      >

                        {userAddress.doorNo || ""}

                        {userAddress.street
                          ? `, ${userAddress.street}`
                          : ""}

                      </p>

                      {userAddress.landmark && (
                        <p
                          className="
                            text-xs
                            text-gray-500
                            mt-1
                          "
                        >
                          {userAddress.landmark}
                        </p>
                      )}

                      <p
                        className="
                          text-xs
                          text-gray-600
                          mt-1
                        "
                      >

                        {userAddress.city || ""}

                        {userAddress.state
                          ? `, ${userAddress.state}`
                          : ""}

                      </p>

                      {userAddress.pincode && (
                        <p
                          className="
                            text-xs
                            font-semibold
                            text-gray-700
                            mt-1
                          "
                        >
                          PIN - {userAddress.pincode}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              ) : (

                <div
                  className="
                    text-center
                    py-3
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    No delivery address
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                    "
                  >
                    Add an address to start shopping
                  </p>

                </div>

              )}

              {/* Manage Addresses */}

              <button
                type="button"
                onClick={() => {

                  setShowLocation(false);

                  setShowMobileMenu(false);

                  navigate("/addresses");

                }}
                className="
                  w-full
                  mt-3
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-2.5
                  rounded-lg
                  bg-blue-50
                  text-blue-700
                  border
                  border-blue-100
                  text-sm
                  font-semibold
                  hover:bg-blue-100
                  transition
                "
              >

                <MapPinned
                  size={17}
                />

                Manage Addresses

              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}