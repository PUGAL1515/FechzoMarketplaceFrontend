import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!cart.length) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-items">
        {cart.map((item) => {
          const price =
            item.discountPrice > 0
              ? item.discountPrice
              : item.price;

          return (
            <div
              className="cart-item"
              key={item._id}
            >
              <img
                src={item.images?.[0]}
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>

                <p>₹{price}</p>

                <div className="quantity">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item._id,
                        item.quantity - 1
                      )
                    }
                  >
                    -
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item._id,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() =>
                    removeFromCart(item._id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <h2>Total: ₹{cartTotal}</h2>

        <button>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}