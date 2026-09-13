import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminPendingApprovals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  
  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5079/api";

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Admin/pending-verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovals(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to APPROVE and activate "${restaurantName}"? They will be able to receive orders immediately.`)) return;

    try {
      setApprovingId(restaurantId);
      await axios.put(
        `${API_URL}/Admin/restaurants/${restaurantId}/unsuspend`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${restaurantName} has been approved and is now LIVE!`);
      
      // Remove from the list visually
      setApprovals(approvals.filter(a => a.restaurantId !== restaurantId));
    } catch (err) {
      alert("Failed to approve restaurant.");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>🛡️ Pending Approvals</h1>
          <p>Loading verification requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>🛡️ Pending Approvals</h1>
          <p style={{ color: "#666" }}>Review uploaded NID and Trade License documents to activate new restaurants.</p>
        </div>
        <button type="button" onClick={() => navigate("/admin/dashboard")} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          ← Back to Dashboard
        </button>
      </div>

      {approvals.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎉</div>
          <h2>All Caught Up!</h2>
          <p>There are currently no restaurants waiting for verification.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
          {approvals.map((app) => (
            <div className="dashboard-card" key={app.restaurantId} style={{ borderLeft: "5px solid #ffc107" }}>
              <h2 style={{ marginTop: 0, color: "#2c3e50" }}>{app.restaurantName}</h2>
              
              <p style={{ margin: "5px 0" }}><strong>Owner:</strong> {app.ownerName}</p>
              <p style={{ margin: "5px 0" }}><strong>Email:</strong> {app.ownerEmail}</p>
              <p style={{ margin: "5px 0" }}><strong>Phone:</strong> {app.phone || "N/A"}</p>
              <p style={{ margin: "5px 0" }}><strong>Address:</strong> {app.address || "N/A"}</p>
              
              <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "10px" }}>
                Submitted: {new Date(app.suspendedAt).toLocaleString()}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                <a 
                  href={`http://localhost:5079${app.nidUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ flex: 1, textAlign: "center", padding: "10px", backgroundColor: "#e9ecef", color: "#333", borderRadius: "6px", textDecoration: "none", fontWeight: "600", minWidth: "120px" }}
                >
                  🪪 View NID
                </a>
                <a 
                  href={`http://localhost:5079${app.licenseUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ flex: 1, textAlign: "center", padding: "10px", backgroundColor: "#e9ecef", color: "#333", borderRadius: "6px", textDecoration: "none", fontWeight: "600", minWidth: "120px" }}
                >
                  📜 View License
                </a>
              </div>

              <button 
                type="button" 
                disabled={approvingId === app.restaurantId}
                onClick={() => handleApprove(app.restaurantId, app.restaurantName)}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  backgroundColor: approvingId === app.restaurantId ? "#6c757d" : "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "1rem", 
                  fontWeight: "bold", 
                  cursor: approvingId === app.restaurantId ? "not-allowed" : "pointer" 
                }}
              >
                {approvingId === app.restaurantId ? "Approving..." : "✅ Approve & Activate Restaurant"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPendingApprovals;