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

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CART
  // =========================
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

      const response = await axios.get(
        "http://localhost:5079/api/Cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Checkout Cart Response:", response.data);

      const cartItems = response.data;

      if (!cartItems || cartItems.length === 0) {
        setCart([]);
        setError("Your cart is empty.");
        return;
      }

      setCart(cartItems);

      // =========================
      // GET RESTAURANT ID
      // =========================

      // First use the ID passed from Cart.jsx
      if (location.state?.restaurantId) {
        console.log(
          "Restaurant ID from Cart:",
          location.state.restaurantId
        );

        setRestaurantId(location.state.restaurantId);
        return;
      }

      // Fallback: get it directly from cart response
      const firstItem = cartItems[0];

      const id =
        firstItem.restaurantId ||
        firstItem.RestaurantId;

      if (!id) {
        console.error(
          "Restaurant ID missing from cart item:",
          firstItem
        );

        setError(
          "Could not determine the restaurant for this cart."
        );

        return;
      }

      console.log(
        "Restaurant ID from cart response:",
        id
      );

      setRestaurantId(id);

    } catch (error) {
      console.error(
        "Checkout cart error:",
        error
      );

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

  // =========================
  // CALCULATE TOTAL
  // =========================
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  };

  // =========================
  // PLACE ORDER
  // =========================
  const handlePlaceOrder = async () => {
    if (!restaurantId) {
      alert(
        "Restaurant information is missing."
      );
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      console.log(
        "Placing order for restaurant:",
        restaurantId
      );

      const response = await axios.post(
        "http://localhost:5079/api/Order/checkout",
        {
          restaurantId: restaurantId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Checkout response:",
        response.data
      );

      const orderId =
        response.data?.orderId;

      alert(
        orderId
          ? `Order placed successfully! Order #${orderId}`
          : "Order placed successfully!"
      );

      // Cart is automatically cleared by backend
      // after successful checkout.

      navigate("/orders");

    } catch (error) {
      console.error(
        "Checkout error:",
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
          : "Failed to place order.");

      alert(message);

    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="container">

        <h1>🧾 Checkout</h1>

        <p>
          Loading checkout...
        </p>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="container">

        <h1>🧾 Checkout</h1>

        <p>
          {error}
        </p>

        <button
          onClick={() =>
            navigate("/cart")
          }
        >
          ← Back to Cart
        </button>

      </div>
    );
  }

  // =========================
  // CHECKOUT PAGE
  // =========================
  return (
    <div className="container">

      <h1>🧾 Checkout</h1>

      <div className="checkout-card">

        <h2>
          Your Order
        </h2>

        {cart.map((item) => (
          <div
            className="checkout-item"
            key={item.id}
          >

            <div>

              <h3>
                {item.foodName ||
                  "Food Item"}
              </h3>

              <p>
                ৳{item.price} ×{" "}
                {item.quantity}
              </p>

            </div>

            <strong>
              ৳
              {item.price *
                item.quantity}
            </strong>

          </div>
        ))}

        <hr />

        {/* ========================= */}
        {/* TOTAL */}
        {/* ========================= */}

        <div className="checkout-total">

          <h2>
            Total
          </h2>

          <h2>
            ৳{calculateTotal()}
          </h2>

        </div>

        {/* ========================= */}
        {/* DELIVERY ADDRESS */}
        {/* ========================= */}

        <div className="checkout-section">

          <h3>
            📍 Delivery Address
          </h3>

          <input
            type="text"
            placeholder="Enter your delivery address"
            className="checkout-input"
          />

        </div>

        {/* ========================= */}
        {/* PAYMENT */}
        {/* ========================= */}

        <div className="checkout-section">

          <h3>
            💳 Payment Method
          </h3>

          <select
            className="checkout-input"
          >

            <option value="CashOnDelivery">
              Cash on Delivery
            </option>

            <option
              value="OnlinePayment"
              disabled
            >
              Online Payment
            </option>

          </select>

        </div>

        {/* ========================= */}
        {/* PLACE ORDER */}
        {/* ========================= */}

        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={placingOrder}
        >

          {placingOrder
            ? "Placing Order..."
            : "🛍️ Place Order"}

        </button>

      </div>

    </div>
  );
}

export default Checkout;