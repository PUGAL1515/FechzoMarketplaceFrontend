import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
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
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-[#EAF1FF]">

        <div className="mx-auto flex min-h-[470px] max-w-[1400px] items-center justify-between px-6 py-14 lg:px-12">

          {/* CONTENT */}
          <div className="max-w-2xl">

            <span className="mb-5 inline-flex rounded-full bg-[#DCE8FF] px-4 py-2 text-xs font-bold text-[#154FCB]">
              Welcome to Fechzo Marketplace
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Everything You Need,
              <span className="block text-[#154FCB]">
                Delivered to You.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
              Shop groceries, fashion and electronics from
              trusted sellers and get everything delivered
              right to your doorstep.
            </p>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/grocery"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#154FCB] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#103DA1]"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/offers"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#D6E0F5] bg-white px-6 text-sm font-semibold text-[#154FCB] transition hover:bg-[#F5F8FF]"
              >
                View Offers
              </Link>

            </div>

            {/* FEATURES */}
            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:gap-8">

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EEF4FF] p-2.5 text-[#154FCB]">
                  <Truck size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Fast Delivery
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Quick doorstep delivery
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EEF4FF] p-2.5 text-[#154FCB]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Secure Shopping
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Safe & trusted payments
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative hidden h-[380px] w-[430px] items-center justify-center lg:flex">

            <div className="flex h-[270px] w-[270px] items-center justify-center rounded-full bg-white text-[#154FCB] shadow-2xl shadow-blue-100">
              <ShoppingBag
                size={110}
                strokeWidth={1.3}
              />
            </div>

            {/* FLOATING CARD 1 */}
            <div className="absolute right-0 top-8 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl">
              <span className="text-2xl">
                🛒
              </span>

              <div>
                <p className="text-xs font-bold text-gray-900">
                  Easy Shopping
                </p>

                <p className="mt-0.5 text-[10px] text-gray-500">
                  Everything in one place
                </p>
              </div>
            </div>

            {/* FLOATING CARD 2 */}
            <div className="absolute bottom-7 left-0 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl">
              <span className="text-2xl">
                ⚡
              </span>

              <div>
                <p className="text-xs font-bold text-gray-900">
                  Fast Delivery
                </p>

                <p className="mt-0.5 text-[10px] text-gray-500">
                  At your doorstep
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <span className="text-[11px] font-extrabold tracking-[1.5px] text-[#154FCB]">
                EXPLORE
              </span>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Shop by Category
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Find everything you need from our popular categories.
              </p>
            </div>

            <Link
              to="/categories"
              className="flex items-center gap-2 text-sm font-semibold text-[#154FCB]"
            >
              View All
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[200px] flex-col items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#154FCB]" />

              <p className="mt-3 text-sm text-gray-500">
                Loading categories...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && categories.length === 0 && (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300">
              <ShoppingBag
                size={40}
                className="text-gray-400"
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                No categories available
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Please check back again later.
              </p>
            </div>
          )}

          {/* CATEGORY GRID */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-t border-gray-100 bg-slate-50 py-12">

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* CARD */}
            <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-6">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
                <Truck size={25} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Fast & Reliable Delivery
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                  Get your orders delivered quickly
                  and safely to your doorstep.
                </p>
              </div>

            </div>

            {/* CARD */}
            <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-6">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Trusted Sellers
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                  Shop confidently from verified
                  sellers on Fechzo.
                </p>
              </div>

            </div>

            {/* CARD */}
            <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-6">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#154FCB]">
                <Clock size={25} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Convenient Shopping
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                  Browse and order your favorite
                  products anytime.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}