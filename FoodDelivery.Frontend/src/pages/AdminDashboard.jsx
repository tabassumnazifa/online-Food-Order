
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin Dashboard:", response.data);

      setDashboard(response.data);
    } catch (error) {
      console.error("Admin Dashboard Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>👑 Super Admin Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>👑 Super Admin Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>👑 Super Admin Dashboard</h1>

      {dashboard && (
        <div className="dashboard-card">
          <h2>📊 System Overview</h2>

          <p>
            <strong>Total Customers:</strong>{" "}
            {dashboard.totalCustomers}
          </p>

          <p>
            <strong>Total Restaurant Owners:</strong>{" "}
            {dashboard.totalRestaurantOwners}
          </p>

          <p>
            <strong>Total Delivery Riders:</strong>{" "}
            {dashboard.totalDeliveryRiders}
          </p>

          <p>
            <strong>Total Restaurants:</strong>{" "}
            {dashboard.totalRestaurants}
          </p>

          <p>
            <strong>Total Foods:</strong>{" "}
            {dashboard.totalFoods}
          </p>

          <p>
            <strong>Total Orders:</strong>{" "}
            {dashboard.totalOrders}
          </p>

          <p>
            <strong>Total Revenue:</strong>{" "}
            ৳{dashboard.totalRevenue}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
