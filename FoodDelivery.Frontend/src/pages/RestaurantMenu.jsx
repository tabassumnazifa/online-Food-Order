import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingFoodId, setAddingFoodId] = useState(null);

  // Get logged-in user's role
  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole =
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
    } catch (error) {
      console.error("Error reading user role:", error);
    }
  }

  const isCustomer = userRole === "Customer";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch foods for this restaurant
      const foodsResponse = await axios.get(
        `http://localhost:5079/api/Food/restaurant/${id}`
      );
      setFoods(foodsResponse.data);

      // Try to fetch restaurant details (Name, Description, Rating, Address)
      try {
        const restResponse = await axios.get(
          `http://localhost:5079/api/Restaurant/${id}`
        );
        setRestaurant(restResponse.data);
      } catch (restErr) {
        console.log("Could not fetch restaurant details, using basic header.");
        // Fallback: use name from first food item
        if (foodsResponse.data.length > 0) {
          setRestaurant({
            name: foodsResponse.data[0].restaurantName,
            description: "",
            rating: 0,
            address: ""
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (foodId) => {
    if (!isCustomer) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setAddingFoodId(foodId);
      await axios.post(
        "http://localhost:5079/api/Cart/add",
        { foodId: foodId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Food added to cart!");
    } catch (error) {
      const data = error.response?.data;
      let message = "Failed to add food to cart.";
      if (typeof data === "string") message = data;
      else if (data?.message) message = data.message;
      alert(message);
    } finally {
      setAddingFoodId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "2rem" }}>⏳</div>
        <h2>Loading menu...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      <button
        onClick={() => navigate("/restaurants")}
        style={{
          marginBottom: "25px",
          padding: "10px 20px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #ddd",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem"
        }}
      >
        ← Back to Restaurants
      </button>

      {/* Restaurant Header */}
      {restaurant && (
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            padding: "40px",
            borderRadius: "16px",
            marginBottom: "40px",
            boxShadow: "0 10px 30px rgba(245, 87, 108, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
            <span style={{ fontSize: "3rem" }}>🏪</span>
            <h1 style={{ margin: 0, fontSize: "2.5rem" }}>{restaurant.name || "Restaurant"}</h1>
          </div>
          
          {restaurant.description && (
            <p style={{ fontSize: "1.2rem", opacity: 0.95, marginBottom: "20px", lineHeight: 1.6 }}>
              {restaurant.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", fontSize: "1rem" }}>
            {restaurant.rating > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                ⭐ <strong>{restaurant.rating.toFixed(1)}</strong>
              </span>
            )}
            {restaurant.address && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                📍 {restaurant.address}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Food Menu Header */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8rem", color: "#2c3e50", marginBottom: "5px" }}>
          🍽️ Menu <span style={{ color: "#888", fontWeight: "400", fontSize: "1rem" }}>({foods.length} items)</span>
        </h2>
      </div>

      {/* Food Grid */}
      {foods.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🍽️</div>
          <h3>No food items available</h3>
          <p style={{ color: "#666" }}>This restaurant hasn't added any items to their menu yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px"
          }}
        >
          {foods.map((food) => (
            <div
              key={food.id}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid #f0f0f0"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#2c3e50" }}>
                  {food.name}
                </h3>
                <span style={{ fontSize: "1.5rem" }}>🍴</span>
              </div>

              <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "20px", flex: 1 }}>
                {food.description || "Delicious item from the menu."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#f5576c" }}>
                  ৳{food.price}
                </span>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    backgroundColor: food.isAvailable ? "#d4edda" : "#f8d7da",
                    color: food.isAvailable ? "#155724" : "#721c24"
                  }}
                >
                  {food.isAvailable ? "✅ Available" : "❌ Unavailable"}
                </span>
              </div>

              {isCustomer && (
                <button
                  type="button"
                  disabled={!food.isAvailable || addingFoodId === food.id}
                  onClick={() => handleAddToCart(food.id)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor:
                      !food.isAvailable || addingFoodId === food.id ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: !food.isAvailable || addingFoodId === food.id ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "1rem",
                    transition: "background-color 0.2s"
                  }}
                >
                  {addingFoodId === food.id
                    ? "⏳ Adding..."
                    : !food.isAvailable
                    ? "Unavailable"
                    : "🛒 Add to Cart"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;