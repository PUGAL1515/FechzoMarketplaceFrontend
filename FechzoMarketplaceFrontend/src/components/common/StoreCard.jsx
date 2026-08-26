// src/components/cards/StoreCard.jsx
import { Link } from "react-router-dom";

export default function StoreCard({ store }) {
  const isOpen = store.isOpen;
  const deliveryTime = "10-20 min"; // You can calculate from distance later
  const logo = store.logo || store.storefrontImage || store.images?.[0];

  return (
    <Link
      to={`/store/${store._id}`}
      className="group block bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-[0_4px_20px_rgba(30,58,138,0.06)] hover:shadow-[0_8px_30px_rgba(30,58,138,0.12)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Banner / Image */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={logo || "https://via.placeholder.com/400x200?text=Store"}
          alt={store.storeName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Open / Closed badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md ${
              isOpen
                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                : "bg-slate-500"
            }`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Store type badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-700 backdrop-blur-sm capitalize">
            {store.storeType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-[15px] truncate group-hover:text-[#1e3a8a] transition-colors">
              {store.storeName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {store.address?.city || store.address?.fullAddress || "Local Store"}
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            <span className="font-medium">4.2</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>{deliveryTime}</span>
          {store.minOrderValue > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Min ₹{store.minOrderValue}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}