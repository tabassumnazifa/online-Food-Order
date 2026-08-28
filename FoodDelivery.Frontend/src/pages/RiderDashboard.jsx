
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>🛵 Rider Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>🛵 Rider Dashboard</h1>
        <p>{error}</p>

        <button type="button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>🛵 Delivery Rider Dashboard</h1>

      {dashboard && (
        <div className="dashboard-card">
          <h2>📊 Statistics</h2>

          <p>
            <strong>Available Orders:</strong>{" "}
            {dashboard.availableOrders ?? 0}
          </p>

          <p>
            <strong>Active Orders:</strong>{" "}
            {dashboard.activeOrders ?? 0}
          </p>

          <p>
            <strong>Completed Orders:</strong>{" "}
            {dashboard.completedOrders ?? 0}
          </p>

          <p>
            <strong>Total Deliveries:</strong>{" "}
            {dashboard.totalDeliveries ?? 0}
          </p>
        </div>
      )}

      <div className="dashboard-buttons">
        <button
          type="button"
          onClick={() => navigate("/rider/available-orders")}
        >
          📦 Available Orders
        </button>

        <button
          type="button"
          onClick={() => navigate("/rider/orders")}
        >
          🚚 My Orders
        </button>
      </div>
    </div>
  );
}

export default RiderDashboard;
