import React from "react";
import { Link } from "react-router-dom";

export default function HeaderLogo() {
  return (
    <Link
      to="/"
      className="flex items-center shrink-0 group"
      aria-label="Fechzo Home"
    >
      <div className="flex items-center gap-2">

        {/* Logo Icon */}
        <div
          className="
            w-10 h-10 rounded-xl
            bg-gradient-to-br from-[#1e3a8a] to-[#02066f]
            flex items-center justify-center
            shadow-md
            group-hover:scale-105
            transition-transform duration-200
          "
        >
          <span className="text-white text-2xl font-black italic">
            F
          </span>
        </div>

        {/* Logo Text */}
        <div className="leading-none">
          <div
            className="
              text-xl sm:text-2xl
              font-extrabold
              tracking-tight
              text-[#1e3a8a]
            "
          >
            Fechzo
          </div>

          <div
            className="
              text-[9px] sm:text-[10px]
              text-gray-400
              font-medium
              mt-0.5
            "
          >
            Shop Smart
          </div>
        </div>

      </div>
    </Link>
  );
}