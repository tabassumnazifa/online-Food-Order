
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
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>🏪 Restaurant Management</h1>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>🏪 Restaurant Management</h1>
          <p>{error}</p>

          <button
            type="button"
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
    <div
      className="dashboard-page"
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>🏪 Restaurant Management</h1>
          <p style={{ color: "#666" }}>
            Manage and control all restaurants registered in the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Restaurant Overview */}
      <div
        className="dashboard-card"
        style={{
          marginBottom: "25px",
        }}
      >
        <h2>📊 Restaurant Overview</h2>

        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "15px",
          }}
        >
          <p>
            <strong>Total Restaurants:</strong> {restaurants.length}
          </p>

          <p>
            <strong>Active:</strong> {activeCount}
          </p>

          <p>
            <strong>Suspended:</strong> {suspendedCount}
          </p>
        </div>
      </div>

      {/* Restaurant List */}
      {restaurants.length === 0 ? (
        <div className="dashboard-card">
          <h2>🏪 No Restaurants</h2>
          <p>There are currently no registered restaurants.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {restaurants.map((restaurant) => (
            <div
              className="dashboard-card"
              key={restaurant.id}
              style={{
                position: "relative",
                border: restaurant.isSuspended
                  ? "2px solid #dc3545"
                  : "1px solid #ddd",
              }}
            >
              {/* Status */}
              <div
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  backgroundColor: restaurant.isSuspended
                    ? "#f8d7da"
                    : "#d1e7dd",
                  color: restaurant.isSuspended
                    ? "#842029"
                    : "#0f5132",
                }}
              >
                {restaurant.isSuspended ? "🔴 Suspended" : "🟢 Active"}
              </div>

              <h2 style={{ paddingRight: "100px" }}>
                {restaurant.name}
              </h2>

              <p>
                <strong>Owner:</strong>{" "}
                {restaurant.ownerName || "N/A"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {restaurant.address || "N/A"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {restaurant.phone || "N/A"}
              </p>

              <p>
                <strong>Foods:</strong>{" "}
                {restaurant.totalFoods ?? 0}
              </p>

              <p>
                <strong>Average Rating:</strong>{" "}
                ⭐ {restaurant.averageRating ?? 0}
              </p>

              {/* Suspension Information */}
              {restaurant.isSuspended && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "6px",
                    border: "1px solid #ffe69c",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Suspension Reason:</strong>
                  </p>

                  <p style={{ margin: 0 }}>
                    {restaurant.suspensionReason ||
                      "No reason provided."}
                  </p>

                  {restaurant.suspendedAt && (
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "13px",
                        color: "#666",
                      }}
                    >
                      Suspended:{" "}
                      {new Date(
                        restaurant.suspendedAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action */}
              <div
                style={{
                  marginTop: "20px",
                }}
              >
                {restaurant.isSuspended ? (
                  <button
                    type="button"
                    onClick={() => handleUnsuspend(restaurant)}
                    style={{
                      width: "100%",
                      backgroundColor: "#198754",
                      color: "white",
                    }}
                  >
                    🟢 Unsuspend Restaurant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSuspend(restaurant)}
                    style={{
                      width: "100%",
                      backgroundColor: "#dc3545",
                      color: "white",
                    }}
                  >
                    🔒 Suspend Restaurant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;
