import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AvailableOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Rider/available-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (error) {
      console.error("Available Orders Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as a delivery rider.");
        return;
      }

      setError("Failed to load available orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      setAccepting(orderId);

      await axios.put(
        `http://localhost:5079/api/Rider/accept-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order accepted successfully.");

      fetchOrders();
    } catch (error) {
      console.error("Accept Order Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to accept order."
      );

      fetchOrders();
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>📦 Available Orders</h1>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>📦 Available Orders</h1>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/rider/dashboard")}
          >
            ← Rider Dashboard
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
          <h1>📦 Available Orders</h1>

          <p style={{ color: "#666" }}>
            Orders currently waiting for a delivery rider.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/rider/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="dashboard-card">
          <h2>📭 No Available Orders</h2>

          <p>
            There are currently no orders waiting for a delivery
            rider.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {orders.map((order) => (
            <div
              className="dashboard-card"
              key={order.orderId}
            >
              <h2>📦 Order #{order.orderId}</h2>

              <p>
                <strong>Restaurant:</strong>{" "}
                {order.restaurantName}
              </p>

              <p>
                <strong>Restaurant Address:</strong>{" "}
                {order.restaurantAddress}
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                ৳{order.totalAmount}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order.status}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {order.orderDate
                  ? new Date(
                      order.orderDate
                    ).toLocaleString()
                  : "N/A"}
              </p>

              <button
                type="button"
                onClick={() => handleAccept(order.orderId)}
                disabled={accepting === order.orderId}
                style={{ marginTop: "15px" }}
              >
                {accepting === order.orderId
                  ? "Accepting..."
                  : "🛵 Accept Order"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableOrders;