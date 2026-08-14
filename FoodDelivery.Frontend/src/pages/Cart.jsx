import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5079/api";

  // =========================
  // FETCH CART
  // =========================
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

      const response = await axios.get(
        `${API_URL}/Cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show complete response in browser console
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

  // =========================
  // LOAD CART ON PAGE LOAD
  // =========================
  useEffect(() => {
    fetchCart();
  }, []);

  // =========================
  // INCREASE QUANTITY
  // =========================
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
      console.error(
        "Increase quantity error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not update quantity."
      );
    }
  };

  // =========================
  // DECREASE QUANTITY
  // =========================
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
      console.error(
        "Decrease quantity error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not update quantity."
      );
    }
  };

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${API_URL}/Cart/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      console.error(
        "Remove item error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not remove item."
      );
    }
  };

  // =========================
  // CALCULATE CART TOTAL
  // =========================
  const cartTotal = cartItems.reduce(
    (total, item) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0)
      );
    },
    0
  );

  // =========================
  // CHECKOUT
  // =========================
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // RestaurantId should come from CartItemResponseDto
    const restaurantId =
      cartItems[0]?.restaurantId;

    console.log(
      "Checkout Restaurant ID:",
      restaurantId
    );

    // Make sure restaurant ID exists
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

    // Go to checkout and pass restaurant ID
    navigate("/checkout", {
      state: {
        restaurantId: restaurantId,
      },
    });
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="container">
        <h1>🛒 My Cart</h1>
        <p>Loading cart...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="container">
        <h1>🛒 My Cart</h1>

        <p>{error}</p>

        <button onClick={fetchCart}>
          Try Again
        </button>
      </div>
    );
  }

  // =========================
  // EMPTY CART
  // =========================
  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h1>🛒 My Cart</h1>

        <p>Your cart is empty.</p>

        <button
          onClick={() =>
            navigate("/restaurants")
          }
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  // =========================
  // CART UI
  // =========================
  return (
    <div className="container">

      <h1>🛒 My Cart</h1>

      <div className="cart-list">

        {cartItems.map((item) => (
          <div
            className="cart-item"
            key={item.id}
          >

            <h2>
              {item.foodName}
            </h2>

            <p>
              Price: ৳{item.price}
            </p>

            <div className="quantity-controls">

              <button
                onClick={() =>
                  decreaseQuantity(item)
                }
                disabled={item.quantity <= 1}
              >
                −
              </button>

              <span>
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  increaseQuantity(item)
                }
              >
                +
              </button>

            </div>

            <p>
              Total: ৳
              {Number(item.price) *
                Number(item.quantity)}
            </p>

            <button
              onClick={() =>
                removeItem(item.id)
              }
            >
              🗑️ Remove
            </button>

          </div>
        ))}

      </div>

      <hr />

      <h2>
        Cart Total: ৳{cartTotal}
      </h2>

      <button
        onClick={handleCheckout}
      >
        Proceed to Checkout
      </button>

    </div>
  );
}

export default Cart;