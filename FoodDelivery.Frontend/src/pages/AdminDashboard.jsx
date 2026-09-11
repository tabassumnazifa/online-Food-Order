
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
        <div className="dashboard-card">
          <h1>👑 Super Admin Dashboard</h1>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>👑 Super Admin Dashboard</h1>
          <p>{error}</p>
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
          marginBottom: "35px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>
            👑 Super Admin Dashboard
          </h1>

          <p style={{ margin: 0, color: "#666" }}>
            Manage and monitor the entire Food Delivery System.
          </p>
        </div>

        <div
          style={{
            background: "#fff3cd",
            padding: "10px 18px",
            borderRadius: "20px",
            fontWeight: "600",
          }}
        >
          🛡️ Administrator
        </div>
      </div>

      {/* Statistics */}
      {dashboard && (
        <>
          <h2 style={{ marginBottom: "20px" }}>
            📊 System Overview
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <div className="dashboard-card">
              <h3>👥 Customers</h3>
              <h2>{dashboard.totalCustomers}</h2>
              <p>Registered customers</p>
            </div>

            <div className="dashboard-card">
              <h3>🏪 Restaurant Owners</h3>
              <h2>{dashboard.totalRestaurantOwners}</h2>
              <p>Registered restaurant owners</p>
            </div>

            <div className="dashboard-card">
              <h3>🛵 Delivery Riders</h3>
              <h2>{dashboard.totalDeliveryRiders}</h2>
              <p>Active rider accounts</p>
            </div>

            <div className="dashboard-card">
              <h3>🍽️ Restaurants</h3>
              <h2>{dashboard.totalRestaurants}</h2>
              <p>Registered restaurants</p>
            </div>

            <div className="dashboard-card">
              <h3>🍔 Foods</h3>
              <h2>{dashboard.totalFoods}</h2>
              <p>Total food items</p>
            </div>

            <div className="dashboard-card">
              <h3>📦 Orders</h3>
              <h2>{dashboard.totalOrders}</h2>
              <p>Total system orders</p>
            </div>

            <div className="dashboard-card">
              <h3>💰 Revenue</h3>
              <h2>৳{dashboard.totalRevenue}</h2>
              <p>Total paid revenue</p>
            </div>
          </div>

          {/* Management */}
          <h2 style={{ marginBottom: "20px" }}>
            ⚙️ System Management
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div className="dashboard-card">
              <h3>🏪 Restaurant Management</h3>
              <p>
                View, monitor and manage all registered
                restaurants.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/restaurants")}
              >
                Manage Restaurants
              </button>
            </div>

            <div className="dashboard-card">
              <h3>👥 User Management</h3>
              <p>
                Manage customers, restaurant owners and
                delivery riders.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/users")}
              >
                Manage Users
              </button>
            </div>

            <div className="dashboard-card">
              <h3>📦 Order Management</h3>
              <p>
                Monitor all orders placed throughout the
                system.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
              >
                Manage Orders
              </button>
            </div>

            <div className="dashboard-card">
              <h3>💳 Payment Management</h3>
              <p>
                View payment records and monitor system
                revenue.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/payments")}
              >
                Manage Payments
              </button>
            </div>

            <div className="dashboard-card">
              <h3>🎁 Super Offers</h3>
              <p>
                Create system-wide offers available across
                all restaurants.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/offers")}
              >
                Manage Super Offers
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;

