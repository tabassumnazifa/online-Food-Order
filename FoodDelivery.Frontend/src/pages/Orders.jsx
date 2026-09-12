import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      normalizedStatus === "delivered" ||
      normalizedStatus === "completed"
    ) {
      return "customer-order-status delivered";
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled"
    ) {
      return "customer-order-status cancelled";
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return "customer-order-status pending";
    }

    if (
      normalizedStatus === "out for delivery" ||
      normalizedStatus === "outfordelivery"
    ) {
      return "customer-order-status delivery";
    }

    return "customer-order-status";
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      normalizedStatus === "delivered" ||
      normalizedStatus === "completed"
    ) {
      return "✓";
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled"
    ) {
      return "×";
    }

    if (
      normalizedStatus === "out for delivery" ||
      normalizedStatus === "outfordelivery"
    ) {
      return "🚴";
    }

    return "•";
  };

  return (
    <main className="customer-orders-page">
      <div className="customer-orders-container">

        {/* PAGE HEADER */}
        <section className="customer-page-header">
          <div>
            <span className="customer-page-eyebrow">
              ORDER HISTORY
            </span>

            <h1>My Orders</h1>

            <p>
              Keep track of your recent orders and delivery status.
            </p>
          </div>

          <button
            className="customer-primary-btn"
            onClick={() => navigate("/restaurants")}
          >
            <span>🍔</span>
            Order Food
          </button>
        </section>

        {/* SUMMARY */}
        {!loading && !error && orders.length > 0 && (
          <section className="customer-order-summary">

            <div className="customer-summary-card">
              <div className="customer-summary-icon green">
                🧾
              </div>

              <div>
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon orange">
                🍽️
              </div>

              <div>
                <span>Recent Orders</span>
                <strong>
                  {orders.filter(
                    (order) =>
                      order.status?.toLowerCase() !== "cancelled" &&
                      order.status?.toLowerCase() !== "canceled"
                  ).length}
                </strong>
              </div>
            </div>

            <div className="customer-summary-card">
              <div className="customer-summary-icon blue">
                🚴
              </div>

              <div>
                <span>Active Orders</span>
                <strong>
                  {
                    orders.filter((order) => {
                      const status = order.status?.toLowerCase();

                      return (
                        status !== "delivered" &&
                        status !== "completed" &&
                        status !== "cancelled" &&
                        status !== "canceled"
                      );
                    }).length
                  }
                </strong>
              </div>
            </div>

          </section>
        )}

        {/* LOADING */}
        {loading && (
          <div className="customer-orders-loading">
            <div className="customer-loading-spinner"></div>

            <h3>Loading your orders...</h3>

            <p>
              Please wait while we fetch your order history.
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="customer-orders-error">
            <div className="customer-error-icon">
              !
            </div>

            <div>
              <h3>Unable to load orders</h3>
              <p>{error}</p>

              <button
                className="customer-outline-btn"
                onClick={fetchOrders}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && orders.length === 0 && (
          <div className="customer-orders-empty">

            <div className="customer-empty-icon">
              🛍️
            </div>

            <span className="customer-page-eyebrow">
              NO ORDERS YET
            </span>

            <h2>Your order history is empty</h2>

            <p>
              Looks like you haven't ordered anything yet.
              Explore restaurants and find something delicious.
            </p>

            <button
              className="customer-primary-btn"
              onClick={() => navigate("/restaurants")}
            >
              <span>🍔</span>
              Browse Restaurants
            </button>

          </div>
        )}

        {/* ORDERS */}
        {!loading && !error && orders.length > 0 && (
          <section className="customer-orders-section">

            <div className="customer-section-heading">
              <div>
                <h2>Recent Orders</h2>
                <p>
                  Your latest food orders are shown below.
                </p>
              </div>

              <span className="customer-order-count">
                {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            <div className="customer-orders-list">

              {orders.map((order) => (
                <article
                  className="customer-order-card"
                  key={order.orderId}
                >

                  {/* ORDER TOP */}
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
                      className={getStatusClass(
                        order.status
                      )}
                    >
                      <span>
                        {getStatusIcon(order.status)}
                      </span>

                      {order.status || "Pending"}
                    </div>

                  </div>

                  {/* ORDER DETAILS */}
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
                        <small>Order date</small>

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
                        <small>Total amount</small>

                        <strong>
                          ৳
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString()}
                        </strong>
                      </div>

                    </div>

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default Orders;