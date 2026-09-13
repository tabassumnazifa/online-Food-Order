import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(
    location.state?.restaurantId || null
  );

  const [paymentMethod, setPaymentMethod] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:5079/api";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
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

      const cartItems = response.data;

      if (!cartItems || cartItems.length === 0) {
        setCart([]);
        setError("Your cart is empty.");
        return;
      }

      setCart(cartItems);

      if (location.state?.restaurantId) {
        setRestaurantId(location.state.restaurantId);
        return;
      }

      const firstItem = cartItems[0];

      const id =
        firstItem.restaurantId ||
        firstItem.RestaurantId;

      if (!id) {
        setError(
          "Could not determine the restaurant for this cart."
        );
        return;
      }

      setRestaurantId(id);
    } catch (error) {
      console.error("Checkout cart error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load checkout information."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  };

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
      0
  );

  const handlePlaceOrder = async () => {
    if (!restaurantId) {
      alert("Restaurant information is missing.");
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    // FIX: Validate the delivery address before placing the order
    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      // ==========================================
      // STEP 1: CREATE ORDER
      // ==========================================

      const orderResponse = await axios.post(
        `${API_URL}/Order/checkout`,
        {
          restaurantId: restaurantId,
          deliveryAddress: deliveryAddress.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const orderId = orderResponse.data?.orderId;

      if (!orderId) {
        throw new Error(
          "Order ID was not returned from the server."
        );
      }

      console.log(
        "Order created successfully:",
        orderResponse.data
      );

      // ==========================================
      // STEP 2: CREATE PAYMENT
      // ==========================================

      const paymentResponse = await axios.post(
        `${API_URL}/Payment/pay`,
        {
          orderId: orderId,
          paymentMethod: Number(paymentMethod),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Payment response:",
        paymentResponse.data
      );

      // ==========================================
      // STEP 3: ONLINE PAYMENT
      // ==========================================

      if (Number(paymentMethod) === 2) {
        const paymentUrl =
          paymentResponse.data?.paymentUrl;

        if (!paymentUrl) {
          throw new Error(
            "SSLCommerz payment URL was not returned."
          );
        }

        console.log(
          "Redirecting to SSLCommerz:",
          paymentUrl
        );

        window.location.href = paymentUrl;
        return;
      }

      // ==========================================
      // STEP 4: CASH ON DELIVERY
      // ==========================================

      alert(
        `Order placed successfully! Order #${orderId}`
      );

      navigate("/orders");
    } catch (error) {
      console.error(
        "Checkout/payment error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.message ||
            "Failed to place order or process payment.");

      alert(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <main className="customer-checkout-page">
        <div className="customer-checkout-container">
          <div className="customer-checkout-loading">
            <div className="customer-loading-spinner"></div>

            <h3>Preparing your checkout...</h3>

            <p>
              Please wait while we load your order.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="customer-checkout-page">
        <div className="customer-checkout-container">
          <section className="customer-checkout-error">
            <div className="customer-checkout-error-icon">
              !
            </div>

            <span className="customer-page-eyebrow">
              CHECKOUT
            </span>

            <h1>Unable to continue</h1>

            <p>{error}</p>

            <button
              type="button"
              className="customer-primary-btn"
              onClick={() => navigate("/cart")}
            >
              ← Back to Cart
            </button>
          </section>
        </div>
      </main>
    );
  }

  const total = calculateTotal();

  return (
    <main className="customer-checkout-page">
      <div className="customer-checkout-container">

        {/* HEADER */}

        <section className="customer-page-header customer-checkout-header">
          <div>
            <span className="customer-page-eyebrow">
              COMPLETE YOUR ORDER
            </span>

            <h1>Checkout</h1>

            <p>
              Review your order and select your preferred
              payment method.
            </p>
          </div>

          <div className="customer-checkout-count">
            <span>🛍️</span>

            <div>
              <strong>{totalItems}</strong>

              <small>
                {totalItems === 1
                  ? "item"
                  : "items"}
              </small>
            </div>
          </div>
        </section>

        {/* CHECKOUT LAYOUT */}

        <div className="customer-checkout-layout">

          {/* LEFT SIDE */}

          <section className="customer-checkout-main">

            {/* ORDER ITEMS */}

            <div className="customer-checkout-card">

              <div className="customer-checkout-card-heading">
                <div>
                  <span className="customer-page-eyebrow">
                    YOUR ORDER
                  </span>

                  <h2>Order Summary</h2>
                </div>

                <span className="customer-checkout-item-count">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="customer-checkout-items">

                {cart.map((item) => {
                  const itemTotal =
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

                  return (
                    <article
                      className="customer-checkout-item"
                      key={item.id}
                    >
                      <div className="customer-checkout-food-icon">
                        🍽️
                      </div>

                      <div className="customer-checkout-food-info">
                        <h3>
                          {item.foodName ||
                            "Food Item"}
                        </h3>

                        <p>
                          ৳
                          {Number(
                            item.price || 0
                          ).toLocaleString()}{" "}
                          × {item.quantity}
                        </p>
                      </div>

                      <strong className="customer-checkout-item-price">
                        ৳
                        {itemTotal.toLocaleString()}
                      </strong>
                    </article>
                  );
                })}

              </div>
            </div>

            {/* DELIVERY ADDRESS */}

            <div className="customer-checkout-card">

              <div className="customer-checkout-card-heading">
                <div>
                  <span className="customer-page-eyebrow">
                    DELIVERY
                  </span>

                  <h2>Delivery Address</h2>
                </div>

                <div className="customer-checkout-heading-icon">
                  📍
                </div>
              </div>

              <div className="customer-checkout-address-box">
                <div className="customer-checkout-address-icon">
                  📍
                </div>

                <div>
                  <strong>Delivery Location</strong>

                  <p>
                    Enter your delivery address to
                    receive your order.
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Enter your delivery address"
                className="customer-checkout-input"
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(e.target.value)
                }
              />
            </div>

            {/* PAYMENT METHOD */}

            <div className="customer-checkout-card">

              <div className="customer-checkout-card-heading">
                <div>
                  <span className="customer-page-eyebrow">
                    PAYMENT
                  </span>

                  <h2>Payment Method</h2>
                </div>

                <div className="customer-checkout-heading-icon">
                  💳
                </div>
              </div>

              <div className="customer-payment-options">

                <button
                  type="button"
                  className={`customer-payment-option ${
                    paymentMethod === "1"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("1")
                  }
                >
                  <div className="customer-payment-icon">
                    💵
                  </div>

                  <div className="customer-payment-info">
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives.
                    </span>
                  </div>

                  <div className="customer-payment-radio">
                    {paymentMethod === "1" && (
                      <span></span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={`customer-payment-option ${
                    paymentMethod === "2"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPaymentMethod("2")
                  }
                >
                  <div className="customer-payment-icon online">
                    💳
                  </div>

                  <div className="customer-payment-info">
                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      Pay securely through SSLCommerz.
                    </span>
                  </div>

                  <div className="customer-payment-radio">
                    {paymentMethod === "2" && (
                      <span></span>
                    )}
                  </div>
                </button>

              </div>
            </div>

          </section>

          {/* RIGHT SIDE SUMMARY */}

          <aside className="customer-checkout-summary">

            <div className="customer-checkout-summary-top">
              <span className="customer-page-eyebrow">
                ORDER TOTAL
              </span>

              <h2>Payment Summary</h2>
            </div>

            <div className="customer-checkout-summary-rows">

              <div>
                <span>
                  Items ({totalItems})
                </span>

                <strong>
                  ৳{total.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Delivery fee</span>

                <strong className="customer-checkout-free">
                  Calculated at checkout
                </strong>
              </div>

            </div>

            <div className="customer-checkout-divider"></div>

            <div className="customer-checkout-total">
              <span>Total</span>

              <strong>
                ৳{total.toLocaleString()}
              </strong>
            </div>

            <button
              type="button"
              className="customer-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? (
                <>
                  <span className="customer-checkout-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  Place Order
                  <span>→</span>
                </>
              )}
            </button>

            <div className="customer-checkout-security">
              <span>🔒</span>

              <div>
                <strong>Secure Checkout</strong>

                <p>
                  Your payment information is
                  securely processed.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="customer-back-cart-btn"
              onClick={() => navigate("/cart")}
            >
              ← Back to Cart
            </button>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Checkout;