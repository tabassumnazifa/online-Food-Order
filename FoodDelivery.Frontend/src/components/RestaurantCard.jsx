function RestaurantCard({ name, description, rating, location }) {
  return (
    <div className="restaurant-card">
      <h2>{name}</h2>

      <p>{description}</p>

      <p>⭐ {rating}</p>

      <p>📍 {location}</p>

      <button>View Menu</button>
    </div>
  );
}

export default RestaurantCard;