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
  const API_URL = "http://localhost:5079/api";

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, []);

  // ==========================================
  // LOAD ALL DASHBOARD DATA
  // ==========================================
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

  // ==========================================
  // FETCH DASHBOARD STATISTICS
  // ==========================================
  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/Restaurant/dashboard`,
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

  // ==========================================
  // FETCH MY RESTAURANT (WITH BOUNCER LOGIC)
  // ==========================================
  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/Restaurant/my-restaurant`,
        authConfig
      );

      const restData = response.data;
      console.log("Restaurant response:", restData);

      // 🚨 BOUNCER LOGIC: 
      // If the restaurant is suspended, kick them to the verification page immediately!
      if (restData.isSuspended) {
        navigate("/restaurant/verify");
        return;
      }

      setRestaurant(restData);
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

  // ==========================================
  // FETCH CUSTOMER FEEDBACK
  // ==========================================
  const fetchFeedbacks = async () => {
    try {
      setFeedbackLoading(true);

      const response = await axios.get(
        `${API_URL}/Feedback/restaurant-feedback`,
        authConfig
      );

      console.log("Feedback response:", response.data);
      setFeedbacks(response.data || []);
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

  // ==========================================
  // CALCULATE AVERAGE RATING
  // ==========================================
  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (total, feedback) =>
              total + Number(feedback.rating || 0),
            0
          ) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  // ==========================================
  // RENDER STARS
  // ==========================================
  const renderStars = (rating) => {
    const numericRating = Number(rating);

    return (
      <span className="restaurant-dashboard-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= numericRating ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="restaurant-dashboard-page">
        <div className="restaurant-dashboard-container">
          <div className="restaurant-dashboard-loading">
            <div className="customer-loading-spinner"></div>
            <h3>Loading your dashboard...</h3>
            <p>Please wait while we prepare your restaurant overview.</p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // RESTAURANT NOT FOUND
  // ==========================================
  if (error && !restaurant && !dashboard) {
    return (
      <main className="restaurant-dashboard-page">
        <div className="restaurant-dashboard-container">
          <section className="restaurant-dashboard-empty">
            <div className="restaurant-dashboard-empty-icon">🏪</div>
            <span className="restaurant-dashboard-eyebrow">RESTAURANT OWNER</span>
            <h1>Welcome to your dashboard</h1>
            <p>{error}</p>
            <button
              type="button"
              className="restaurant-dashboard-primary-btn"
              onClick={() => navigate("/restaurant/create")}
            >
              <span>＋</span> Create Restaurant
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="restaurant-dashboard-page">
      <div className="restaurant-dashboard-container">

        {/* HEADER */}
        <section className="restaurant-dashboard-header">
          <div className="restaurant-dashboard-header-content">
            <span className="restaurant-dashboard-eyebrow">RESTAURANT OWNER</span>
            <h1>Welcome back{restaurant?.name ? `, ${restaurant.name}` : ""}!</h1>
            <p>Manage your restaurant, monitor orders, track performance and stay connected with your customers.</p>
          </div>
          <div className="restaurant-dashboard-header-icon">🍽️</div>
        </section>

        {/* RESTAURANT INFORMATION */}
        {restaurant && (
          <section className="restaurant-dashboard-restaurant-card">
            <div className="restaurant-dashboard-restaurant-icon">🏪</div>
            <div className="restaurant-dashboard-restaurant-info">
              <div className="restaurant-dashboard-restaurant-title">
                <h2>{restaurant.name}</h2>
                <span className="restaurant-dashboard-active-badge">● Active</span>
              </div>
              <p className="restaurant-dashboard-description">
                {restaurant.description || "No restaurant description available."}
              </p>
              <div className="restaurant-dashboard-contact-row">
                <span>📍 {restaurant.address || "Address not available"}</span>
                <span>📞 {restaurant.phone || "Phone not available"}</span>
              </div>
            </div>
          </section>
        )}

        {/* STATISTICS */}
        {dashboard && (
          <section className="restaurant-dashboard-section">
            <div className="restaurant-dashboard-section-heading">
              <div>
                <span className="restaurant-dashboard-eyebrow">OVERVIEW</span>
                <h2>Restaurant Performance</h2>
              </div>
              <span className="restaurant-dashboard-section-icon">📊</span>
            </div>

            <div className="restaurant-dashboard-stats">
              <div className="restaurant-stat-card green">
                <div className="restaurant-stat-icon">🍔</div>
                <div><span>Total Foods</span><strong>{dashboard.totalFoods ?? 0}</strong></div>
              </div>
              <div className="restaurant-stat-card blue">
                <div className="restaurant-stat-icon">📦</div>
                <div><span>Total Orders</span><strong>{dashboard.totalOrders ?? 0}</strong></div>
              </div>
              <div className="restaurant-stat-card yellow">
                <div className="restaurant-stat-icon">⏳</div>
                <div><span>Pending Orders</span><strong>{dashboard.pendingOrders ?? 0}</strong></div>
              </div>
              <div className="restaurant-stat-card purple">
                <div className="restaurant-stat-icon">✓</div>
                <div><span>Completed Orders</span><strong>{dashboard.completedOrders ?? 0}</strong></div>
              </div>
              <div className="restaurant-stat-card revenue">
                <div className="restaurant-stat-icon">৳</div>
                <div><span>Total Revenue</span><strong>৳{Number(dashboard.totalRevenue || 0).toLocaleString()}</strong></div>
              </div>
            </div>
          </section>
        )}

        {/* CUSTOMER FEEDBACK */}
        <section className="restaurant-dashboard-feedback">
          <div className="restaurant-dashboard-feedback-header">
            <div>
              <span className="restaurant-dashboard-eyebrow">CUSTOMER EXPERIENCE</span>
              <h2>Customer Feedback</h2>
              <p>See what your customers are saying about your restaurant.</p>
            </div>
            <div className="restaurant-dashboard-rating-summary">
              <div className="restaurant-dashboard-rating-number">
                <strong>{averageRating}</strong><span>/ 5</span>
              </div>
              <div>
                {renderStars(Math.round(Number(averageRating)))}
                <p>{feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
          </div>

          {feedbackLoading ? (
            <div className="restaurant-dashboard-feedback-loading">
              <div className="customer-loading-spinner"></div>
              <p>Loading customer feedback...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="restaurant-dashboard-no-feedback">
              <div>💬</div>
              <h3>No Feedback Yet</h3>
              <p>Your customer reviews will appear here after customers submit feedback.</p>
            </div>
          ) : (
            <div className="restaurant-dashboard-feedback-list">
              {feedbacks.map((feedback) => (
                <article className="restaurant-dashboard-feedback-card" key={feedback.feedbackId}>
                  <div className="restaurant-feedback-top">
                    <div className="restaurant-feedback-customer">
                      <div className="restaurant-feedback-avatar">
                        {(feedback.customerName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{feedback.customerName || "Anonymous Customer"}</h3>
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <span className="restaurant-feedback-date">
                      {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="restaurant-feedback-comment">"{feedback.comment}"</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="restaurant-dashboard-actions">
          <div className="restaurant-dashboard-section-heading">
            <div>
              <span className="restaurant-dashboard-eyebrow">MANAGEMENT</span>
              <h2>Quick Actions</h2>
            </div>
            <span className="restaurant-dashboard-section-icon">⚡</span>
          </div>

          <div className="restaurant-dashboard-action-grid">
            <button type="button" className="restaurant-action-card" onClick={() => navigate("/restaurant/foods")}>
              <div className="restaurant-action-icon green">🍔</div>
              <div><strong>Manage Foods</strong><span>View and edit your food menu</span></div>
              <span className="restaurant-action-arrow">→</span>
            </button>

            <button type="button" className="restaurant-action-card" onClick={() => navigate("/restaurant/foods")}>
              <div className="restaurant-action-icon orange">＋</div>
              <div><strong>Add Food</strong><span>Add a new item to your menu</span></div>
              <span className="restaurant-action-arrow">→</span>
            </button>

            <button type="button" className="restaurant-action-card" onClick={() => navigate("/restaurant/orders")}>
              <div className="restaurant-action-icon blue">📦</div>
              <div><strong>View Orders</strong><span>Manage incoming customer orders</span></div>
              <span className="restaurant-action-arrow">→</span>
            </button>

            {/* 
              NOTE: "Manage Offers" button intentionally removed. 
              Only Super Admin can view/delete system-wide promotions to maintain platform consistency.
              "Create Offer" is kept as a placeholder for future role-specific promo requests.
            */}
            <button type="button" className="restaurant-action-card" onClick={() => navigate("/restaurant/offers/create")}>
              <div className="restaurant-action-icon orange">🎁</div>
              <div><strong>Create Offer</strong><span>Create discounts and promotions</span></div>
              <span className="restaurant-action-arrow">→</span>
            </button>

            <button type="button" className="restaurant-action-card" onClick={() => navigate("/restaurant/edit")}>
              <div className="restaurant-action-icon purple">✏️</div>
              <div><strong>Edit Restaurant</strong><span>Update your profile & about text</span></div>
              <span className="restaurant-action-arrow">→</span>
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

export default RestaurantDashboard;