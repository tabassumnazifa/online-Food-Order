import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Order/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Orders response:", response.data);

      setOrders(response.data);
    } catch (error) {
      console.error("Orders loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">

      <h1>🧾 My Orders</h1>

      {loading && (
        <p>Loading orders...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div>
            <p>You haven't placed any orders yet.</p>

            <button
              onClick={() => navigate("/restaurants")}
            >
              🍔 Browse Restaurants
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        orders.length > 0 && (

          <div className="orders-list">

            {orders.map((order) => (

              <div
                className="order-card"
                key={order.orderId}
              >

                <h2>
                  Order #{order.orderId}
                </h2>

                <p>
                  <strong>Restaurant:</strong>{" "}
                  {order.restaurantName}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    order.orderDate
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  ৳{order.totalAmount}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {order.status}
                </p>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default Orders;