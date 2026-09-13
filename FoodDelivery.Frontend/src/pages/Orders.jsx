import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Order/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Orders response:", response.data);

      setOrders(response.data);
    } catch (error) {
      console.error("Orders loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CANCEL ORDER & REFUND
  // =========================
  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    
    if (!window.confirm("Are you sure you want to cancel this order? If you paid online, a refund will be initiated.")) {
      return;
    }

    try {
      setCancelling(orderId);
      
      await axios.post(
        `http://localhost:5079/api/Payment/refund/${orderId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order cancelled and refund initiated successfully!");
      await fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(null);
    }
  };

  // =========================
  // STATUS HELPERS
  // =========================
  const normalizeStatus = (status) => {
    if (!status) return "pending";

    return status.toLowerCase().replace(/\s+/g, "");
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  const isCancelled = (status) => {
    const normalized = normalizeStatus(status);

    return (
      normalized === "cancelled" ||
      normalized === "canceled"
    );
  };

  const isDelivered = (status) => {
    return normalizeStatus(status) === "delivered";
  };

  const canCancel = (status) => {
    const normalized = normalizeStatus(status);
    return (
      normalized === "pending" ||
      normalized === "accepted" ||
      normalized === "preparing"
    );
  };

  // =========================
  // STATUS STEPS
  // =========================
  const statusSteps = [
    {
      value: "pending",
      label: "Placed",
    },
    {
      value: "accepted",
      label: "Accepted",
    },
    {
      value: "preparing",
      label: "Preparing",
    },
    {
      value: "readyforpickup",
      label: "Ready",
    },
    {
      value: "outfordelivery",
      label: "On the way",
    },
    {
      value: "delivered",
      label: "Delivered",
    },
  ];

  const getCurrentStep = (status) => {
    const normalized = normalizeStatus(status);

    return statusSteps.findIndex(
      (step) => step.value === normalized
    );
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="customer-orders-page">
        <div className="customer-orders-container">
          <div className="customer-orders-loading">
            <div className="customer-loading-spinner"></div>

            <h3>Loading your orders...</h3>

            <p>
              Please wait while we fetch your order history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <main className="customer-orders-page">
      <div className="customer-orders-container">

        {/* =========================
            PAGE HEADER
            ========================= */}
        <section className="customer-page-header">
          <div>
            <span className="customer-page-eyebrow">
              ORDER HISTORY
            </span>

            <h1>My Orders</h1>

            <p>
              Track your orders and see their current status.
            </p>
          </div>

          <button
            type="button"
            className="customer-primary-btn"
            onClick={() => navigate("/restaurants")}
          >
            <span>🍔</span>
            Order Food
          </button>
        </section>

        {/* =========================
            ERROR
            ========================= */}
        {error && (
          <div className="customer-orders-error">
            <div className="customer-error-icon">
              !
            </div>

            <div>
              <h3>Unable to load orders</h3>

              <p>{error}</p>

              <button
                type="button"
                className="customer-outline-btn"
                onClick={fetchOrders}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =========================
            EMPTY
            ========================= */}
        {!error && orders.length === 0 && (
          <div className="customer-orders-empty">
            <div className="customer-empty-icon">
              🛍️
            </div>

            <span className="customer-page-eyebrow">
              NO ORDERS YET
            </span>

            <h2>Your order history is empty</h2>

            <p>
              You haven't placed any orders yet.
              Explore restaurants and find something delicious.
            </p>

            <button
              type="button"
              className="customer-primary-btn"
              onClick={() => navigate("/restaurants")}
            >
              <span>🍔</span>
              Browse Restaurants
            </button>
          </div>
        )}

        {/* =========================
            ORDERS
            ========================= */}
        {!error && orders.length > 0 && (
          <section className="customer-orders-section">

            {/* SECTION HEADER */}
            <div className="customer-section-heading">
              <div>
                <h2>Your Orders</h2>

                <p>
                  View your order details and delivery progress.
                </p>
              </div>

              <span className="customer-order-count">
                {orders.length}{" "}
                {orders.length === 1
                  ? "order"
                  : "orders"}
              </span>
            </div>

            {/* ORDER LIST */}
            <div className="customer-orders-list">

              {orders.map((order) => {
                const currentStep = getCurrentStep(
                  order.status
                );

                const cancelled = isCancelled(
                  order.status
                );

                const delivered = isDelivered(
                  order.status
                );

                const showCancelButton = canCancel(order.status);

                return (
                  <article
                    className="customer-order-card"
                    key={order.orderId}
                  >

                    {/* =========================
                        ORDER HEADER
                        ========================= */}
                    <div className="customer-order-top">

                      <div className="customer-order-number">

                        <div className="customer-order-icon">
                          🍽️
                        </div>

                        <div>
                          <span>ORDER</span>

                          <h3>
                            #{order.orderId}
                          </h3>
                        </div>

                      </div>

                      <div
                        className={`customer-order-status ${
                          cancelled
                            ? "cancelled"
                            : delivered
                            ? "delivered"
                            : "active"
                        }`}
                      >
                        <span>
                          {cancelled
                            ? "×"
                            : delivered
                            ? "✓"
                            : "•"}
                        </span>

                        {formatStatus(order.status)}
                      </div>

                    </div>

                    {/* =========================
                        BASIC DETAILS
                        ========================= */}
                    <div className="customer-order-details">

                      <div className="customer-order-detail">
                        <span className="customer-detail-icon">
                          🏪
                        </span>

                        <div>
                          <small>Restaurant</small>

                          <strong>
                            {order.restaurantName ||
                              "Restaurant"}
                          </strong>
                        </div>
                      </div>

                      <div className="customer-order-detail">
                        <span className="customer-detail-icon">
                          📅
                        </span>

                        <div>
                          <small>Date</small>

                          <strong>
                            {order.orderDate
                              ? new Date(
                                  order.orderDate
                                ).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="customer-order-detail">
                        <span className="customer-detail-icon">
                          🕐
                        </span>

                        <div>
                          <small>Time</small>

                          <strong>
                            {order.orderDate
                              ? new Date(
                                  order.orderDate
                                ).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="customer-order-detail total">
                        <span className="customer-detail-icon">
                          ৳
                        </span>

                        <div>
                          <small>Total</small>

                          <strong>
                            ৳
                            {Number(
                              order.totalAmount || 0
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* =========================
                        PROGRESS
                        ========================= */}
                    {!cancelled && (
                      <div className="customer-order-progress">

                        <div className="customer-progress-heading">
                          <span>ORDER STATUS</span>

                          <strong>
                            {formatStatus(
                              order.status
                            )}
                          </strong>
                        </div>

                        <div className="customer-progress-bar">

                          {statusSteps.map(
                            (step, index) => {
                              const completed =
                                index <= currentStep;

                              const current =
                                index === currentStep;

                              return (
                                <div
                                  key={step.value}
                                  className={`customer-progress-item ${
                                    completed
                                      ? "completed"
                                      : ""
                                  } ${
                                    current
                                      ? "current"
                                      : ""
                                  }`}
                                >
                                  <div className="customer-progress-circle">
                                    {completed
                                      ? "✓"
                                      : ""}
                                  </div>

                                  <span>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            }
                          )}

                        </div>
                      </div>
                    )}

                    {/* =========================
                        CANCEL BUTTON
                        ========================= */}
                    {showCancelButton && (
                      <div className="customer-order-actions">
                        <button
                          type="button"
                          className="customer-cancel-btn"
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={cancelling === order.orderId}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "600",
                            marginTop: "15px"
                          }}
                        >
                          {cancelling === order.orderId
                            ? "Cancelling..."
                            : "❌ Cancel Order & Request Refund"}
                        </button>
                      </div>
                    )}

                    {/* =========================
                        CANCELLED
                        ========================= */}
                    {cancelled && (
                      <div className="customer-order-message cancelled">
                        <span>×</span>

                        <div>
                          <strong>
                            Order cancelled
                          </strong>

                          <p>
                            This order is no longer being
                            processed.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* =========================
                        DELIVERED
                        ========================= */}
                    {delivered && (
                      <div className="customer-order-message delivered">
                        <span>✓</span>

                        <div>
                          <strong>
                            Order delivered
                          </strong>

                          <p>
                            Your order has been successfully
                            delivered.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="customer-outline-btn"
                          onClick={() =>
                            navigate("/feedback")
                          }
                        >
                          ⭐ Give Feedback
                        </button>
                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Orders;