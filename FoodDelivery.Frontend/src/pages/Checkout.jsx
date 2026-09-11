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

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

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
        total + item.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = async () => {
    if (!restaurantId) {
      alert("Restaurant information is missing.");
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      // =========================
      // STEP 1: CREATE ORDER
      // =========================

      const orderResponse = await axios.post(
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

      const orderId = orderResponse.data?.orderId;

      if (!orderId) {
        throw new Error("Order ID was not returned.");
      }

      console.log("Order created:", orderResponse.data);

      // =========================
      // STEP 2: CREATE PAYMENT
      // =========================

      const paymentResponse = await axios.post(
        "http://localhost:5079/api/Payment/pay",
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

      console.log("Payment response:", paymentResponse.data);

      // =========================
      // ONLINE PAYMENT
      // =========================

      if (Number(paymentMethod) === 2) {
        const paymentUrl =
          paymentResponse.data?.paymentUrl;

        if (!paymentUrl) {
          throw new Error(
            "Online payment URL was not returned."
          );
        }

        window.location.href = paymentUrl;
        return;
      }

      // =========================
      // CASH ON DELIVERY
      // =========================

      alert(
        `Order placed successfully! Order #${orderId}`
      );

      navigate("/orders");

    } catch (error) {
      console.error("Checkout/payment error:", error);

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
      <div className="container">
        <h1>🧾 Checkout</h1>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>🧾 Checkout</h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/cart")}
        >
          ← Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🧾 Checkout</h1>

      <div className="checkout-card">
        <h2>Your Order</h2>

        {cart.map((item) => (
          <div
            className="checkout-item"
            key={item.id}
          >
            <div>
              <h3>
                {item.foodName || "Food Item"}
              </h3>

              <p>
                ৳{item.price} × {item.quantity}
              </p>
            </div>

            <strong>
              ৳{item.price * item.quantity}
            </strong>
          </div>
        ))}

        <hr />

        <div className="checkout-total">
          <h2>Total</h2>

          <h2>
            ৳{calculateTotal()}
          </h2>
        </div>

        <div className="checkout-section">
          <h3>📍 Delivery Address</h3>

          <input
            type="text"
            placeholder="Enter your delivery address"
            className="checkout-input"
          />
        </div>

        <div className="checkout-section">
          <h3>💳 Payment Method</h3>

          <select
            className="checkout-input"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
          >
            <option value="1">
              Cash on Delivery
            </option>

            <option value="2">
              Online Payment
            </option>
          </select>
        </div>

        <button
          type="button"
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder
            ? "Processing..."
            : "🛍️ Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
