import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/all"
      );

      setRestaurants(response.data || []);
    } catch (err) {
      console.error("Restaurants loading error:", err);
      setError("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const rounded = Math.round(Number(rating || 0));
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  if (loading) {
    return (
      <main style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "3rem" }}>🍽️</div>
        <h2>Finding the best restaurants for you...</h2>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* =========================
          HEADER (NO SEARCH BOX)
          ========================= */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span
          style={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "6px 16px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "0.85rem",
            letterSpacing: "1px",
          }}
        >
          🍔 FOOD DELIVERY
        </span>

        <h1 style={{ fontSize: "2.6rem", color: "#1b5e20", margin: "15px 0 10px" }}>
          Restaurants
        </h1>

        <p style={{ color: "#666", fontSize: "1.1rem" }}>
          Choose your favorite restaurant and order delicious food.
        </p>
      </div>

      {/* =========================
          ERROR
          ========================= */}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "12px",
          }}
        >
          <h3>Unable to load restaurants</h3>
          <p>{error}</p>
          <button
            onClick={fetchRestaurants}
            style={{
              marginTop: "10px",
              padding: "10px 24px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#721c24",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* =========================
          EMPTY
          ========================= */}
      {!error && restaurants.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "16px",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🍽️</div>
          <h3>No restaurants found</h3>
          <p style={{ color: "#666" }}>There are no restaurants yet.</p>
        </div>
      )}

      {/* =========================
          RESTAURANT CARDS
          ========================= */}
      {!error && restaurants.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
          }}
        >
          {restaurants.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                border: "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
              }}
            >
              {/* GREEN BANNER */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1b5e20, #43a047)",
                  padding: "28px 24px",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "2.6rem" }}>🏪</span>

                {r.isSuspended ? (
                  <span
                    style={{
                      backgroundColor: "#dc3545",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    ⛔ TEMPORARILY CLOSED
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    ● OPEN NOW
                  </span>
                )}
              </div>

              {/* CARD BODY */}
              <div
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  flex: 1,
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#212121" }}>
                  {r.name}
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#f9a825",
                    fontWeight: "700",
                  }}
                >
                  <span style={{ letterSpacing: "2px" }}>
                    {renderStars(r.rating)}
                  </span>
                  <span style={{ color: "#555" }}>
                    {Number(r.rating || 0).toFixed(1)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                  <span>📍</span>
                  <span>{r.address || "Address not available"}</span>
                </div>

                <button
                  type="button"
                  disabled={r.isSuspended}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                  style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "13px",
                    backgroundColor: r.isSuspended ? "#ccc" : "#1b5e20",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: r.isSuspended ? "not-allowed" : "pointer",
                  }}
                >
                  {r.isSuspended ? "Unavailable" : "View Menu →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Restaurants;