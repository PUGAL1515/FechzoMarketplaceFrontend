import { Link } from "react-router-dom";
import {
  ArrowRight,
  Carrot,
  Apple,
  Wheat,
  Milk,
  Cookie,
  Coffee,
  ShoppingBasket,
} from "lucide-react";

export default function GroceryHome() {
  const categories = [
    {
      name: "Vegetables",
      icon: Carrot,
      description: "Fresh vegetables",
    },
    {
      name: "Fruits",
      icon: Apple,
      description: "Fresh & healthy fruits",
    },
    {
      name: "Rice & Grains",
      icon: Wheat,
      description: "Staples & grains",
    },
    {
      name: "Dairy",
      icon: Milk,
      description: "Milk & dairy products",
    },
    {
      name: "Snacks",
      icon: Cookie,
      description: "Tasty snacks",
    },
    {
      name: "Beverages",
      icon: Coffee,
      description: "Drinks & beverages",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-[#EAF1FF]">

        <div className="mx-auto flex min-h-[390px] max-w-[1400px] items-center justify-between px-6 py-14 lg:px-12">

          <div className="max-w-2xl">

            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#DCE8FF] px-4 py-2 text-xs font-bold text-[#154FCB]">
              <ShoppingBasket size={14} />
              Fresh & Quality
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Fresh Groceries,
              <span className="block text-[#154FCB]">
                Delivered Fresh.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
              Shop fresh groceries, daily essentials
              and everything your home needs.
            </p>

            <Link
              to="/grocery/products"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-[#154FCB] px-6 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-100 transition hover:bg-[#103DA1]"
            >
              Shop Grocery
              <ArrowRight size={18} />
            </Link>

          </div>

          {/* VISUAL */}
          <div className="relative hidden h-72 w-80 items-center justify-center lg:flex">

            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-white text-[#154FCB] shadow-2xl shadow-blue-100">
              <ShoppingBasket
                size={105}
                strokeWidth={1.2}
              />
            </div>

            <div className="absolute right-0 top-5 rounded-xl bg-white p-4 text-2xl shadow-xl">
              🥦
            </div>

            <div className="absolute bottom-4 left-0 rounded-xl bg-white p-4 text-2xl shadow-xl">
              🍎
            </div>

          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

          <div className="mb-9">
            <span className="text-[11px] font-extrabold tracking-[1.5px] text-[#154FCB]">
              EXPLORE
            </span>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Popular Grocery Categories
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Everything you need for your everyday shopping.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={`/grocery/products?category=${item.name}`}
                  className="group rounded-xl border border-gray-100 bg-white p-6 no-underline shadow-sm transition-all hover:-translate-y-1 hover:border-[#DCE8FF] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#154FCB] transition group-hover:bg-[#154FCB] group-hover:text-white">
                      <Icon size={30} />
                    </div>

                    <div className="flex-1">

                      <h3 className="text-sm font-bold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.description}
                      </p>

                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#154FCB]">
                        Explore
                        <ArrowRight size={13} />
                      </span>

                    </div>

                  </div>
                </Link>
              );
            })}

          </div>

        </div>
      </section>

    </div>
  );
}