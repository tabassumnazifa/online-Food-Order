import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Verification() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5079/api";

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // File states
  const [nidFile, setNidFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`${API_URL}/Restaurant/verification-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus(response.data);

      // If the admin already approved them, send them straight to the dashboard!
      if (!response.data.isSuspended) {
        navigate("/restaurant/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!nidFile || !licenseFile) {
      setError("Please select both your NID copy and Trade License.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("nidFile", nidFile);
      formData.append("licenseFile", licenseFile);

      await axios.post(`${API_URL}/Restaurant/upload-documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg("Documents uploaded successfully! Waiting for Admin approval.");
      setNidFile(null);
      setLicenseFile(null);
      
      // Refresh status to update the UI
      fetchStatus();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to upload documents.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "3rem" }}>⏳</div>
        <h2>Checking verification status...</h2>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      
      <div style={{ backgroundColor: "#fff3cd", color: "#856404", padding: "20px", borderRadius: "12px", marginBottom: "30px", border: "1px solid #ffeeba", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 10px 0" }}>⚠️ Restaurant Pending Verification</h2>
        <p style={{ margin: 0 }}>
          Your restaurant is currently suspended. To activate your restaurant and start receiving orders, 
          please upload your valid identification and restaurant trade license below for Admin review.
        </p>
      </div>

      {/* IF DOCS ALREADY UPLOADED */}
      {status?.docsSubmitted ? (
        <div style={{ backgroundColor: "#d1ecf1", color: "#0c5460", padding: "30px", borderRadius: "12px", border: "1px solid #bee5eb", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📄✅</div>
          <h2 style={{ margin: "0 0 10px 0" }}>Documents Received!</h2>
          <p>
            Our Admin team is currently reviewing your NID and Trade License. 
            You will receive access to your dashboard as soon as they are approved.
          </p>
          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            Please check back later, or wait for an email notification.
          </p>
        </div>
      ) : (
        /* UPLOAD FORM */
        <form onSubmit={handleUpload} style={{ backgroundColor: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
          <h2 style={{ marginTop: 0, color: "#2c3e50" }}>📤 Upload Verification Documents</h2>
          <p style={{ color: "#666", marginBottom: "25px" }}>
            Accepted formats: JPG, PNG, or PDF. Maximum size: 10MB each.
          </p>

          {/* NID INPUT */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
              1. NID / Passport Copy *
            </label>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setNidFile(e.target.files[0])}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
            />
          </div>

          {/* TRADE LICENSE INPUT */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
              2. Restaurant Trade License *
            </label>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setLicenseFile(e.target.files[0])}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
            />
          </div>

          {error && <p style={{ color: "#dc3545", backgroundColor: "#f8d7da", padding: "10px", borderRadius: "6px" }}>{error}</p>}
          {successMsg && <p style={{ color: "#155724", backgroundColor: "#d4edda", padding: "10px", borderRadius: "6px" }}>{successMsg}</p>}

          <button 
            type="submit" 
            disabled={uploading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: uploading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: uploading ? "not-allowed" : "pointer",
              marginTop: "10px"
            }}
          >
            {uploading ? "⏳ Uploading..." : "🔒 Submit for Review"}
          </button>
        </form>
      )}
    </main>
  );
}

export default Verification;