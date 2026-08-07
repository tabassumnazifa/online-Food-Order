import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RestaurantDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
    fetchRestaurant();
  }, []);

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

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

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

      setRestaurant(response.data);
    } catch (error) {
      console.error("Restaurant Error:", error);
    }
  };

  return (
    <div className="dashboard-page">

      <h1>🍔 Restaurant Owner Dashboard</h1>

      {restaurant && (
        <div className="dashboard-card">

          <h2>{restaurant.name}</h2>

          <p>{restaurant.description}</p>

          <p>📍 {restaurant.address}</p>

          <p>📞 {restaurant.phone}</p>

        </div>
      )}

      {dashboard && (
        <div className="dashboard-card">

          <h2>📊 Statistics</h2>

          <p><strong>Total Foods:</strong> {dashboard.totalFoods}</p>

          <p><strong>Total Orders:</strong> {dashboard.totalOrders}</p>

          <p><strong>Total Revenue:</strong> ৳ {dashboard.totalRevenue}</p>

        </div>
      )}

      <div className="dashboard-buttons">

        <button
          onClick={() => navigate("/restaurant/foods")}
        >
          🍔 Manage Foods
        </button>

        <button
          onClick={() => navigate("/restaurant/foods")}
        >
          ➕ Add Food
        </button>

        <button
          onClick={() => alert("Orders page coming next!")}
        >
          📦 View Orders
        </button>

      </div>

    </div>
  );
}

export default RestaurantDashboard;