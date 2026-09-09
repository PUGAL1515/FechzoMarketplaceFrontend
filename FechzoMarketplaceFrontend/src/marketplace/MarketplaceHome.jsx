import { useEffect, useState } from "react";
import { getCategories } from "../api/categoryApi";
import CategoryCard from "../components/common/CategoryCard";
import { Link } from "react-router-dom"; // if you use react-router

export default function MarketplaceHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== STATIC ADS (replace with API later) ==========
  const mainBannerAd = {
    id: "main-hero",
    title: "Big Summer Sale",
    subtitle: "Up to 60% off on Fashion & Electronics",
    ctaText: "Shop Now",
    ctaLink: "/offers",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80", // replace with your image
    badge: "Limited Time",
  };

  const secondaryAds = [
    {
      id: "grocery-promo",
      title: "Fresh Grocery",
      subtitle: "Free delivery on orders above ₹499",
      ctaText: "Order Now",
      ctaLink: "/category/grocery",
      bg: "from-emerald-500 to-teal-600",
      icon: "🥬",
    },
    {
      id: "fashion-promo",
      title: "New Fashion Drop",
      subtitle: "Trending styles just landed",
      ctaText: "Explore",
      ctaLink: "/category/fashion",
      bg: "from-pink-500 to-rose-600",
      icon: "👗",
    },
    {
      id: "electronics-promo",
      title: "Electronics Fest",
      subtitle: "Extra 10% off with code TECH10",
      ctaText: "Grab Deals",
      ctaLink: "/category/electronics",
      bg: "from-blue-600 to-indigo-700",
      icon: "📱",
    },
  ];

  const sponsoredDeals = [
    {
      id: 1,
      title: "Wireless Earbuds",
      price: "₹1,299",
      originalPrice: "₹2,999",
      discount: "57% OFF",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
      link: "/product/earbuds",
    },
    {
      id: 2,
      title: "Cotton Kurta Set",
      price: "₹899",
      originalPrice: "₹1,799",
      discount: "50% OFF",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
      link: "/product/kurta",
    },
    {
      id: 3,
      title: "Organic Rice 5kg",
      price: "₹349",
      originalPrice: "₹499",
      discount: "30% OFF",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      link: "/product/rice",
    },
    {
      id: 4,
      title: "Smart Watch",
      price: "₹2,499",
      originalPrice: "₹4,999",
      discount: "50% OFF",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      link: "/product/smartwatch",
    },
  ];

  // ========== CATEGORY LOADING ==========
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

      {/* ===================== MAIN HERO / BANNER AD ===================== */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-[#02066f]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {mainBannerAd.badge || "Free delivery on first order"}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {mainBannerAd.title}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                  {mainBannerAd.subtitle}
                </span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-lg text-blue-100/90 font-medium leading-relaxed mb-8">
                Grocery, Fashion & Electronics — all in one place, delivered straight to your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to={mainBannerAd.ctaLink}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-white text-[#1e3a8a] font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  {mainBannerAd.ctaText}
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10">
                {[
                  { label: "Categories", value: "3+" },
                  { label: "Products", value: "1000+" },
                  { label: "Happy Users", value: "50K+" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-blue-200/80 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Banner image (optional) */}
            <div className="hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <img
                  src={mainBannerAd.image}
                  alt={mainBannerAd.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECONDARY PROMO ADS (3 cards) ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {secondaryAds.map((ad) => (
            <Link
              key={ad.id}
              to={ad.ctaLink}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${ad.bg} p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-3">{ad.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{ad.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{ad.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white/30 transition">
                    {ad.ctaText} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== CATEGORIES SECTION ===================== */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
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

      {/* ===================== SPONSORED / FEATURED DEALS ===================== */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                Sponsored
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                Today's Best Deals
              </h2>
            </div>
            <Link
              to="/offers"
              className="hidden sm:inline-flex text-sm font-semibold text-[#1e3a8a] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {sponsoredDeals.map((deal) => (
              <Link
                key={deal.id}
                to={deal.link}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {deal.discount}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">
                    {deal.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900">{deal.price}</span>
                    <span className="text-sm text-slate-400 line-through">{deal.originalPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Optional: Bottom strip ad */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#1e3a8a] to-[#02066f] p-8 md:p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
              Get 15% OFF on your first order
            </h3>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Use code <span className="font-bold text-white">WELCOME15</span> at checkout
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3.5 rounded-2xl bg-white text-[#1e3a8a] font-bold hover:scale-[1.02] transition-all shadow-lg"
            >
              Claim Offer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}