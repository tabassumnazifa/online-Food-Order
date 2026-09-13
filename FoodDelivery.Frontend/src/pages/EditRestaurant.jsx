import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EditRestaurant() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/my-restaurant",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const r = response.data;
      setName(r.name || "");
      setDescription(r.description || "");
      setAddress(r.address || "");
      setPhone(r.phone || "");
    } catch (err) {
      alert("Failed to load restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Restaurant Name is required!");

    try {
      setSaving(true);
      await axios.put(
        "http://localhost:5079/api/Restaurant/update",
        { name, description, address, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Restaurant profile updated successfully!");
      navigate("/restaurant/dashboard");
    } catch (err) {
      alert(err.response?.data || "Failed to update restaurant.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}><h2>Loading restaurant profile...</h2></div>;
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <button 
        onClick={() => navigate("/restaurant/dashboard")} 
        style={{ marginBottom: "25px", padding: "10px 16px", cursor: "pointer", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "6px", fontWeight: "600" }}
      >
        ← Back to Dashboard
      </button>
      
      <div style={{ backgroundColor: "white", padding: "35px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
        <h1 style={{ marginBottom: "10px", color: "#2c3e50" }}>✏️ Edit Restaurant Profile</h1>
        <p style={{ color: "#666", marginBottom: "30px", fontSize: "1.05rem" }}>Update your restaurant's public information. This changes how customers see your About text and address!</p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>Restaurant Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>About / Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4"
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box" }}
              placeholder="Tell customers about your food and vibe..." />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={saving}
            style={{ width: "100%", padding: "14px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
          >
            {saving ? "⏳ Saving..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditRestaurant;