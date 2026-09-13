import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ 1. IMPORT THE RIDER GPS TRACKER COMPONENT
import RiderLocationTracker from "../components/RiderLocationTracker";

function RiderOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Rider/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (error) {
      console.error("Rider Orders Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as a delivery rider.");
        return;
      }

      setError("Failed to load your deliveries.");
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return {
          value: "ReadyForPickup",
          label: "Ready for Pickup",
        };

      case "readyforpickup":
        return {
          value: "OutForDelivery",
          label: "Out for Delivery",
        };

      case "outfordelivery":
        return {
          value: "Delivered",
          label: "Mark as Delivered",
        };

      default:
        return null;
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdating(orderId);

      await axios.put(
        `http://localhost:5079/api/Rider/update-delivery-status/${orderId}`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Delivery status updated successfully.");

      await fetchOrders();
    } catch (error) {
      console.error("Delivery Status Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to update delivery status."
      );

      await fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  if (loading) {
    return (
      <div className="rider-orders-page">
        <div className="rider-orders-container">
          <div className="rider-loading">
            <div className="rider-loading-spinner"></div>

            <h2>Loading your deliveries...</h2>

            <p>
              Getting your assigned orders ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-orders-page">
        <div className="rider-orders-container">
          <div className="rider-error-card">
            <div className="rider-error-icon">⚠️</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              type="button"
              className="rider-primary-btn"
              onClick={() => navigate("/rider/dashboard")}
            >
              ← Rider Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rider-orders-page">
      <div className="rider-orders-container">

        {/* Header */}
        <section className="rider-orders-header">
          <div>
            <p className="rider-dashboard-eyebrow">
              DELIVERY CENTER
            </p>

            <h1>My Deliveries</h1>

            <p className="rider-dashboard-subtitle">
              Manage your assigned orders and update their delivery status.
            </p>
          </div>

          <div className="rider-header-icon">
            🛵
          </div>
        </section>

        {/* Toolbar */}
        <div className="rider-orders-toolbar">
          <div className="rider-orders-count">
            <span className="rider-orders-count-icon">
              🚚
            </span>

            <div>
              <strong>{orders.length}</strong>

              <span>
                {orders.length === 1
                  ? " assigned delivery"
                  : " assigned deliveries"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="rider-secondary-btn"
            onClick={() => navigate("/rider/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="rider-empty-card">
            <div className="rider-empty-icon">
              📭
            </div>

            <h2>No Assigned Deliveries</h2>

            <p>
              You don't have any assigned deliveries right now.
              Check the available orders section for new orders.
            </p>

            <button
              type="button"
              className="rider-primary-btn"
              onClick={() => navigate("/rider/available-orders")}
            >
              📦 Find Available Orders
            </button>
          </div>
        ) : (
          <div className="rider-orders-grid">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const isOutForDelivery = order.status?.toLowerCase() === "outfordelivery";

              return (
                <article
                  className="rider-order-card"
                  key={order.orderId}
                >
                  {/* Card Header */}
                  <div className="rider-order-card-top">
                    <div>
                      <span className="rider-order-label">
                        DELIVERY
                      </span>

                      <h2>
                        #{order.orderId}
                      </h2>
                    </div>

                    <span className="rider-order-status">
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="rider-order-divider"></div>

                  {/* Details */}
                  <div className="rider-order-details">
                    <div className="rider-order-detail">
                      <span className="rider-detail-icon">
                        🏪
                      </span>

                      <div>
                        <span className="rider-detail-label">
                          Restaurant
                        </span>

                        <strong>
                          {order.restaurantName ||
                            "Unknown Restaurant"}
                        </strong>
                      </div>
                    </div>

                    <div className="rider-order-detail">
                      <span className="rider-detail-icon">
                        📍
                      </span>

                      <div>
                        <span className="rider-detail-label">
                          Pickup Address
                        </span>

                        <strong>
                          {order.restaurantAddress ||
                            "Address unavailable"}
                        </strong>
                      </div>
                    </div>

                    <div className="rider-order-detail">
                      <span className="rider-detail-icon">
                        🕐
                      </span>

                      <div>
                        <span className="rider-detail-label">
                          Order Time
                        </span>

                        <strong>
                          {formatDate(order.orderDate)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* ✅ 2. LIVE GPS TRACKING COMPONENT (Only shows when Out For Delivery) */}
                  {isOutForDelivery && (
                    <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                      <RiderLocationTracker 
                        orderId={order.orderId} 
                        status={order.status} 
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="rider-order-footer">
                    <div className="rider-order-amount">
                      <span>Total Amount</span>

                      <strong>
                        ৳{formatAmount(order.totalAmount)}
                      </strong>
                    </div>

                    {nextStatus && (
                      <button
                        type="button"
                        className="rider-accept-btn"
                        onClick={() =>
                          handleStatusUpdate(
                            order.orderId,
                            nextStatus.value
                          )
                        }
                        disabled={
                          updating === order.orderId
                        }
                      >
                        {updating === order.orderId
                          ? "Updating..."
                          : nextStatus.label}
                      </button>
                    )}

                    {order.status?.toLowerCase() ===
                      "delivered" && (
                      <span className="rider-delivered-badge">
                        ✓ Delivered
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default RiderOrders;