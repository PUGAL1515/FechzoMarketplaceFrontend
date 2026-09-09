import { Link } from "react-router-dom";

export default function CategoryCard({ name, slug, image }) {
  // Fallback images if category has no image
  const fallbackImages = {
    grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  };

  const displayImage = image || fallbackImages[slug] || fallbackImages.grocery;

  // Soft gradient overlays matching your brand
  const overlays = {
    grocery: "from-emerald-900/70 via-emerald-800/40 to-transparent",
    fashion: "from-pink-900/70 via-rose-800/40 to-transparent",
    electronics: "from-blue-900/70 via-indigo-800/40 to-transparent",
  };

  const overlay = overlays[slug] || overlays.grocery;

  return (
    <Link
      to={`/${slug}`}
      className="group relative block h-64 sm:h-72 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(30,58,138,0.08)] hover:shadow-[0_12px_40px_rgba(30,58,138,0.15)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Background Image */}
      <img
        src={displayImage}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${overlay}`}></div>

      {/* Dark bottom fade for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
        <div className="transform group-hover:translate-y-[-4px] transition-transform duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {name}
          </h3>
          <p className="mt-1 text-sm text-white/80 font-medium">
            Shop now →
          </p>
        </div>
      </div>

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-white/20 transition-colors pointer-events-none"></div>
    </Link>
  );
}