import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5079/api";

  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/Cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "FULL CART RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      setCartItems(response.data || []);
    } catch (error) {
      console.error("Cart loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const message =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
            "Failed to load cart.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increaseQuantity = async (item) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${API_URL}/Cart/${item.id}`,
        {
          quantity: item.quantity + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchCart();
    } catch (error) {
      console.error("Increase quantity error:", error);

      alert(
        error.response?.data?.message ||
          "Could not update quantity."
      );
    }
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${API_URL}/Cart/${item.id}`,
        {
          quantity: item.quantity - 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchCart();
    } catch (error) {
      console.error("Decrease quantity error:", error);

      alert(
        error.response?.data?.message ||
          "Could not update quantity."
      );
    }
  };

  const removeItem = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/Cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCart();
    } catch (error) {
      console.error("Remove item error:", error);

      alert(
        error.response?.data?.message ||
          "Could not remove item."
      );
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return (
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0)
    );
  }, 0);

  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const restaurantId =
      cartItems[0]?.restaurantId;

    console.log(
      "Checkout Restaurant ID:",
      restaurantId
    );

    if (!restaurantId) {
      alert(
        "Restaurant information is missing from your cart."
      );

      console.error(
        "Cart item does not contain restaurantId:",
        cartItems[0]
      );

      return;
    }

    navigate("/checkout", {
      state: {
        restaurantId: restaurantId,
      },
    });
  };

  /* LOADING */

  if (loading) {
    return (
      <main className="customer-cart-page">
        <div className="customer-cart-container">

          <div className="customer-cart-loading">
            <div className="customer-loading-spinner"></div>

            <h3>Loading your cart...</h3>

            <p>
              Please wait while we fetch your cart items.
            </p>
          </div>

        </div>
      </main>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <main className="customer-cart-page">
        <div className="customer-cart-container">

          <section className="customer-cart-error">

            <div className="customer-cart-error-icon">
              !
            </div>

            <div>
              <span className="customer-page-eyebrow">
                SOMETHING WENT WRONG
              </span>

              <h2>Unable to load your cart</h2>

              <p>{error}</p>

              <button
                className="customer-primary-btn"
                onClick={fetchCart}
              >
                Try Again
              </button>
            </div>

          </section>

        </div>
      </main>
    );
  }

  /* EMPTY CART */

  if (cartItems.length === 0) {
    return (
      <main className="customer-cart-page">
        <div className="customer-cart-container">

          <section className="customer-cart-empty">

            <div className="customer-cart-empty-icon">
              🛒
            </div>

            <span className="customer-page-eyebrow">
              YOUR CART
            </span>

            <h1>Your cart is empty</h1>

            <p>
              You haven't added anything to your cart yet.
              Explore our restaurants and find something
              delicious.
            </p>

            <button
              className="customer-primary-btn"
              onClick={() => navigate("/restaurants")}
            >
              <span>🍔</span>
              Browse Restaurants
            </button>

          </section>

        </div>
      </main>
    );
  }

  /* CART */

  return (
    <main className="customer-cart-page">
      <div className="customer-cart-container">

        {/* HEADER */}

        <section className="customer-page-header customer-cart-header">

          <div>
            <span className="customer-page-eyebrow">
              YOUR ORDER
            </span>

            <h1>My Cart</h1>

            <p>
              Review your items before proceeding to checkout.
            </p>
          </div>

          <div className="customer-cart-item-count">
            <span>🛒</span>

            <div>
              <strong>{totalItems}</strong>
              <small>
                {totalItems === 1
                  ? "item in cart"
                  : "items in cart"}
              </small>
            </div>
          </div>

        </section>

        {/* CART LAYOUT */}

        <div className="customer-cart-layout">

          {/* ITEMS */}

          <section className="customer-cart-items">

            <div className="customer-cart-section-header">
              <div>
                <h2>Cart Items</h2>
                <p>
                  {cartItems.length}{" "}
                  {cartItems.length === 1
                    ? "food item"
                    : "food items"}
                </p>
              </div>
            </div>

            <div className="customer-cart-list">

              {cartItems.map((item) => {

                const itemTotal =
                  Number(item.price || 0) *
                  Number(item.quantity || 0);

                return (
                  <article
                    className="customer-cart-item-card"
                    key={item.id}
                  >

                    {/* FOOD ICON */}

                    <div className="customer-cart-food-icon">
                      🍽️
                    </div>

                    {/* FOOD INFO */}

                    <div className="customer-cart-food-info">

                      <span className="customer-cart-food-label">
                        FOOD ITEM
                      </span>

                      <h3>
                        {item.foodName}
                      </h3>

                      <p>
                        ৳
                        {Number(
                          item.price || 0
                        ).toLocaleString()}{" "}
                        per item
                      </p>

                    </div>

                    {/* QUANTITY */}

                    <div className="customer-cart-quantity">

                      <span>Quantity</span>

                      <div className="customer-quantity-control">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <strong>
                          {item.quantity}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>

                    </div>

                    {/* TOTAL */}

                    <div className="customer-cart-item-total">

                      <span>Total</span>

                      <strong>
                        ৳
                        {itemTotal.toLocaleString()}
                      </strong>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="customer-cart-remove"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      aria-label={`Remove ${item.foodName}`}
                    >
                      🗑️
                    </button>

                  </article>
                );
              })}

            </div>

            <button
              className="customer-continue-shopping"
              onClick={() => navigate("/restaurants")}
            >
              ← Continue Shopping
            </button>

          </section>

          {/* SUMMARY */}

          <aside className="customer-cart-summary">

            <div className="customer-cart-summary-heading">

              <span className="customer-page-eyebrow">
                ORDER SUMMARY
              </span>

              <h2>Cart Total</h2>

            </div>

            <div className="customer-cart-summary-rows">

              <div>
                <span>
                  Items ({totalItems})
                </span>

                <strong>
                  ৳{cartTotal.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Delivery fee</span>

                <strong className="customer-free-delivery">
                  Calculated at checkout
                </strong>
              </div>

            </div>

            <div className="customer-cart-summary-divider"></div>

            <div className="customer-cart-grand-total">

              <span>Subtotal</span>

              <strong>
                ৳{cartTotal.toLocaleString()}
              </strong>

            </div>

            <button
              className="customer-checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <span>→</span>
            </button>

            <div className="customer-cart-security">
              <span>🔒</span>

              <p>
                Secure checkout with protected
                payment processing.
              </p>
            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}

export default Cart;