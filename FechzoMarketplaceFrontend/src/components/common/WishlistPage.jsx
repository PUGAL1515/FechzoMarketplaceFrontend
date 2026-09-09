import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "/api/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWishlist(response?.data?.wishlist || []);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeWishlist = async (productId, variantId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete("/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          productId,
          variantId: variantId || null,
        },
      });

      setWishlist((prev) =>
        prev.filter(
          (item) =>
            String(item.productId?._id) !==
              String(productId) ||
            String(item.variantId || "") !==
              String(variantId || "")
        )
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] p-4">
        <div className="max-w-6xl mx-auto bg-white p-6">
          Loading wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-5">
      <div className="max-w-6xl mx-auto px-3">

        <div className="bg-white border border-gray-200">
          <div className="px-5 py-4 border-b flex items-center gap-2">
            <Heart
              size={21}
              className="fill-red-500 text-red-500"
            />

            <h1 className="text-xl font-semibold">
              My Wishlist
            </h1>

            <span className="text-sm text-gray-500">
              ({wishlist.length})
            </span>
          </div>

          {wishlist.length === 0 ? (
            <div className="py-20 text-center">

              <Heart
                size={60}
                className="mx-auto text-gray-300"
              />

              <h2 className="text-lg font-semibold mt-5">
                Your Wishlist is Empty
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Save your favourite products here.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-5 bg-[#2874f0] text-white px-7 py-3 font-semibold rounded-sm"
              >
                Continue Shopping
              </button>

            </div>
          ) : (
            <div className="divide-y">

              {wishlist.map((item) => {
                const product = item.productId;

                const image =
                  product?.thumbnail ||
                  product?.images?.[0];

                const price =
                  product?.price ||
                  product?.variants?.[0]?.price ||
                  0;

                const mrp =
                  product?.mrp ||
                  product?.variants?.[0]?.mrp ||
                  price;

                return (
                  <div
                    key={item._id}
                    className="p-5 flex gap-5"
                  >

                    <div
                      className="w-36 h-36 shrink-0 flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/product/${product?._id}`
                        )
                      }
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product?.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="bg-gray-100 w-full h-full" />
                      )}
                    </div>

                    <div className="flex-1">

                      <h2
                        className="text-lg font-medium hover:text-[#2874f0] cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/product/${product?._id}`
                          )
                        }
                      >
                        {product?.name}
                      </h2>

                      <div className="mt-3 flex items-center gap-3">

                        <span className="text-xl font-semibold">
                          ₹
                          {Number(price).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {Number(mrp) > Number(price) && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹
                              {Number(mrp).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            <span className="text-sm text-green-600 font-semibold">
                              {Math.round(
                                ((Number(mrp) -
                                  Number(price)) /
                                  Number(mrp)) *
                                  100
                              )}
                              % off
                            </span>
                          </>
                        )}

                      </div>

                      <div className="mt-5 flex gap-3">

                        <button
                          onClick={() =>
                            navigate(
                              `/product/${product?._id}`
                            )
                          }
                          className="flex items-center gap-2 bg-[#ff9f00] text-white px-5 py-2.5 font-semibold text-sm"
                        >
                          <ShoppingCart size={17} />
                          VIEW PRODUCT
                        </button>

                        <button
                          onClick={() =>
                            removeWishlist(
                              product?._id,
                              item?.variantId
                            )
                          }
                          className="flex items-center gap-2 border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                        >
                          <Trash2 size={17} />
                          REMOVE
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}