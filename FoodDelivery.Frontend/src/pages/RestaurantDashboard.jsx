
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RestaurantDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================
  // LOAD DASHBOARD
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, []);

  // =========================
  // LOAD ALL DATA
  // =========================
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchDashboard(),
        fetchRestaurant(),
        fetchFeedbacks(),
      ]);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH DASHBOARD
  // =========================
  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/dashboard",
        authConfig
      );

      console.log("Dashboard response:", response.data);
      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        setError(
          "Restaurant not found. Please create your restaurant first."
        );
      }
    }
  };

  // =========================
  // FETCH MY RESTAURANT
  // =========================
  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/my-restaurant",
        authConfig
      );

      console.log("Restaurant response:", response.data);
      setRestaurant(response.data);
    } catch (error) {
      console.error("Restaurant Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        setError("You have not created a restaurant yet.");
      }
    }
  };

  // =========================
  // FETCH RESTAURANT FEEDBACK
  // =========================
  const fetchFeedbacks = async () => {
    try {
      setFeedbackLoading(true);

      const response = await axios.get(
        "http://localhost:5079/api/Feedback/restaurant-feedback",
        authConfig
      );

      console.log("Feedback response:", response.data);

      setFeedbacks(response.data);
    } catch (error) {
      console.error("Feedback loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        setFeedbacks([]);
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  // =========================
  // CALCULATE AVERAGE RATING
  // =========================
  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (total, feedback) => total + Number(feedback.rating || 0),
            0
          ) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  // =========================
  // RATING STARS
  // =========================
  const renderStars = (rating) => {
    const numericRating = Number(rating);

    return (
      <span className="feedback-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= numericRating ? "⭐" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>🍔 Restaurant Owner Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error && !restaurant && !dashboard) {
    return (
      <div className="dashboard-page">
        <h1>🍔 Restaurant Owner Dashboard</h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() => navigate("/restaurant/create")}
        >
          ➕ Create Restaurant
        </button>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================
  return (
    <div className="dashboard-page">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="restaurant-dashboard-header">
        <p className="dashboard-label">RESTAURANT OWNER</p>

        <h1>🍔 Restaurant Dashboard</h1>

        {restaurant && (
          <h2 className="restaurant-name">
            {restaurant.name}
          </h2>
        )}

        <p className="dashboard-subtitle">
          Manage your restaurant, food, orders and customer feedback.
        </p>
      </div>

      {/* =========================
          RESTAURANT INFORMATION
      ========================= */}
      {restaurant && (
        <div className="dashboard-card restaurant-info-card">
          <h2>🏪 {restaurant.name}</h2>

          <p>{restaurant.description}</p>

          <p>
            📍 <strong>Address:</strong>{" "}
            {restaurant.address}
          </p>

          <p>
            📞 <strong>Phone:</strong>{" "}
            {restaurant.phone}
          </p>
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================= */}
      {dashboard && (
        <div className="dashboard-card">
          <h2>📊 Restaurant Statistics</h2>

          <div className="dashboard-stats">

            <div className="stat-card">
              <h3>🍔</h3>
              <p>Total Foods</p>
              <strong>{dashboard.totalFoods}</strong>
            </div>

            <div className="stat-card">
              <h3>📂</h3>
              <p>Categories</p>
              <strong>{dashboard.totalCategories}</strong>
            </div>

            <div className="stat-card">
              <h3>📦</h3>
              <p>Total Orders</p>
              <strong>{dashboard.totalOrders}</strong>
            </div>

            <div className="stat-card">
              <h3>⏳</h3>
              <p>Pending Orders</p>
              <strong>{dashboard.pendingOrders}</strong>
            </div>

            <div className="stat-card">
              <h3>✅</h3>
              <p>Completed Orders</p>
              <strong>{dashboard.completedOrders}</strong>
            </div>

            <div className="stat-card">
              <h3>💰</h3>
              <p>Total Revenue</p>
              <strong>৳{dashboard.totalRevenue}</strong>
            </div>

          </div>
        </div>
      )}

      {/* =========================
          CUSTOMER FEEDBACK
      ========================= */}
      <div className="dashboard-card feedback-section">

        <div className="feedback-header">
          <div>
            <h2>💬 Customer Feedback</h2>

            <p>
              See what your customers are saying about your restaurant.
            </p>
          </div>

          <div className="feedback-summary">
            <div className="average-rating">
              <strong>{averageRating}</strong>
              <span>/ 5</span>
            </div>

            <div>
              {renderStars(Math.round(Number(averageRating)))}

              <p>
                {feedbacks.length}{" "}
                {feedbacks.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>

        {feedbackLoading ? (
          <p>Loading customer feedback...</p>
        ) : feedbacks.length === 0 ? (
          <div className="no-feedback">
            <h3>💬 No Feedback Yet</h3>

            <p>
              Your customer reviews will appear here after
              customers submit feedback.
            </p>
          </div>
        ) : (
          <div className="feedback-list">

            {feedbacks.map((feedback) => (
              <div
                className="feedback-card"
                key={feedback.feedbackId}
              >

                <div className="feedback-card-header">

                  <div>
                    <h3>
                      👤{" "}
                      {feedback.customerName ||
                        "Anonymous Customer"}
                    </h3>

                    <div>
                      {renderStars(feedback.rating)}
                    </div>
                  </div>

                  <span className="feedback-date">
                    {new Date(
                      feedback.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

                <p className="feedback-comment">
                  "{feedback.comment}"
                </p>

              </div>
            ))}

          </div>
        )}
      </div>

      {/* =========================
          DASHBOARD ACTIONS
      ========================= */}
      <div className="dashboard-card">
        <h2>⚡ Quick Actions</h2>

        <div className="dashboard-buttons">

          <button
            type="button"
            onClick={() => navigate("/restaurant/foods")}
          >
            🍔 Manage Foods
          </button>

          <button
            type="button"
            onClick={() => navigate("/restaurant/foods")}
          >
            ➕ Add Food
          </button>

          <button
            type="button"
            onClick={() => navigate("/restaurant/orders")}
          >
            📦 View Orders
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/restaurant/offers/create")
            }
          >
            🎁 Create Offer
          </button>

        </div>
      </div>

    </div>
  );
}

export default RestaurantDashboard;
