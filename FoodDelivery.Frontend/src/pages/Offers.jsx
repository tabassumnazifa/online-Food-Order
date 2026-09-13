import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        "http://localhost:5079/api/Offer/active",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers(response.data || []);
    } catch (err) {
      console.error("Failed to load offers:", err);
      if (err.response?.status === 401) setError("Please login to view available offers.");
      else if (err.response?.status === 403) setError("Only customers can view offers.");
      else setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
  };

  // Unauthenticated State
  if (!token) {
    return (
      <main style={{ textAlign: "center", padding: "80px 20px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>Exclusive Offers</h1>
        <p style={{ color: "#666", marginBottom: "30px", fontSize: "1.1rem" }}>
          Please log in to unlock special discounts and promo codes!
        </p>
        <button 
          onClick={() => navigate("/login")}
          style={{ padding: "12px 30px", backgroundColor: "#1b5e20", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}
        >
          Login to View Offers
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "6px 16px", borderRadius: "20px", fontWeight: "700", fontSize: "0.85rem", letterSpacing: "1px" }}>
          💰 EXCLUSIVE DEALS
        </span>
        <h1 style={{ fontSize: "2.6rem", color: "#1b5e20", margin: "15px 0 10px" }}>
          Available Offers
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
          Save big on your favorite meals! Copy the promo codes below and apply them at checkout.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⏳</div>
          <h3 style={{ color: "#555" }}>Finding the best deals for you...</h3>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "12px", maxWidth: "600px", margin: "0 auto" }}>
          <h3>Oops!</h3>
          <p>{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && offers.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#f8f9fa", borderRadius: "16px", border: "2px dashed #ddd" }}>
          <div style={{ fontSize: "4rem", marginBottom: "15px" }}>🎟️</div>
          <h2 style={{ color: "#333" }}>No active offers right now</h2>
          <p style={{ color: "#666", marginBottom: "25px" }}>
            Check back soon, or browse our restaurants to see what's cooking!
          </p>
          <button 
            onClick={() => navigate("/restaurants")}
            style={{ padding: "12px 24px", backgroundColor: "#1b5e20", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            Browse Restaurants →
          </button>
        </div>
      )}

      {/* OFFERS GRID */}
      {!loading && !error && offers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
                display: "flex",
                flexDirection: "column",
                transition: "transform .25s ease, box-shadow .25s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.06)";
              }}
            >
              {/* DISCOUNT BADGE */}
              <div style={{ 
                background: "linear-gradient(135deg, #ef4444, #f97316)", 
                color: "white", 
                padding: "20px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Discount</div>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", lineHeight: 1 }}>{offer.discountPercentage}% OFF</div>
                </div>
                <div style={{ fontSize: "2.5rem" }}>🎁</div>
              </div>

              {/* CARD BODY */}
              <div style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "15px", flex: 1 }}>
                <div>
                  <h2 style={{ margin: "0 0 5px 0", fontSize: "1.4rem", color: "#1f2937" }}>{offer.title}</h2>
                  <p style={{ margin: 0, color: "#1b5e20", fontWeight: "600", fontSize: "0.95rem" }}>
                    🏪 {offer.restaurantName}
                  </p>
                </div>

                {offer.description && (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {offer.description}
                  </p>
                )}

                {/* COUPON CODE BOX */}
                <div style={{ 
                  backgroundColor: "#fef3c7", 
                  border: "2px dashed #f59e0b", 
                  borderRadius: "12px", 
                  padding: "15px", 
                  textAlign: "center",
                  marginTop: "auto"
                }}>
                  <div style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase" }}>
                    Promo Code
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}>
                    <span style={{ 
                      fontFamily: "monospace", 
                      fontSize: "1.5rem", 
                      fontWeight: "800", 
                      color: "#92400e",
                      letterSpacing: "2px"
                    }}>
                      {offer.couponCode}
                    </span>
                    <button 
                      onClick={() => handleCopy(offer.couponCode, offer.id)}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: copiedId === offer.id ? "#10b981" : "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      {copiedId === offer.id ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* DETAILS FOOTER */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#6b7280", paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
                  <span>
                    💰 Max: <strong style={{color: "#374151"}}>{offer.maximumDiscount ? `৳${offer.maximumDiscount}` : 'No Limit'}</strong>
                  </span>
                  <span>
                    📅 Ends: <strong style={{color: "#374151"}}>{new Date(offer.endDate).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Offers;