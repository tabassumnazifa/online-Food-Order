import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AvailableOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
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
        "http://localhost:5079/api/Rider/available-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (error) {
      console.error("Available Orders Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as a delivery rider.");
        return;
      }

      setError("Failed to load available orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      setAccepting(orderId);

      await axios.put(
        `http://localhost:5079/api/Rider/accept-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order accepted successfully.");

      await fetchOrders();
    } catch (error) {
      console.error("Accept Order Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to accept order."
      );

      await fetchOrders();
    } finally {
      setAccepting(null);
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

  if (loading) {
    return (
      <div className="rider-orders-page">
        <div className="rider-orders-container">
          <div className="rider-loading">
            <div className="rider-loading-spinner"></div>

            <h2>Loading available orders...</h2>

            <p>
              Looking for orders that are ready for delivery.
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

            <h1>Available Orders</h1>

            <p className="rider-dashboard-subtitle">
              Find orders waiting for a delivery rider and start your next
              delivery.
            </p>
          </div>

          <div className="rider-header-icon">
            📦
          </div>
        </section>

        {/* Top actions */}
        <div className="rider-orders-toolbar">
          <div className="rider-orders-count">
            <span className="rider-orders-count-icon">📦</span>

            <div>
              <strong>{orders.length}</strong>
              <span>
                {orders.length === 1
                  ? " order available"
                  : " orders available"}
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

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="rider-empty-card">
            <div className="rider-empty-icon">
              📭
            </div>

            <h2>No Available Orders</h2>

            <p>
              There are currently no orders waiting for a delivery rider.
              Check again shortly.
            </p>

            <button
              type="button"
              className="rider-primary-btn"
              onClick={fetchOrders}
            >
              🔄 Refresh Orders
            </button>
          </div>
        ) : (
          <div className="rider-orders-grid">
            {orders.map((order) => (
              <article
                className="rider-order-card"
                key={order.orderId}
              >
                <div className="rider-order-card-top">
                  <div>
                    <span className="rider-order-label">
                      ORDER
                    </span>

                    <h2>
                      #{order.orderId}
                    </h2>
                  </div>

                  <span className="rider-order-status">
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="rider-order-divider"></div>

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
                        {order.restaurantName || "Unknown Restaurant"}
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
                        {order.restaurantAddress || "Address unavailable"}
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

                <div className="rider-order-footer">
                  <div className="rider-order-amount">
                    <span>Total Amount</span>

                    <strong>
                      ৳{formatAmount(order.totalAmount)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="rider-accept-btn"
                    onClick={() => handleAccept(order.orderId)}
                    disabled={accepting === order.orderId}
                  >
                    {accepting === order.orderId
                      ? "Accepting..."
                      : "🛵 Accept Order"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default AvailableOrders;
