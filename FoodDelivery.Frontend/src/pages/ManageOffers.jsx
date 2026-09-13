import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ManageOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5079/api/Offer/my-offers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId, title) => {
    if (!window.confirm(`Are you sure you want to delete the offer "${title}"?`)) return;

    try {
      await axios.delete(
        `http://localhost:5079/api/Offer/delete/${offerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Offer deleted successfully!");
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete offer.");
    }
  };

  if (loading) return <div className="dashboard-page"><div className="dashboard-card"><h1>🎁 Manage Offers</h1><p>Loading...</p></div></div>;
  if (error) return <div className="dashboard-page"><div className="dashboard-card"><h1>🎁 Manage Offers</h1><p>{error}</p></div></div>;

  return (
    <div className="dashboard-page" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>🎁 Manage Offers</h1>
          <p style={{ color: "#666" }}>View and manage your restaurant's promotional coupons.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={() => navigate("/restaurant/offers/create")} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}>
            + Create New Offer
          </button>
          <button type="button" onClick={() => navigate("/restaurant/dashboard")} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            ← Dashboard
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="dashboard-card">
          <h2>No Offers Found</h2>
          <p>You haven't created any promotional offers yet. Create one to attract more customers!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {offers.map((offer) => (
            <div className="dashboard-card" key={offer.id}>
              <h2>{offer.title}</h2>
              <p><strong>Code:</strong> <span style={{ backgroundColor: "#f8f9fa", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>{offer.couponCode}</span></p>
              <p><strong>Discount:</strong> {offer.discountPercentage}%</p>
              <p><strong>Max Discount:</strong> ৳{offer.maximumDiscount || "No Limit"}</p>
              <p><strong>Valid:</strong> {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {offer.isActive ? "🟢 Active" : "🔴 Inactive"}</p>
              
              <button 
                type="button" 
                onClick={() => handleDelete(offer.id, offer.title)}
                style={{ marginTop: "15px", padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}
              >
                🗑️ Delete Offer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageOffers;