
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

  const handleDelete = async (restaurant) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${restaurant.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5079/api/Admin/restaurants/${restaurant.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Restaurant removed successfully.");

      fetchRestaurants();
    } catch (error) {
      console.error("Delete Restaurant Error:", error);

      if (error.response?.status === 404) {
        alert("Restaurant not found.");
        fetchRestaurants();
        return;
      }

      alert("Failed to remove restaurant.");
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

          <button type="button" onClick={() => navigate("/admin/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            Manage all restaurants registered in the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Restaurant Count */}
      <div className="dashboard-card" style={{ marginBottom: "25px" }}>
        <h2>📊 Restaurant Overview</h2>

        <p>
          <strong>Total Restaurants:</strong>{" "}
          {restaurants.length}
        </p>
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
              }}
            >
              <h2>{restaurant.name}</h2>

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

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/restaurants/${restaurant.id}`)
                  }
                >
                  👁️ View Details
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(restaurant)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;