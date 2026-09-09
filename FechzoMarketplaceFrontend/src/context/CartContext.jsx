import { createContext, useContext, useEffect, useState } from "react";

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
      return Math.max(0, Number(variant.stock) || 0);
    }

    return 0;
  }

  return Math.max(0, Number(item?.stock) || 0);
};

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("fechzo_cart");

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
        let quantity = Number(item.quantity) || 1;

        if (stock > 0) {
          quantity = Math.min(quantity, stock);
        }

        return {
          ...item,
          quantity: Math.max(1, quantity),
        };
      });
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Save cart
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      localStorage.setItem(
        "fechzo_cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cart]);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const addToCart = (product) => {
    if (!product?._id) {
      console.error("Cannot add product without _id");
      return;
    }

    const stock = getStock(product);

    /*
     * Don't add if completely out of stock
     */
    if (stock <= 0) {
      console.warn("Product is out of stock");
      return;
    }

    const cartItemId = getCartItemId(product);

    setCart((prev) => {
      const existing = prev.find(
        (item) => getCartItemId(item) === cartItemId
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
            getCartItemId(item) !== cartItemId
          ) {
            return item;
          }

          return {
            ...item,
            quantity: currentQuantity + 1,
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
  | REMOVE FROM CART
  |--------------------------------------------------------------------------
  */

  const removeFromCart = (cartItemId) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          getCartItemId(item) !== cartItemId
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
    const newQuantity = Number(quantity);

    /*
     * Invalid quantity
     */
    if (!Number.isFinite(newQuantity)) {
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
      prev.map((item) => {
        if (
          getCartItemId(item) !== cartItemId
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

        const safeQuantity = Math.min(
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
      }).filter(
        (item) => Number(item.quantity) > 0
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
      total + (Number(item.quantity) || 0),
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

      return total + price * quantity;
    },
    0
  );

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

        // Export helpers if needed elsewhere
        getCartItemId,
        getPrice,
        getStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

