import { useEffect, useState } from "react";
import axios from "axios";

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // FETCH RESTAURANT ORDERS
  // =========================
  const fetchOrders = async () => {
    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Restaurant orders:", response.data);

      setOrders(response.data);
    } catch (error) {
      console.error("Orders Error:", error);

      if (error.response?.status === 401) {
        setError(
          "You are not authorized to view restaurant orders."
        );
      } else {
        setError(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to load restaurant orders."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:5079/api/Restaurant/update-order-status/${orderId}`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Order status updated successfully.");

      fetchOrders();
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to update order status."
      );
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="container">
        <h1>📦 Restaurant Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="container">
        <h1>📦 Restaurant Orders</h1>
        <p>{error}</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="container">

      <h1>📦 Restaurant Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">

          {orders.map((order) => (
            <div
              className="order-card"
              key={order.orderId}
            >

              <h2>
                Order #{order.orderId}
              </h2>

              <p>
                <strong>Customer ID:</strong>{" "}
                {order.customerId}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  order.orderDate
                ).toLocaleString()}
              </p>

              <p>
                <strong>Total:</strong>{" "}
                ৳{order.totalAmount}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order.status}
              </p>

              {/* ========================= */}
              {/* STATUS UPDATE */}
              {/* ========================= */}

              <div className="order-status-control">

                <label>
                  Update Status:
                </label>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      order.orderId,
                      e.target.value
                    )
                  }
                >

                  <option value="Placed">
                    Placed
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Preparing">
                    Preparing
                  </option>

                  <option value="Ready">
                    Ready
                  </option>

                  <option value="PickedUp">
                    Picked Up
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default RestaurantOrders;