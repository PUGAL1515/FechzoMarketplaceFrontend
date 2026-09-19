import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getVariant = (item) => {
  return item?.selectedVariant || null;
};

const getVariantId = (item) => {
  const variant = getVariant(item);

  return (
    item?.variantId ||
    variant?._id ||
    variant?.sku ||
    "default"
  );
};

const getCartItemId = (item) => {
  return `${item?._id}-${getVariantId(item)}`;
};

const getPrice = (item) => {
  const variant = getVariant(item);

  // Variant price has highest priority
  if (
    variant?.price !== undefined &&
    variant?.price !== null &&
    variant?.price !== ""
  ) {
    return Number(variant.price) || 0;
  }

  // Product discount price
  if (
    item?.discountPrice !== undefined &&
    item?.discountPrice !== null &&
    Number(item.discountPrice) > 0
  ) {
    return Number(item.discountPrice);
  }

  return Number(item?.price || 0);
};

const getStock = (item) => {
  const variant = getVariant(item);

  // If a variant is selected, use variant stock
  if (variant) {
    if (
      variant.stock !== undefined &&
      variant.stock !== null &&
      variant.stock !== ""
    ) {
      return Math.max(
        0,
        Number(variant.stock) || 0
      );
    }

    return 0;
  }

  return Math.max(
    0,
    Number(item?.stock) || 0
  );
};

/*
|--------------------------------------------------------------------------
| Store Helpers
|--------------------------------------------------------------------------
*/

const getStoreId = (item) => {
  const storeId =
    item?.storeId?._id ??
    item?.storeId?.id ??
    item?.storeId ??
    item?.store?._id ??
    item?.store?.id ??
    item?.store?._id ??
    item?.store;

  if (
    storeId === null ||
    storeId === undefined ||
    storeId === ""
  ) {
    return "";
  }

  return String(storeId);
};

const getStoreName = (item) => {
  return (
    item?.storeId?.storeName ||
    item?.store?.storeName ||
    item?.storeName ||
    "Store"
  );
};

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("fechzo_cart");

      if (!savedCart) {
        return [];
      }

      const parsed = JSON.parse(savedCart);

      if (!Array.isArray(parsed)) {
        return [];
      }

      /*
       * Normalize old cart data
       * and make sure quantity is valid.
       */
      return parsed.map((item) => {
        const stock = getStock(item);

        let quantity =
          Number(item.quantity) || 1;

        if (stock > 0) {
          quantity = Math.min(
            quantity,
            stock
          );
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            quantity
          ),
        };
      });
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      return [];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Store Conflict Popup State
  |--------------------------------------------------------------------------
  */

  const [storeConflict, setStoreConflict] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Save Cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      localStorage.setItem(
        "fechzo_cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart]);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const addToCart = (product) => {
    if (!product?._id) {
      console.error(
        "Cannot add product without _id"
      );

      return;
    }

    const stock = getStock(product);

    /*
     * Don't add if completely out of stock
     */
    if (stock <= 0) {
      console.warn(
        "Product is out of stock"
      );

      return;
    }

    /*
     * New product store
     */
    const newStoreId = getStoreId(product);

    /*
     * Existing cart store
     *
     * Since only one store is allowed,
     * we check the first cart item.
     */
    const existingStoreId =
      cart.length > 0
        ? getStoreId(cart[0])
        : "";

    /*
     |--------------------------------------------------------------------------
     | DIFFERENT STORE CHECK
     |--------------------------------------------------------------------------
     */

    if (
      cart.length > 0 &&
      newStoreId &&
      existingStoreId &&
      newStoreId !== existingStoreId
    ) {
      setStoreConflict({
        product,
        existingStoreName:
          getStoreName(cart[0]),
        newStoreName:
          getStoreName(product),
      });

      return;
    }

    /*
     |--------------------------------------------------------------------------
     | SAME STORE / EMPTY CART
     |--------------------------------------------------------------------------
     */

    const cartItemId =
      getCartItemId(product);

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          getCartItemId(item) ===
          cartItemId
      );

      /*
       * Existing same product + same variant
       */
      if (existing) {
        const currentQuantity =
          Number(existing.quantity) || 1;

        /*
         * Don't exceed stock
         */
        if (currentQuantity >= stock) {
          return prev;
        }

        return prev.map((item) => {
          if (
            getCartItemId(item) !==
            cartItemId
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              currentQuantity + 1,
          };
        });
      }

      /*
       * New product / new variant
       */
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW CART FROM STORE CONFLICT
  |--------------------------------------------------------------------------
  */

 const viewCartFromConflict = () => {
  setStoreConflict(null);
  window.location.href = "/cart";
};

  /*
  |--------------------------------------------------------------------------
  | REMOVE OLD STORE ITEMS + ADD NEW PRODUCT
  |--------------------------------------------------------------------------
  */

  const replaceCartWithProduct = () => {
    if (!storeConflict?.product) {
      setStoreConflict(null);

      return;
    }

    const product = storeConflict.product;

    const stock = getStock(product);

    if (stock <= 0) {
      setStoreConflict(null);

      console.warn(
        "Product is out of stock"
      );

      return;
    }

    /*
     * Clear current cart and add
     * the new product.
     */
    setCart([
      {
        ...product,
        quantity: 1,
      },
    ]);

    /*
     * Close popup
     */
    setStoreConflict(null);
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL STORE CONFLICT
  |--------------------------------------------------------------------------
  */

  const cancelStoreChange = () => {
    setStoreConflict(null);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE FROM CART
  |--------------------------------------------------------------------------
  */

  const removeFromCart = (cartItemId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          getCartItemId(item) !==
          cartItemId
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE QUANTITY
  |--------------------------------------------------------------------------
  */

  const updateQuantity = (
    cartItemId,
    quantity
  ) => {
    const newQuantity =
      Number(quantity);

    /*
     * Invalid quantity
     */
    if (
      !Number.isFinite(newQuantity)
    ) {
      return;
    }

    /*
     * Remove if quantity becomes 0
     */
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);

      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (
            getCartItemId(item) !==
            cartItemId
          ) {
            return item;
          }

          const stock = getStock(item);

          /*
           * Never allow quantity above stock
           */
          if (stock <= 0) {
            return {
              ...item,
              quantity: 0,
            };
          }

          const safeQuantity =
            Math.min(
              newQuantity,
              stock
            );

          return {
            ...item,
            quantity: Math.max(
              1,
              safeQuantity
            ),
          };
        })
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR CART
  |--------------------------------------------------------------------------
  */

  const clearCart = () => {
    setCart([]);
  };

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0),
    0
  );

  /*
  |--------------------------------------------------------------------------
  | CART TOTAL
  |--------------------------------------------------------------------------
  */

  const cartTotal = cart.reduce(
    (total, item) => {
      const price = getPrice(item);

      const quantity =
        Number(item.quantity) || 0;

      return (
        total +
        price * quantity
      );
    },
    0
  );

  /*
  |--------------------------------------------------------------------------
  | STORE CONFLICT MODAL
  |--------------------------------------------------------------------------
  */

  const StoreConflictModal = () => {
    if (!storeConflict) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
        onClick={cancelStoreChange}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-600"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-bold text-gray-900">
            Different Store
          </h2>

          {/* Message */}
          <p className="mt-3 text-center text-sm leading-6 text-gray-600">
            Your cart already contains
            products from{" "}
            <span className="font-semibold text-gray-900">
              {storeConflict.existingStoreName}
            </span>
            .
          </p>

          <p className="mt-2 text-center text-sm leading-6 text-gray-600">
            You are trying to add a
            product from{" "}
            <span className="font-semibold text-gray-900">
              {storeConflict.newStoreName}
            </span>
            .
          </p>

          <p className="mt-3 text-center text-sm font-medium text-gray-800">
            Do you want to remove the
            existing cart items and add
            this product?
          </p>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {/* View Cart */}
            <button
              type="button"
              onClick={
                viewCartFromConflict
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              View Cart
            </button>

            {/* Remove & Add */}
            <button
              type="button"
              onClick={
                replaceCartWithProduct
              }
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Remove & Add New Product
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={
                cancelStoreChange
              }
              className="w-full px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider
  |--------------------------------------------------------------------------
  */

  return (
    <CartContext.Provider
      value={{
        cart,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        cartCount,

        cartTotal,

        // Store conflict controls
        storeConflict,
        viewCartFromConflict,
        replaceCartWithProduct,
        cancelStoreChange,

        // Export helpers if needed elsewhere
        getCartItemId,
        getPrice,
        getStock,
        getStoreId,
        getStoreName,
      }}
    >
      {children}

      {/* Global Store Conflict Popup */}
      <StoreConflictModal />
    </CartContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};