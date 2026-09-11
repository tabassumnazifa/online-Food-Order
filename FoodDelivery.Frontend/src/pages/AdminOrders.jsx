import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin Orders:", response.data);

      setOrders(response.data);
    } catch (error) {
      console.error("Admin Orders Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Delivered") {
      return {
        backgroundColor: "#d4edda",
        color: "#155724",
      };
    }

    if (status === "Cancelled") {
      return {
        backgroundColor: "#f8d7da",
        color: "#721c24",
      };
    }

    if (status === "Placed") {
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
      };
    }

    if (status === "Accepted" || status === "PickedUp") {
      return {
        backgroundColor: "#cce5ff",
        color: "#004085",
      };
    }

    return {
      backgroundColor: "#e2e3e5",
      color: "#383d41",
    };
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>📦 Order Management</h1>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>📦 Order Management</h1>
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

  return (
    <div
      className="dashboard-page"
      style={{
        padding: "40px 20px",
        maxWidth: "1300px",
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
          <h1>📦 Order Management</h1>
          <p style={{ color: "#666" }}>
            Monitor all orders placed throughout the food delivery system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div
        className="dashboard-card"
        style={{ marginBottom: "25px" }}
      >
        <h2>📊 Order Overview</h2>

        <p>
          <strong>Total Orders:</strong> {orders.length}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="dashboard-card">
          <h2>📦 No Orders</h2>
          <p>There are currently no orders in the system.</p>
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
              key={order.id}
            >
              <h2>📦 Order #{order.id}</h2>

              <p>
                <strong>Customer:</strong>{" "}
                {order.customerName || "N/A"}
              </p>

              <p>
                <strong>Restaurant:</strong>{" "}
                {order.restaurantName || "N/A"}
              </p>

              <p>
                <strong>Delivery Rider:</strong>{" "}
                {order.riderName || "Not Assigned"}
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                ৳{order.totalAmount ?? 0}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleString()
                  : "N/A"}
              </p>

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Order Status:</strong>
                </p>

                <span
                  style={{
                    ...getStatusStyle(order.orderStatus),
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontWeight: "600",
                    display: "inline-block",
                  }}
                >
                  {order.orderStatus || "Unknown"}
                </span>
              </div>

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Payment Status:</strong>
                </p>

                <span
                  style={{
                    ...getStatusStyle(order.paymentStatus),
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontWeight: "600",
                    display: "inline-block",
                  }}
                >
                  {order.paymentStatus || "Unknown"}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/orders/${order.id}`)
                }
                style={{ marginTop: "20px" }}
              >
                👁️ View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;