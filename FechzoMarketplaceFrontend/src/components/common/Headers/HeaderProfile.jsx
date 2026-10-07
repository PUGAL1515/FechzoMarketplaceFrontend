import React from "react";

import {
  ChevronDown,
  LogOut,
  MapPinned,
  Package,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function HeaderProfile({
  user,
  avatarUrl,
  showProfile,
  setShowProfile,
  getUserName,
  getUserInitial,
  onLogout,
}) {

  return (
    <div
      className="
        relative
        profile-dropdown
        shrink-0
      "
    >

      {user && (
        <>
          {/* Profile Button */}

          <button
            type="button"
            onClick={() =>
              setShowProfile((prev) => !prev)
            }
            className="
              flex items-center
              gap-2
              px-2 sm:px-3
              py-2
              rounded-lg
              hover:bg-gray-50
              transition
            "
          >

            {/* Avatar */}

            <div
              className="
                w-9 h-9
                rounded-full
                bg-gradient-to-br
                from-[#1e3a8a]
                to-[#02066f]
                text-white
                flex items-center
                justify-center
                font-bold
                overflow-hidden
              "
            >

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={getUserName()}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                getUserInitial()
              )}

            </div>

            {/* Name */}

            <div
              className="
                hidden
                lg:block
                text-left
              "
            >

              <div
                className="
                  text-[10px]
                  text-gray-500
                "
              >
                Welcome
              </div>

              <div
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                  max-w-[90px]
                  truncate
                "
              >
                {getUserName()}
              </div>

            </div>

            {/* Arrow */}

            <ChevronDown
              size={15}
              className={`
                hidden
                sm:block
                text-gray-500
                transition-transform
                ${
                  showProfile
                    ? "rotate-180"
                    : ""
                }
              `}
            />

          </button>

          {/* Profile Dropdown */}

          {showProfile && (
            <div
              className="
                absolute
                right-0
                top-[53px]
                w-[280px]
                bg-white
                rounded-xl
                border border-gray-200
                shadow-2xl
                overflow-hidden
                z-[200]
              "
            >

              {/* User Information */}

              <div
                className="
                  px-4
                  py-4
                  bg-gray-50
                  border-b
                  border-gray-100
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  {/* Large Avatar */}

                  <div
                    className="
                      w-12 h-12
                      rounded-full
                      bg-gradient-to-br
                      from-[#1e3a8a]
                      to-[#02066f]
                      text-white
                      flex items-center
                      justify-center
                      font-bold
                      overflow-hidden
                      shrink-0
                    "
                  >

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={getUserName()}
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />
                    ) : (
                      getUserInitial()
                    )}

                  </div>

                  {/* Details */}

                  <div className="min-w-0">

                    <p
                      className="
                        font-bold
                        text-gray-800
                        truncate
                      "
                    >
                      {getUserName()}
                    </p>

                    {user.email && (
                      <p
                        className="
                          text-xs
                          text-gray-500
                          truncate
                          mt-0.5
                        "
                      >
                        {user.email}
                      </p>
                    )}

                    {user.phone && (
                      <p
                        className="
                          text-xs
                          text-gray-500
                          truncate
                        "
                      >
                        {user.phone}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* Menu */}

              <div className="p-2">

                {/* My Profile */}

                <Link
                  to="/profile"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                    transition
                  "
                >

                  <UserRound size={18} />

                  My Profile

                </Link>

                {/* My Orders */}

                <Link
                  to="/orders"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                    transition
                  "
                >

                  <Package size={18} />

                  My Orders

                </Link>

                {/* Addresses */}

                <Link
                  to="/addresses"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-sm
                    text-gray-700
                    hover:bg-gray-50
                    transition
                  "
                >

                  <MapPinned size={18} />

                  Addresses

                </Link>

              </div>

              {/* Logout */}

              <div
                className="
                  border-t
                  border-gray-100
                  p-2
                "
              >

                <button
                  type="button"
                  onClick={onLogout}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-sm
                    text-red-600
                    hover:bg-red-50
                    transition
                  "
                >

                  <LogOut size={18} />

                  Logout

                </button>

              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}