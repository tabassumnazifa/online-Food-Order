
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function RestaurantMenu() {
  const { id } = useParams();

  const [foods, setFoods] = useState([]);
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
    fetchFoods();
  }, [id]);

  const fetchFoods = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5079/api/Food/restaurant/${id}`
      );

      setFoods(response.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (foodId) => {
    if (!isCustomer) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setAddingFoodId(foodId);

      const response = await axios.post(
        "http://localhost:5079/api/Cart/add",
        {
          foodId: foodId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Add to cart response:", response.data);

      alert("Food added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);

      const data = error.response?.data;

      let message = "Failed to add food to cart.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }

      alert(message);
    } finally {
      setAddingFoodId(null);
    }
  };

  return (
    <div className="restaurant-menu-page">
      <h1>Restaurant Menu</h1>

      {loading ? (
        <p>Loading menu...</p>
      ) : foods.length === 0 ? (
        <p>No food items available.</p>
      ) : (
        <div className="food-grid">
          {foods.map((food) => (
            <div className="food-card" key={food.id}>
              <h2>{food.name}</h2>

              <p>{food.description}</p>

              <h3>৳ {food.price}</h3>

              <p>
                {food.isAvailable ? (
                  <span style={{ color: "green" }}>
                    ✅ Available
                  </span>
                ) : (
                  <span style={{ color: "red" }}>
                    ❌ Unavailable
                  </span>
                )}
              </p>

              {/* Only Customers can add food to cart */}
              {isCustomer && (
                <button
                  type="button"
                  disabled={
                    !food.isAvailable ||
                    addingFoodId === food.id
                  }
                  className="add-cart-btn"
                  onClick={() => handleAddToCart(food.id)}
                >
                  {addingFoodId === food.id
                    ? "Adding..."
                    : "Add to Cart"}
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
