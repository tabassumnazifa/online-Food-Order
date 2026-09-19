import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ==========================================
// DOCUMENT VIEWER MODAL COMPONENT
// ==========================================
function DocumentViewerModal({ restaurant, onClose }) {
  if (!restaurant) return null;

  // Fallback to common naming conventions if the API uses different keys
  const nidUrl = restaurant.nidDocumentUrl || restaurant.nidUrl || restaurant.documents?.nid;
  const licenseUrl = restaurant.tradeLicenseUrl || restaurant.licenseUrl || restaurant.documents?.license;

  const isPdf = (url) => url && url.toLowerCase().endsWith(".pdf");

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        <h2 style={modalStyles.title}>📄 Verification Documents: {restaurant.name}</h2>
        
        <div style={modalStyles.grid}>
          {/* NID Document */}
          <div style={modalStyles.docBox}>
            <h4 style={{ margin: "0 0 15px 0", color: "#555" }}>NID / Passport Copy</h4>
            {nidUrl ? (
              isPdf(nidUrl) ? (
                <>
                  <div style={{ ...modalStyles.image, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", backgroundColor: "#f8f9fa" }}>📄 PDF</div>
                  <a href={nidUrl} target="_blank" rel="noopener noreferrer" style={modalStyles.link}>View PDF Document ↗</a>
                </>
              ) : (
                <>
                  <img src={nidUrl} alt="NID" style={modalStyles.image} />
                  <a href={nidUrl} target="_blank" rel="noopener noreferrer" style={modalStyles.link}>Open Full Size ↗</a>
                </>
              )
            ) : (
              <p style={modalStyles.emptyText}>No NID uploaded</p>
            )}
          </div>

          {/* Trade License Document */}
          <div style={modalStyles.docBox}>
            <h4 style={{ margin: "0 0 15px 0", color: "#555" }}>Trade License</h4>
            {licenseUrl ? (
              isPdf(licenseUrl) ? (
                <>
                  <div style={{ ...modalStyles.image, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", backgroundColor: "#f8f9fa" }}>📄 PDF</div>
                  <a href={licenseUrl} target="_blank" rel="noopener noreferrer" style={modalStyles.link}>View PDF Document ↗</a>
                </>
              ) : (
                <>
                  <img src={licenseUrl} alt="Trade License" style={modalStyles.image} />
                  <a href={licenseUrl} target="_blank" rel="noopener noreferrer" style={modalStyles.link}>Open Full Size ↗</a>
                </>
              )
            ) : (
              <p style={modalStyles.emptyText}>No License uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  container: { backgroundColor: "white", borderRadius: "16px", padding: "30px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" },
  closeBtn: { position: "absolute", top: "15px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666" },
  title: { marginTop: 0, color: "#2c3e50", borderBottom: "2px solid #eee", paddingBottom: "15px", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  docBox: { border: "1px solid #eee", borderRadius: "12px", padding: "15px", textAlign: "center" },
  image: { width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" },
  link: { display: "inline-block", color: "#007bff", textDecoration: "none", fontWeight: "bold", fontSize: "14px" },
  emptyText: { color: "#999", padding: "40px 0", fontSize: "14px" }
};

// ==========================================
// MAIN ADMIN RESTAURANTS COMPONENT
// ==========================================
function AdminRestaurants() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // ✅ ADDED STATE FOR MODAL

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:5079/api/Admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Admin Restaurants:", response.data);
      setRestaurants(response.data);
    } catch (error) {
      console.error("Admin Restaurants Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (restaurant) => {
    const reason = window.prompt(`Why do you want to suspend "${restaurant.name}"?`);

    if (reason === null) return;
    if (!reason.trim()) {
      alert("Suspension reason is required.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5079/api/Admin/restaurants/${restaurant.id}/suspend`,
        reason.trim(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Restaurant suspended successfully.");
      fetchRestaurants();
    } catch (error) {
      console.error("Suspend Restaurant Error:", error);
      if (error.response?.status === 404) {
        alert("Restaurant not found.");
        fetchRestaurants();
        return;
      }
      if (error.response?.status === 400) {
        alert(error.response.data || "Unable to suspend restaurant.");
        return;
      }
      alert("Failed to suspend restaurant.");
    }
  };

  const handleUnsuspend = async (restaurant) => {
    const confirmed = window.confirm(`Are you sure you want to unsuspend "${restaurant.name}"?`);
    if (!confirmed) return;

    try {
      await axios.put(
        `http://localhost:5079/api/Admin/restaurants/${restaurant.id}/unsuspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Restaurant unsuspended successfully.");
      fetchRestaurants();
    } catch (error) {
      console.error("Unsuspend Restaurant Error:", error);
      if (error.response?.status === 404) {
        alert("Restaurant not found.");
        fetchRestaurants();
        return;
      }
      if (error.response?.status === 400) {
        alert(error.response.data || "Unable to unsuspend restaurant.");
        return;
      }
      alert("Failed to unsuspend restaurant.");
    }
  };

  if (loading) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-page-loading">
          <div className="admin-page-loading-icon">🏪</div>
          <h2>Loading restaurants</h2>
          <p>Please wait while we load restaurant information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-page-error">
          <div className="admin-page-error-icon">!</div>
          <h2>Unable to load restaurants</h2>
          <p>{error}</p>
          <button type="button" className="admin-primary-btn" onClick={() => navigate("/admin/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const suspendedCount = restaurants.filter((restaurant) => restaurant.isSuspended).length;
  const activeCount = restaurants.length - suspendedCount;

  return (
    <div className="admin-restaurants-page">
      {/* Header */}
      <section className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>
          <h1>Restaurant Management</h1>
          <p>Monitor, manage and control all restaurants registered on your food delivery platform.</p>
        </div>
        <button type="button" className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
          <span>←</span> Dashboard
        </button>
      </section>

      {/* Overview */}
      <section className="restaurant-overview">
        <div className="restaurant-overview-header">
          <div>
            <span className="section-eyebrow">OVERVIEW</span>
            <h2>Restaurant Status</h2>
          </div>
          <span className="restaurant-total-badge">{restaurants.length} Total</span>
        </div>

        <div className="restaurant-overview-grid">
          <div className="restaurant-overview-card overview-total">
            <div className="overview-icon">🏪</div>
            <div>
              <span>Total Restaurants</span>
              <strong>{restaurants.length}</strong>
            </div>
          </div>

          <div className="restaurant-overview-card overview-active">
            <div className="overview-icon">✓</div>
            <div>
              <span>Active Restaurants</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

          <div className="restaurant-overview-card overview-suspended">
            <div className="overview-icon">!</div>
            <div>
              <span>Suspended Restaurants</span>
              <strong>{suspendedCount}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="admin-restaurant-section">
        <div className="admin-restaurant-section-heading">
          <div>
            <span className="section-eyebrow">RESTAURANTS</span>
            <h2>Registered Restaurants</h2>
          </div>
          <p>Review restaurant information and manage account status.</p>
        </div>

        {restaurants.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🏪</div>
            <h2>No Restaurants</h2>
            <p>There are currently no registered restaurants in the system.</p>
          </div>
        ) : (
          <div className="admin-restaurant-grid">
            {restaurants.map((restaurant) => (
              <article
                className={`admin-restaurant-card ${restaurant.isSuspended ? "restaurant-suspended" : ""}`}
                key={restaurant.id}
              >
                {/* Card Header */}
                <div className="restaurant-card-header">
                  <div className="restaurant-card-icon">🏪</div>
                  <span className={`restaurant-status ${restaurant.isSuspended ? "status-suspended" : "status-active"}`}>
                    <span className="status-indicator"></span>
                    {restaurant.isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>

                {/* Restaurant Name */}
                <div className="restaurant-card-title">
                  <h3>{restaurant.name}</h3>
                  <span className="restaurant-id">Restaurant #{restaurant.id}</span>
                </div>

                {/* Restaurant Information */}
                <div className="restaurant-details">
                  <div className="restaurant-detail-item">
                    <span className="detail-icon">👤</span>
                    <div>
                      <small>Owner</small>
                      <strong>{restaurant.ownerName || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="restaurant-detail-item">
                    <span className="detail-icon">📍</span>
                    <div>
                      <small>Address</small>
                      <strong>{restaurant.address || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="restaurant-detail-item">
                    <span className="detail-icon">📞</span>
                    <div>
                      <small>Phone</small>
                      <strong>{restaurant.phone || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* Restaurant Stats */}
                <div className="restaurant-mini-stats">
                  <div>
                    <span>Foods</span>
                    <strong>{restaurant.totalFoods ?? 0}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong>⭐ {restaurant.averageRating ?? 0}</strong>
                  </div>
                </div>

                {/* Suspension Information */}
                {restaurant.isSuspended && (
                  <div className="suspension-box">
                    <div className="suspension-box-header">
                      <span>⚠</span>
                      <strong>Suspension Information</strong>
                    </div>
                    <p>{restaurant.suspensionReason || "No reason provided."}</p>
                    {restaurant.suspendedAt && (
                      <small>Suspended on {new Date(restaurant.suspendedAt).toLocaleString()}</small>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="restaurant-card-action" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* ✅ ADDED: View Documents Button */}
                  <button
                    type="button"
                    className="restaurant-action-btn"
                    style={{ backgroundColor: "#17a2b8", color: "white", border: "none" }}
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    <span>📄</span>
                    View Documents
                  </button>

                  {restaurant.isSuspended ? (
                    <button
                      type="button"
                      className="restaurant-action-btn unsuspend-btn"
                      onClick={() => handleUnsuspend(restaurant)}
                    >
                      <span>✓</span>
                      Unsuspend Restaurant
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="restaurant-action-btn suspend-btn"
                      onClick={() => handleSuspend(restaurant)}
                    >
                      <span>🔒</span>
                      Suspend Restaurant
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ✅ ADDED: Document Viewer Modal */}
      {selectedRestaurant && (
        <DocumentViewerModal 
          restaurant={selectedRestaurant} 
          onClose={() => setSelectedRestaurant(null)} 
        />
      )}
    </div>
  );
}

export default AdminRestaurants;