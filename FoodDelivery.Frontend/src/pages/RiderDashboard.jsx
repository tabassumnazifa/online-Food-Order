
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RiderDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboard(token);
  }, [navigate]);

  const fetchDashboard = async (token) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Rider/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rider Dashboard:", response.data);
      setDashboard(response.data);
    } catch (error) {
      console.error("Rider Dashboard Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 403) {
        setError("You are not authorized as a delivery rider.");
      } else {
        setError("Failed to load rider dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getValue = (key) => {
    return dashboard?.[key] ?? 0;
  };

  if (loading) {
    return (
      <div className="rider-dashboard-page">
        <div className="rider-dashboard-container">
          <div className="rider-loading">
            <div className="rider-loading-spinner"></div>
            <h2>Loading your dashboard...</h2>
            <p>Getting your delivery statistics ready.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-dashboard-page">
        <div className="rider-dashboard-container">
          <div className="rider-error-card">
            <div className="rider-error-icon">⚠️</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              type="button"
              className="rider-primary-btn"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rider-dashboard-page">
      <div className="rider-dashboard-container">

        {/* Header */}
        <section className="rider-dashboard-header">
          <div>
            <p className="rider-dashboard-eyebrow">
              DELIVERY CENTER
            </p>

            <h1>Rider Dashboard</h1>

            <p className="rider-dashboard-subtitle">
              Manage your deliveries, track orders and keep customers happy.
            </p>
          </div>

          <div className="rider-header-icon">
            🛵
          </div>
        </section>

        {/* Status Card */}
        <section className="rider-welcome-card">
          <div className="rider-welcome-icon">
            🛵
          </div>

          <div className="rider-welcome-content">
            <span className="rider-active-badge">
              ● AVAILABLE
            </span>

            <h2>Ready for your next delivery?</h2>

            <p>
              Check available orders and start delivering.
            </p>
          </div>

          <button
            type="button"
            className="rider-primary-btn"
            onClick={() => navigate("/rider/available-orders")}
          >
            View Available Orders →
          </button>
        </section>

        {/* Statistics */}
        <section className="rider-dashboard-section">
          <div className="rider-section-heading">
            <div>
              <p className="rider-section-eyebrow">
                YOUR PERFORMANCE
              </p>

              <h2>Delivery Statistics</h2>
            </div>

            <span className="rider-section-icon">
              📊
            </span>
          </div>

          <div className="rider-stats-grid">

            <div className="rider-stat-card rider-stat-orange">
              <div className="rider-stat-icon">
                📦
              </div>

              <div>
                <span>Available Orders</span>
                <strong>{getValue("availableOrders")}</strong>
              </div>
            </div>

            <div className="rider-stat-card rider-stat-blue">
              <div className="rider-stat-icon">
                🚚
              </div>

              <div>
                <span>Active Orders</span>
                <strong>{getValue("activeOrders")}</strong>
              </div>
            </div>

            <div className="rider-stat-card rider-stat-green">
              <div className="rider-stat-icon">
                ✅
              </div>

              <div>
                <span>Completed Orders</span>
                <strong>{getValue("completedOrders")}</strong>
              </div>
            </div>

            <div className="rider-stat-card rider-stat-purple">
              <div className="rider-stat-icon">
                🏆
              </div>

              <div>
                <span>Total Deliveries</span>
                <strong>{getValue("totalDeliveries")}</strong>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="rider-dashboard-section">
          <div className="rider-section-heading">
            <div>
              <p className="rider-section-eyebrow">
                QUICK ACTIONS
              </p>

              <h2>Manage Deliveries</h2>
            </div>

            <span className="rider-section-icon">
              ⚡
            </span>
          </div>

          <div className="rider-action-grid">

            <button
              type="button"
              className="rider-action-card rider-action-orange"
              onClick={() => navigate("/rider/available-orders")}
            >
              <div className="rider-action-icon">
                📦
              </div>

              <div className="rider-action-content">
                <h3>Available Orders</h3>

                <p>
                  Find orders waiting for delivery.
                </p>
              </div>

              <span className="rider-action-arrow">
                →
              </span>
            </button>

            <button
              type="button"
              className="rider-action-card rider-action-green"
              onClick={() => navigate("/rider/orders")}
            >
              <div className="rider-action-icon">
                🚚
              </div>

              <div className="rider-action-content">
                <h3>My Deliveries</h3>

                <p>
                  Track your assigned delivery orders.
                </p>
              </div>

              <span className="rider-action-arrow">
                →
              </span>
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}

export default RiderDashboard;
