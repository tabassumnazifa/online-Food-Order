
import { useEffect, useState } from "react";
import axios from "axios";

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

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
  // GET CURRENT STATUS
  // =========================

  const getCurrentStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    const normalized = status.toLowerCase();

    switch (normalized) {
      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "preparing":
        return "Preparing";

      case "readyforpickup":
        return "ReadyForPickup";

      case "outfordelivery":
        return "OutForDelivery";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  // =========================
  // GET ALLOWED NEXT STATUSES
  // =========================

  const getAllowedStatuses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return ["Pending", "Accepted"];

      case "accepted":
        return ["Accepted", "Preparing"];

      case "preparing":
        return ["Preparing", "ReadyForPickup"];

      case "readyforpickup":
        return ["ReadyForPickup"];

      case "outfordelivery":
        return ["OutForDelivery"];

      case "delivered":
        return ["Delivered"];

      case "cancelled":
        return ["Cancelled"];

      default:
        return [status];
    }
  };

  // =========================
  // CHECK IF RESTAURANT CAN UPDATE
  // =========================

  const canUpdateStatus = (status) => {
    const normalized = status?.toLowerCase();

    return (
      normalized === "pending" ||
      normalized === "accepted" ||
      normalized === "preparing"
    );
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateOrderStatus = async (orderId, status) => {
    if (!status) {
      return;
    }

    try {
      setUpdating(orderId);

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

      await fetchOrders();
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to update order status."
      );

      await fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  // =========================
  // FORMAT STATUS
  // =========================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
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

        <button type="button" onClick={fetchOrders}>
          Try Again
        </button>
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
          {orders.map((order) => {
            const currentStatus = getCurrentStatus(order.status);

            const allowedStatuses =
              getAllowedStatuses(order.status);

            const restaurantCanUpdate =
              canUpdateStatus(order.status);

            return (
              <div
                className="order-card"
                key={order.orderId}
              >
                <h2>Order #{order.orderId}</h2>

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
                  ৳
                  {Number(
                    order.totalAmount || 0
                  ).toFixed(2)}
                </p>

                {/* =========================
                    STATUS DROPDOWN
                    ========================= */}

                <div className="order-status-control">
                  <label
                    htmlFor={`status-${order.orderId}`}
                  >
                    <strong>Order Status:</strong>
                  </label>

                  <select
                    id={`status-${order.orderId}`}
                    value={currentStatus}
                    disabled={
                      !restaurantCanUpdate ||
                      updating === order.orderId
                    }
                    onChange={(e) => {
                      const newStatus = e.target.value;

                      if (
                        newStatus &&
                        newStatus !== currentStatus
                      ) {
                        updateOrderStatus(
                          order.orderId,
                          newStatus
                        );
                      }
                    }}
                  >
                    {allowedStatuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  {updating === order.orderId && (
                    <span className="status-updating">
                      Updating...
                    </span>
                  )}
                </div>

                {/* =========================
                    READY FOR PICKUP
                    ========================= */}

                {currentStatus.toLowerCase() ===
                  "readyforpickup" && (
                  <div className="order-status-message">
                    🛵 Ready for pickup — waiting for a
                    delivery rider.
                  </div>
                )}

                {/* =========================
                    OUT FOR DELIVERY
                    ========================= */}

                {currentStatus.toLowerCase() ===
                  "outfordelivery" && (
                  <div className="order-status-message">
                    🛵 Order is out for delivery.
                  </div>
                )}

                {/* =========================
                    DELIVERED
                    ========================= */}

                {currentStatus.toLowerCase() ===
                  "delivered" && (
                  <div className="order-status-message">
                    ✅ Order delivered successfully.
                  </div>
                )}

                {/* =========================
                    CANCELLED
                    ========================= */}

                {currentStatus.toLowerCase() ===
                  "cancelled" && (
                  <div className="order-status-message">
                    ❌ Order cancelled.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RestaurantOrders;
