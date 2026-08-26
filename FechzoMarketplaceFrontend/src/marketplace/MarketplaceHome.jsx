import { useEffect, useState } from "react";
import { getCategories } from "../api/categoryApi";
import CategoryCard from "../components/common/CategoryCard";

export default function MarketplaceHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(
        (data.categories || []).filter((item) =>
          ["grocery", "fashion", "electronics"].includes(item.slug)
        )
      );
    } catch (error) {
      console.error("Category loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-[#02066f]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Free delivery on first order
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5">
            Everything You Need
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
              Delivered Fast
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-lg sm:text-xl text-blue-100/90 font-medium leading-relaxed">
            Grocery, Fashion & Electronics — all in one place, delivered straight to your doorstep.
          </p>

          {/* Quick stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { label: "Categories", value: "3+" },
              { label: "Products", value: "1000+" },
              { label: "Happy Users", value: "50K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Shop by Category
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              Explore our curated collections
            </p>
          </div>
        </div>

        {loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                name={category.name}
                slug={category.slug}
                image={category.image}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}