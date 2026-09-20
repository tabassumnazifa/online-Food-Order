import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RestaurantOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:5079/api/Restaurant/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Orders Error:", error);
      if (error.response?.status === 401) {
        setError("You are not authorized to view restaurant orders.");
      } else {
        setError(error.response?.data?.message || error.response?.data || "Failed to load restaurant orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = (status) => {
    if (!status) return "Pending";
    const normalized = status.toLowerCase();
    const map = {
      pending: "Pending", accepted: "Accepted", preparing: "Preparing",
      readyforpickup: "ReadyForPickup", outfordelivery: "OutForDelivery",
      delivered: "Delivered", cancelled: "Cancelled"
    };
    return map[normalized] || status;
  };

  const getAllowedStatuses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return ["Pending", "Accepted"];
      case "accepted": return ["Accepted", "Preparing"];
      case "preparing": return ["Preparing", "ReadyForPickup"];
      case "readyforpickup": return ["ReadyForPickup"];
      case "outfordelivery": return ["OutForDelivery"];
      case "delivered": return ["Delivered"];
      case "cancelled": return ["Cancelled"];
      default: return [status];
    }
  };

  const canUpdateStatus = (status) => {
    const normalized = status?.toLowerCase();
    return normalized === "pending" || normalized === "accepted" || normalized === "preparing";
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!status) return;
    try {
      setUpdating(orderId);
      await axios.put(
        `http://localhost:5079/api/Restaurant/update-order-status/${orderId}`,
        { status: status },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      alert("Order status updated successfully.");
      await fetchOrders();
    } catch (error) {
      console.error("Update Status Error:", error);
      alert(error.response?.data?.message || error.response?.data || "Failed to update order status.");
      await fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()).trim();
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
      accepted: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
      preparing: { bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe" },
      readyforpickup: { bg: "#ccfbf1", color: "#115e59", border: "#99f6e4" },
      outfordelivery: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
      delivered: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
      cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
    };
    return styles[s] || { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
  };

  // Calculate quick stats
  const pendingCount = orders.filter(o => getCurrentStatus(o.status) === "Pending").length;
  const preparingCount = orders.filter(o => getCurrentStatus(o.status) === "Preparing").length;
  const readyCount = orders.filter(o => getCurrentStatus(o.status) === "ReadyForPickup").length;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>⚠️ Unable to load orders</h2>
        <p>{error}</p>
        <button style={styles.primaryBtn} onClick={fetchOrders}>Try Again</button>
        <button style={styles.secondaryBtn} onClick={() => navigate("/restaurant/dashboard")}>← Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>RESTAURANT DASHBOARD</span>
          <h1 style={styles.title}>Order Management</h1>
          <p style={styles.subtitle}>Track incoming orders, update preparation status, and manage deliveries.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.secondaryBtn} onClick={() => navigate("/restaurant/dashboard")}>← Dashboard</button>
          <button style={styles.primaryBtn} onClick={fetchOrders}>↻ Refresh</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #f59e0b" }}>
          <span style={styles.statIcon}>⏳</span>
          <div>
            <p style={styles.statLabel}>Pending Orders</p>
            <h3 style={styles.statValue}>{pendingCount}</h3>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #8b5cf6" }}>
          <span style={styles.statIcon}>👨‍🍳</span>
          <div>
            <p style={styles.statLabel}>Preparing</p>
            <h3 style={styles.statValue}>{preparingCount}</h3>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #06b6d4" }}>
          <span style={styles.statIcon}>🍽️</span>
          <div>
            <p style={styles.statLabel}>Ready for Pickup</p>
            <h3 style={styles.statValue}>{readyCount}</h3>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
          <span style={styles.statIcon}>📦</span>
          <div>
            <p style={styles.statLabel}>Total Orders</p>
            <h3 style={styles.statValue}>{orders.length}</h3>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
          <h2>No Orders Yet</h2>
          <p>When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.map((order) => {
            const currentStatus = getCurrentStatus(order.status);
            const allowedStatuses = getAllowedStatuses(order.status);
            const restaurantCanUpdate = canUpdateStatus(order.status);
            const statusStyle = getStatusStyle(currentStatus);

            return (
              <div key={order.orderId} style={styles.orderCard}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.orderId}>Order #{order.orderId}</h3>
                    <p style={styles.orderDate}>
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`
                  }}>
                    {formatStatus(currentStatus)}
                  </span>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>👤</span>
                    <div>
                      <small style={styles.infoLabel}>Customer ID</small>
                      <p style={styles.infoValue}>{order.customerId || "N/A"}</p>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>💰</span>
                    <div>
                      <small style={styles.infoLabel}>Total Amount</small>
                      <p style={{ ...styles.infoValue, color: "#059669", fontWeight: "800", fontSize: "18px" }}>
                        ৳{Number(order.totalAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Control */}
                <div style={styles.controlSection}>
                  <label style={styles.controlLabel}>Update Status:</label>
                  <select
                    value={currentStatus}
                    disabled={!restaurantCanUpdate || updating === order.orderId}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus && newStatus !== currentStatus) {
                        updateOrderStatus(order.orderId, newStatus);
                      }
                    }}
                    style={{
                      ...styles.selectInput,
                      opacity: (!restaurantCanUpdate || updating === order.orderId) ? 0.6 : 1,
                      cursor: (!restaurantCanUpdate || updating === order.orderId) ? "not-allowed" : "pointer"
                    }}
                  >
                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>{formatStatus(status)}</option>
                    ))}
                  </select>
                  {updating === order.orderId && (
                    <span style={styles.updatingText}>⏳ Updating...</span>
                  )}
                </div>

                {/* Contextual Status Messages */}
                {currentStatus === "ReadyForPickup" && (
                  <div style={{ ...styles.alertBanner, backgroundColor: "#ccfbf1", color: "#115e59", border: "1px solid #99f6e4" }}>
                    🛵 <strong>Ready for pickup!</strong> Waiting for a delivery rider to claim this order.
                  </div>
                )}
                {currentStatus === "OutForDelivery" && (
                  <div style={{ ...styles.alertBanner, backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                    🛵 <strong>On the way!</strong> A rider has picked up the order and is heading to the customer.
                  </div>
                )}
                {currentStatus === "Delivered" && (
                  <div style={{ ...styles.alertBanner, backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                    ✅ <strong>Completed!</strong> This order was delivered successfully.
                  </div>
                )}
                {currentStatus === "Cancelled" && (
                  <div style={{ ...styles.alertBanner, backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
                    ❌ <strong>Cancelled.</strong> This order was cancelled and will not be prepared.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODERN INLINE STYLES
// ==========================================
const styles = {
  pageContainer: { padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#1f2937" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" },
  eyebrow: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "8px" },
  title: { fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0", color: "#111827" },
  subtitle: { fontSize: "16px", color: "#6b7280", margin: 0 },
  primaryBtn: { padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" },
  secondaryBtn: { padding: "10px 20px", backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "15px" },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "13px", color: "#6b7280", fontWeight: "500", margin: "0 0 4px 0" },
  statValue: { fontSize: "24px", fontWeight: "800", margin: 0, color: "#111827" },

  ordersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  orderCard: { backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #f3f4f6", overflow: "hidden", display: "flex", flexDirection: "column" },
  cardHeader: { padding: "20px 20px 15px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0", color: "#111827" },
  orderDate: { fontSize: "13px", color: "#6b7280", margin: 0 },
  badge: { fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" },
  
  cardBody: { padding: "20px", flex: 1 },
  infoRow: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "15px" },
  infoIcon: { fontSize: "18px", marginTop: "2px" },
  infoLabel: { fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", display: "block" },
  infoValue: { fontSize: "14px", fontWeight: "600", color: "#374151", margin: "2px 0 0 0" },

  controlSection: { padding: "15px 20px", backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6" },
  controlLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" },
  selectInput: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#111827", outline: "none", transition: "border-color 0.2s" },
  updatingText: { display: "block", fontSize: "12px", color: "#2563eb", fontWeight: "600", marginTop: "8px", textAlign: "center" },

  alertBanner: { margin: "0 20px 20px 20px", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },

  loadingContainer: { textAlign: "center", padding: "100px 20px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  errorContainer: { textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #fecaca", maxWidth: "500px", margin: "40px auto" },
  emptyState: { textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default RestaurantOrders;