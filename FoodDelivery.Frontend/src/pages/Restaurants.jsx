import RestaurantCard from "../components/RestaurantCard";

function Restaurants() {
  const restaurants = [
    {
      name: "🍕 Pizza Hut",
      description: "Best Pizza in Town",
      rating: 4.8,
      location: "Mirpur, Dhaka",
    },
    {
      name: "🍔 Burger King",
      description: "Delicious Burgers",
      rating: 4.6,
      location: "Uttara, Dhaka",
    },
    {
      name: "🍗 KFC",
      description: "Crispy Fried Chicken",
      rating: 4.7,
      location: "Dhanmondi, Dhaka",
    },
  ];

  return (
    <div>
      <h1>Restaurants</h1>
      <p>Choose your favorite restaurant.</p>

      <RestaurantCard
        name={restaurants[0].name}
        description={restaurants[0].description}
        rating={restaurants[0].rating}
        location={restaurants[0].location}
      />

      <RestaurantCard
        name={restaurants[1].name}
        description={restaurants[1].description}
        rating={restaurants[1].rating}
        location={restaurants[1].location}
      />

      <RestaurantCard
        name={restaurants[2].name}
        description={restaurants[2].description}
        rating={restaurants[2].rating}
        location={restaurants[2].location}
      />
    </div>
  );
}

export default Restaurants;