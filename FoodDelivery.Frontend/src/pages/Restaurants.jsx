import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5079/api/Restaurant/all"
        );

        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="restaurants-page">
      <h1>Restaurants</h1>
      <p>Choose your favorite restaurant.</p>

      {loading ? (
        <p>Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            description={restaurant.description}
            rating={restaurant.rating ?? 4.5}
            location={restaurant.address}
            isSuspended={restaurant.isSuspended}
            suspensionReason={restaurant.suspensionReason}
          />
        ))
      )}
    </div>
  );
}

export default Restaurants;