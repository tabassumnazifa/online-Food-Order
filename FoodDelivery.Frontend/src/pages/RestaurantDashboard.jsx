import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RestaurantDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Dashboard response:",
        response.data
      );

      setDashboard(response.data);
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Restaurant response:",
        response.data
      );

      setRestaurant(response.data);
    } catch (error) {
      console.error(
        "Restaurant Error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        setError(
          "You have not created a restaurant yet."
        );
      }
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>
          🍔 Restaurant Owner Dashboard
        </h1>

        <p>
          Loading dashboard...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !restaurant && !dashboard) {
    return (
      <div className="dashboard-page">
        <h1>
          🍔 Restaurant Owner Dashboard
        </h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate("/restaurant/create")
          }
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

      {/* ========================= */}
      {/* PAGE TITLE */}
      {/* ========================= */}

      <h1>
        🍔 Restaurant Owner Dashboard
      </h1>

      {/* ========================= */}
      {/* RESTAURANT INFORMATION */}
      {/* ========================= */}

      {restaurant && (
        <div className="dashboard-card">

          <h2>
            {restaurant.name}
          </h2>

          <p>
            {restaurant.description}
          </p>

          <p>
            📍 {restaurant.address}
          </p>

          <p>
            📞 {restaurant.phone}
          </p>

        </div>
      )}

      {/* ========================= */}
      {/* STATISTICS */}
      {/* ========================= */}

      {dashboard && (
        <div className="dashboard-card">

          <h2>
            📊 Statistics
          </h2>

          <p>
            <strong>
              Total Foods:
            </strong>{" "}
            {dashboard.totalFoods}
          </p>

          <p>
            <strong>
              Total Categories:
            </strong>{" "}
            {dashboard.totalCategories}
          </p>

          <p>
            <strong>
              Total Orders:
            </strong>{" "}
            {dashboard.totalOrders}
          </p>

          <p>
            <strong>
              Pending Orders:
            </strong>{" "}
            {dashboard.pendingOrders}
          </p>

          <p>
            <strong>
              Completed Orders:
            </strong>{" "}
            {dashboard.completedOrders}
          </p>

          <p>
            <strong>
              Total Revenue:
            </strong>{" "}
            ৳{dashboard.totalRevenue}
          </p>

        </div>
      )}

      {/* ========================= */}
      {/* DASHBOARD BUTTONS */}
      {/* ========================= */}

      <div className="dashboard-buttons">

        {/* Manage Foods */}

        <button
          type="button"
          onClick={() =>
            navigate("/restaurant/foods")
          }
        >
          🍔 Manage Foods
        </button>

        {/* Add Food */}

        <button
          type="button"
          onClick={() =>
            navigate("/restaurant/foods")
          }
        >
          ➕ Add Food
        </button>

        {/* View Orders */}

        <button
          type="button"
          onClick={() =>
            navigate("/restaurant/orders")
          }
        >
          📦 View Orders
        </button>

      </div>

    </div>
  );
}

export default RestaurantDashboard;