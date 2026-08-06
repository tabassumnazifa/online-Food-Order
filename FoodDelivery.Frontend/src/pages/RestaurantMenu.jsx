import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function RestaurantMenu() {
  const { id } = useParams();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
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

    fetchFoods();
  }, [id]);

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
                  <span style={{ color: "green" }}>✅ Available</span>
                ) : (
                  <span style={{ color: "red" }}>❌ Unavailable</span>
                )}
              </p>

              <button
                disabled={!food.isAvailable}
                className="add-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;