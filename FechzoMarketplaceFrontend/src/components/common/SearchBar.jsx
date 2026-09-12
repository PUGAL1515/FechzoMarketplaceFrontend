import React, { useEffect, useState } from "react";
import { Search, Store, Package, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchBar({ mobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState("");

  // ------------------------------------------------------------
  // Keep search value synced with URL
  // ------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    setSearchValue(query);
  }, [location.search]);

  // ------------------------------------------------------------
  // SEARCH SUBMIT
  // ------------------------------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // ------------------------------------------------------------
  // CLEAR SEARCH
  // ------------------------------------------------------------
  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <form
      onSubmit={handleSearch}
      className={
        mobile
          ? "md:hidden pb-3"
          : "hidden md:block flex-1 max-w-[680px]"
      }
    >
      <div
        className={`
          relative
          h-[44px]
          flex
          items-center
          rounded-lg
          bg-[#f5f7ff]
          border
          border-transparent
          focus-within:bg-white
          focus-within:border-blue-500
          transition-all
          ${mobile ? "border-gray-100" : ""}
        `}
      >
        {/* SEARCH ICON */}

        <Search
          size={mobile ? 20 : 21}
          strokeWidth={2}
          className="absolute left-4 text-gray-500"
        />

        {/* INPUT */}

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search products or stores..."
          className={`
            w-full
            h-full
            pl-12
            ${searchValue ? "pr-11" : "pr-4"}
            bg-transparent
            outline-none
            ${mobile ? "text-sm" : "text-[15px]"}
            text-gray-700
            placeholder:text-gray-500
          `}
        />

        {/* CLEAR BUTTON */}

        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute
              right-3
              w-7
              h-7
              flex
              items-center
              justify-center
              rounded-full
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
              transition
            "
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </form>
  );
}