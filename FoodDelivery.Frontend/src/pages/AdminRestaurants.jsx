import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminRestaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Admin/restaurants",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin Restaurants:", response.data);
      setRestaurants(response.data);
    } catch (error) {
      console.error("Admin Restaurants Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (restaurant) => {
    const reason = window.prompt(
      `Why do you want to suspend "${restaurant.name}"?`
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      alert("Suspension reason is required.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5079/api/Admin/restaurants/${restaurant.id}/suspend`,
        reason.trim(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Restaurant suspended successfully.");
      fetchRestaurants();
    } catch (error) {
      console.error("Suspend Restaurant Error:", error);

      if (error.response?.status === 404) {
        alert("Restaurant not found.");
        fetchRestaurants();
        return;
      }

      if (error.response?.status === 400) {
        alert(error.response.data || "Unable to suspend restaurant.");
        return;
      }

      alert("Failed to suspend restaurant.");
    }
  };

  const handleUnsuspend = async (restaurant) => {
    const confirmed = window.confirm(
      `Are you sure you want to unsuspend "${restaurant.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5079/api/Admin/restaurants/${restaurant.id}/unsuspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Restaurant unsuspended successfully.");
      fetchRestaurants();
    } catch (error) {
      console.error("Unsuspend Restaurant Error:", error);

      if (error.response?.status === 404) {
        alert("Restaurant not found.");
        fetchRestaurants();
        return;
      }

      if (error.response?.status === 400) {
        alert(error.response.data || "Unable to unsuspend restaurant.");
        return;
      }

      alert("Failed to unsuspend restaurant.");
    }
  };

  if (loading) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-page-loading">
          <div className="admin-page-loading-icon">🏪</div>
          <h2>Loading restaurants</h2>
          <p>Please wait while we load restaurant information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-page-error">
          <div className="admin-page-error-icon">!</div>

          <h2>Unable to load restaurants</h2>

          <p>{error}</p>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const suspendedCount = restaurants.filter(
    (restaurant) => restaurant.isSuspended
  ).length;

  const activeCount = restaurants.length - suspendedCount;

  return (
    <div className="admin-restaurants-page">
      {/* Header */}
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>

          <h1>Restaurant Management</h1>

          <p>
            Monitor, manage and control all restaurants registered
            on your food delivery platform.
          </p>
        </div>

        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate("/admin/dashboard")}
        >
          <span>←</span>
          Dashboard
        </button>
      </section>

      {/* Overview */}
      <section className="restaurant-overview">
        <div className="restaurant-overview-header">
          <div>
            <span className="section-eyebrow">OVERVIEW</span>
            <h2>Restaurant Status</h2>
          </div>

          <span className="restaurant-total-badge">
            {restaurants.length} Total
          </span>
        </div>

        <div className="restaurant-overview-grid">
          <div className="restaurant-overview-card overview-total">
            <div className="overview-icon">🏪</div>

            <div>
              <span>Total Restaurants</span>
              <strong>{restaurants.length}</strong>
            </div>
          </div>

          <div className="restaurant-overview-card overview-active">
            <div className="overview-icon">✓</div>

            <div>
              <span>Active Restaurants</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

          <div className="restaurant-overview-card overview-suspended">
            <div className="overview-icon">!</div>

            <div>
              <span>Suspended Restaurants</span>
              <strong>{suspendedCount}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="admin-restaurant-section">
        <div className="admin-restaurant-section-heading">
          <div>
            <span className="section-eyebrow">RESTAURANTS</span>
            <h2>Registered Restaurants</h2>
          </div>

          <p>
            Review restaurant information and manage account status.
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🏪</div>

            <h2>No Restaurants</h2>

            <p>
              There are currently no registered restaurants in the
              system.
            </p>
          </div>
        ) : (
          <div className="admin-restaurant-grid">
            {restaurants.map((restaurant) => (
              <article
                className={`admin-restaurant-card ${
                  restaurant.isSuspended
                    ? "restaurant-suspended"
                    : ""
                }`}
                key={restaurant.id}
              >
                {/* Card Header */}
                <div className="restaurant-card-header">
                  <div className="restaurant-card-icon">
                    🏪
                  </div>

                  <span
                    className={`restaurant-status ${
                      restaurant.isSuspended
                        ? "status-suspended"
                        : "status-active"
                    }`}
                  >
                    <span className="status-indicator"></span>

                    {restaurant.isSuspended
                      ? "Suspended"
                      : "Active"}
                  </span>
                </div>

                {/* Restaurant Name */}
                <div className="restaurant-card-title">
                  <h3>{restaurant.name}</h3>

                  <span className="restaurant-id">
                    Restaurant #{restaurant.id}
                  </span>
                </div>

                {/* Restaurant Information */}
                <div className="restaurant-details">
                  <div className="restaurant-detail-item">
                    <span className="detail-icon">👤</span>

                    <div>
                      <small>Owner</small>
                      <strong>
                        {restaurant.ownerName || "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="restaurant-detail-item">
                    <span className="detail-icon">📍</span>

                    <div>
                      <small>Address</small>
                      <strong>
                        {restaurant.address || "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="restaurant-detail-item">
                    <span className="detail-icon">📞</span>

                    <div>
                      <small>Phone</small>
                      <strong>
                        {restaurant.phone || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Restaurant Stats */}
                <div className="restaurant-mini-stats">
                  <div>
                    <span>Foods</span>
                    <strong>
                      {restaurant.totalFoods ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Rating</span>
                    <strong>
                      ⭐ {restaurant.averageRating ?? 0}
                    </strong>
                  </div>
                </div>

                {/* Suspension Information */}
                {restaurant.isSuspended && (
                  <div className="suspension-box">
                    <div className="suspension-box-header">
                      <span>⚠</span>
                      <strong>Suspension Information</strong>
                    </div>

                    <p>
                      {restaurant.suspensionReason ||
                        "No reason provided."}
                    </p>

                    {restaurant.suspendedAt && (
                      <small>
                        Suspended on{" "}
                        {new Date(
                          restaurant.suspendedAt
                        ).toLocaleString()}
                      </small>
                    )}
                  </div>
                )}

                {/* Action */}
                <div className="restaurant-card-action">
                  {restaurant.isSuspended ? (
                    <button
                      type="button"
                      className="restaurant-action-btn unsuspend-btn"
                      onClick={() =>
                        handleUnsuspend(restaurant)
                      }
                    >
                      <span>✓</span>
                      Unsuspend Restaurant
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="restaurant-action-btn suspend-btn"
                      onClick={() =>
                        handleSuspend(restaurant)
                      }
                    >
                      <span>🔒</span>
                      Suspend Restaurant
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminRestaurants;