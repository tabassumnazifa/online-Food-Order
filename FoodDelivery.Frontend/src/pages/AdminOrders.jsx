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
      const response = await axios.get("http://localhost:5079/api/Admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const getOrderStatusText = (status) => {
    const map = {
      0: "Pending", 1: "Accepted", 2: "Preparing", 3: "Ready for Pickup",
      4: "Out for Delivery", 5: "Delivered", 6: "Cancelled",
      Pending: "Pending", Accepted: "Accepted", Preparing: "Preparing",
      ReadyForPickup: "Ready for Pickup", OutForDelivery: "Out for Delivery",
      Delivered: "Delivered", Cancelled: "Cancelled",
    };
    return map[status] ?? (status || "Unknown");
  };

  const getPaymentStatusText = (status) => {
    const map = {
      1: "Pending", 2: "Paid", 3: "Failed", 4: "Cancelled",
      Pending: "Pending", Paid: "Paid", Failed: "Failed", Cancelled: "Cancelled",
    };
    return map[status] ?? (status || "Unknown");
  };

  const getStatusStyle = (status) => {
    const styles = {
      "Delivered": { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
      "Paid": { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
      "Cancelled": { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
      "Failed": { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
      "Pending": { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
      "Preparing": { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
      "Ready for Pickup": { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
      "Accepted": { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
      "Out for Delivery": { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
    };
    return styles[status] || { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
  };

  // Calculate quick stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => getOrderStatusText(o.orderStatus) === "Pending" || getOrderStatusText(o.orderStatus) === "Preparing").length;
  const deliveredOrders = orders.filter(o => getOrderStatusText(o.orderStatus) === "Delivered").length;

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
        <button style={styles.primaryBtn} onClick={() => navigate("/admin/dashboard")}>← Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>ADMINISTRATION</span>
          <h1 style={styles.title}>Order Management</h1>
          <p style={styles.subtitle}>Monitor, track, and manage all food delivery orders across the platform.</p>
        </div>
        <button style={styles.secondaryBtn} onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: "4px solid #3b82f6"}}>
          <span style={styles.statIcon}>📦</span>
          <div>
            <p style={styles.statLabel}>Total Orders</p>
            <h3 style={styles.statValue}>{orders.length}</h3>
          </div>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #f59e0b"}}>
          <span style={styles.statIcon}>⏳</span>
          <div>
            <p style={styles.statLabel}>Pending / Active</p>
            <h3 style={styles.statValue}>{pendingOrders}</h3>
          </div>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #10b981"}}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <p style={styles.statLabel}>Successfully Delivered</p>
            <h3 style={styles.statValue}>{deliveredOrders}</h3>
          </div>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #8b5cf6"}}>
          <span style={styles.statIcon}>৳</span>
          <div>
            <p style={styles.statLabel}>Total Revenue</p>
            <h3 style={styles.statValue}>৳{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
          <h2>No Orders Found</h2>
          <p>There are currently no orders in the system. Check back later!</p>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.map((order) => {
            const orderStatusText = getOrderStatusText(order.orderStatus);
            const paymentStatusText = getPaymentStatusText(order.paymentStatus);
            const orderStyle = getStatusStyle(orderStatusText);
            const paymentStyle = getStatusStyle(paymentStatusText);

            return (
              <div key={order.id} style={styles.orderCard}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.orderId}>Order #{order.id}</h3>
                    <p style={styles.orderDate}>
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div style={styles.badgeGroup}>
                    <span style={{...styles.badge, backgroundColor: orderStyle.bg, color: orderStyle.color, border: `1px solid ${orderStyle.border}`}}>
                      {orderStatusText}
                    </span>
                    <span style={{...styles.badge, backgroundColor: paymentStyle.bg, color: paymentStyle.color, border: `1px solid ${paymentStyle.border}`}}>
                      {paymentStatusText}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>👤</span>
                    <div>
                      <small style={styles.infoLabel}>Customer</small>
                      <p style={styles.infoValue}>{order.customerName || "N/A"}</p>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>🏪</span>
                    <div>
                      <small style={styles.infoLabel}>Restaurant</small>
                      <p style={styles.infoValue}>{order.restaurantName || "N/A"}</p>
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>🛵</span>
                    <div>
                      <small style={styles.infoLabel}>Rider</small>
                      <p style={styles.infoValue}>{order.riderName || "Not Assigned"}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  <div style={styles.totalAmount}>
                    <small>Total Amount</small>
                    <h4 style={styles.amountValue}>৳{order.totalAmount?.toFixed(2) || "0.00"}</h4>
                  </div>
                  <button style={styles.actionBtn}>
                    View Details →
                  </button>
                </div>
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
  pageContainer: { padding: "40px 20px", maxWidth: "1400px", margin: "0 auto", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#1f2937" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" },
  eyebrow: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "8px" },
  title: { fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0", color: "#111827" },
  subtitle: { fontSize: "16px", color: "#6b7280", margin: 0 },
  primaryBtn: { padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { padding: "10px 20px", backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "15px" },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "13px", color: "#6b7280", fontWeight: "500", margin: "0 0 4px 0" },
  statValue: { fontSize: "24px", fontWeight: "800", margin: 0, color: "#111827" },

  ordersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  orderCard: { backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #f3f4f6", transition: "transform 0.2s, box-shadow 0.2s", overflow: "hidden" },
  cardHeader: { padding: "20px 20px 15px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0", color: "#111827" },
  orderDate: { fontSize: "13px", color: "#6b7280", margin: 0 },
  badgeGroup: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" },
  badge: { fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" },
  
  cardBody: { padding: "20px" },
  infoRow: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "15px" },
  infoIcon: { fontSize: "18px", marginTop: "2px" },
  infoLabel: { fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px", display: "block" },
  infoValue: { fontSize: "14px", fontWeight: "600", color: "#374151", margin: "2px 0 0 0" },

  cardFooter: { padding: "15px 20px", backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalAmount: { display: "flex", flexDirection: "column" },
  amountValue: { fontSize: "20px", fontWeight: "800", color: "#059669", margin: "2px 0 0 0" },
  actionBtn: { padding: "8px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" },

  loadingContainer: { textAlign: "center", padding: "100px 20px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  errorContainer: { textAlign: "center", padding: "100px 20px", backgroundColor: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca" },
  emptyState: { textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default AdminOrders;