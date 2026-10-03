import React from "react";

import {
  MapPin,
  ChevronDown,
  MapPinned,
} from "lucide-react";

export default function HeaderLocation({
  userAddress,
  loadingAddress,
  showLocation,
  setShowLocation,
  onManageAddresses,
}) {

  const getLocationText = () => {

    if (loadingAddress) {
      return "Loading...";
    }

    if (!userAddress) {
      return "Select location";
    }

    const city = userAddress.city || "";
    const pincode = userAddress.pincode || "";

    if (city && pincode) {
      return `${city} - ${pincode}`;
    }

    return city || pincode || "Select location";
  };

  const AddressDetails = ({ address }) => {

    if (!address) {
      return (
        <div className="text-center py-4">

          <MapPin
            size={28}
            className="mx-auto text-gray-400 mb-2"
          />

          <p className="text-sm font-semibold text-gray-700">
            No delivery address
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Add an address to start shopping
          </p>

        </div>
      );
    }

    return (
      <div
        className="
          border border-blue-100
          bg-blue-50
          rounded-lg
          p-3
        "
      >

        <div className="flex items-start gap-2">

          <MapPin
            size={17}
            className="text-blue-600 mt-0.5 shrink-0"
          />

          <div className="text-sm text-gray-700 min-w-0">

            {/* Door / Street */}
            <p className="font-semibold text-gray-900">
              {address.doorNo || ""}

              {address.street
                ? `, ${address.street}`
                : ""}
            </p>

            {/* Landmark */}
            {address.landmark && (
              <p className="text-xs text-gray-500 mt-1">
                {address.landmark}
              </p>
            )}

            {/* City / State */}
            <p className="text-xs text-gray-600 mt-1">

              {address.city || ""}

              {address.state
                ? `, ${address.state}`
                : ""}

            </p>

            {/* Pincode */}
            {address.pincode && (
              <p
                className="
                  text-xs
                  font-semibold
                  text-gray-700
                  mt-1
                "
              >
                PIN - {address.pincode}
              </p>
            )}

            {/* Phone */}
            {address.phone && (
              <p className="text-xs text-gray-500 mt-1">
                Phone: {address.phone}
              </p>
            )}

          </div>

        </div>

      </div>
    );
  };

  return (
    <div
      className="
        relative
        location-dropdown
        hidden xl:block
      "
    >

      {/* Location Button */}

      <button
        type="button"
        onClick={() =>
          setShowLocation((prev) => !prev)
        }
        className="
          flex items-center
          gap-2
          px-2 py-2
          rounded-lg
          hover:bg-gray-50
          transition
        "
      >

        <MapPin
          size={21}
          strokeWidth={2}
          className="text-gray-800"
        />

        <div className="text-left">

          <div className="text-[10px] text-gray-500">
            Deliver to
          </div>

          <div
            className="
              text-sm
              font-semibold
              text-gray-800
              flex items-center
              gap-1
              max-w-[180px]
            "
          >

            <span className="truncate">
              {getLocationText()}
            </span>

            <ChevronDown
              size={14}
              className={`
                shrink-0
                transition-transform
                ${
                  showLocation
                    ? "rotate-180"
                    : ""
                }
              `}
            />

          </div>

        </div>

      </button>

      {/* Location Dropdown */}

      {showLocation && (
        <div
          className="
            absolute
            right-0
            top-[52px]
            w-[320px]
            bg-white
            border border-gray-200
            rounded-xl
            shadow-2xl
            p-4
            z-[200]
            animate-[fadeIn_0.2s_ease-out]
          "
        >

          {/* Header */}

          <div
            className="
              flex items-center
              gap-3
              mb-4
            "
          >

            <div
              className="
                w-10 h-10
                rounded-full
                bg-blue-50
                flex items-center
                justify-center
              "
            >
              <MapPin
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>

              <div
                className="
                  font-semibold
                  text-gray-800
                "
              >
                Delivery Location
              </div>

              <div
                className="
                  text-xs
                  text-gray-500
                "
              >
                Your saved delivery address
              </div>

            </div>

          </div>

          {/* Address */}

          <AddressDetails
            address={userAddress}
          />

          {/* Manage Addresses */}

          <button
            type="button"
            onClick={onManageAddresses}
            className="
              w-full
              mt-3
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              px-4
              rounded-lg
              bg-blue-50
              text-blue-700
              border border-blue-100
              hover:bg-blue-100
              transition
              text-sm
              font-semibold
            "
          >

            <MapPinned size={17} />

            Manage Addresses

          </button>

        </div>
      )}

    </div>
  );
}