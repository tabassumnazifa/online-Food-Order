import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminNotifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null); // For the document modal

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5079/api/Notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5079/api/Notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state so it disappears from unread list
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost:5079/api/Notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleViewDocuments = async (notification) => {
    // Mark as read when they click to view
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setSelectedNotif(notification);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div style={styles.center}>Loading notifications...</div>;

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>ADMINISTRATION</span>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>
            You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? "s" : ""}.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {unreadCount > 0 && (
            <button style={styles.secondaryBtn} onClick={markAllAsRead}>
              ✓ Mark All as Read
            </button>
          )}
          <button style={styles.secondaryBtn} onClick={() => navigate("/admin/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}></div>
          <h2>All Caught Up!</h2>
          <p>You have no notifications at this time.</p>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              style={{
                ...styles.notifCard, 
                backgroundColor: notif.isRead ? "#ffffff" : "#f0f9ff",
                borderLeft: notif.isRead ? "4px solid #e5e7eb" : "4px solid #3b82f6"
              }}
            >
              <div style={styles.notifHeader}>
                <span style={styles.notifIcon}></span>
                <div style={{ flex: 1 }}>
                  <p style={styles.notifMessage}>{notif.message}</p>
                  <small style={styles.notifDate}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>
                </div>
                {!notif.isRead && <span style={styles.unreadDot}></span>}
              </div>

              {/* Action Button for Restaurant Documents */}
              {notif.relatedEntityType === "Restaurant" && (
                <button 
                  style={styles.actionBtn}
                  onClick={() => handleViewDocuments(notif)}
                >
                  📄 View Documents & Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple Document Modal */}
      {selectedNotif && (
        <div style={modalStyles.overlay} onClick={() => setSelectedNotif(null)}>
          <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedNotif(null)} style={modalStyles.closeBtn}>✕</button>
            <h2 style={modalStyles.title}>Reviewing: Restaurant ID #{selectedNotif.relatedEntityId}</h2>
            <p style={{color: "#666", marginBottom: "20px"}}>
              Please review the uploaded documents below. Once verified, go to the Restaurant Management page to unsuspend the restaurant.
            </p>
            
            <div style={modalStyles.grid}>
              <div style={modalStyles.docBox}>
                <h4>NID / Passport</h4>
                <img 
                  src={`http://localhost:5079/uploads/rest_${selectedNotif.relatedEntityId}_nid.jpg`} 
                  alt="NID" 
                  style={modalStyles.image}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }}
                />
                <a href={`http://localhost:5079/uploads/rest_${selectedNotif.relatedEntityId}_nid.jpg`} target="_blank" style={modalStyles.link}>Open Full Size ↗</a>
              </div>
              <div style={modalStyles.docBox}>
                <h4>Trade License</h4>
                <img 
                  src={`http://localhost:5079/uploads/rest_${selectedNotif.relatedEntityId}_license.jpg`} 
                  alt="License" 
                  style={modalStyles.image}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }}
                />
                <a href={`http://localhost:5079/uploads/rest_${selectedNotif.relatedEntityId}_license.jpg`} target="_blank" style={modalStyles.link}>Open Full Size ↗</a>
              </div>
            </div>

            <button 
              style={{...styles.primaryBtn, marginTop: "20px", width: "100%"}}
              onClick={() => { setSelectedNotif(null); navigate("/admin/restaurants"); }}
            >
              Go to Restaurant Management to Approve →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  pageContainer: { padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", color: "#1f2937" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" },
  eyebrow: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "8px" },
  title: { fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0", color: "#111827" },
  subtitle: { fontSize: "16px", color: "#6b7280", margin: 0 },
  primaryBtn: { padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { padding: "10px 20px", backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  
  listContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  notifCard: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", padding: "20px", transition: "all 0.2s" },
  notifHeader: { display: "flex", alignItems: "flex-start", gap: "15px" },
  notifIcon: { fontSize: "24px" },
  notifMessage: { fontSize: "16px", fontWeight: "500", margin: "0 0 5px 0", color: "#111827" },
  notifDate: { fontSize: "13px", color: "#9ca3af" },
  unreadDot: { width: "10px", height: "10px", backgroundColor: "#3b82f6", borderRadius: "50%", marginTop: "5px" },
  actionBtn: { marginTop: "15px", padding: "8px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "block", width: "fit-content" },
  
  center: { textAlign: "center", padding: "100px 20px", fontSize: "18px", color: "#6b7280" },
  emptyState: { textAlign: "center", padding: "80px 20px", backgroundColor: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  container: { backgroundColor: "white", borderRadius: "16px", padding: "30px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" },
  closeBtn: { position: "absolute", top: "15px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666" },
  title: { marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #eee", paddingBottom: "15px", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  docBox: { border: "1px solid #eee", borderRadius: "12px", padding: "15px", textAlign: "center" },
  image: { width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" },
  link: { display: "inline-block", color: "#007bff", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }
};

export default AdminNotifications;