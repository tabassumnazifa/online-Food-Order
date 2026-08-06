import { useNavigate } from "react-router-dom";

function RestaurantCard({
  id,
  name,
  description,
  rating,
  location,
}) {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    navigate(`/restaurant/${id}`);
  };

  return (
    <div className="restaurant-card">
      <h2>{name}</h2>

      <p>{description}</p>

      <p>
        ⭐ <strong>{rating ?? 4.5}</strong>
      </p>

      <p>📍 {location}</p>

      <button
        className="view-menu-btn"
        onClick={handleViewMenu}
      >
        View Menu
      </button>
    </div>
  );
}

export default RestaurantCard;