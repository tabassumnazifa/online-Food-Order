
import { useNavigate } from "react-router-dom";

function RestaurantCard({
  id,
  name,
  description,
  rating,
  location,
  isSuspended,
  suspensionReason,
}) {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    if (isSuspended) {
      return;
    }

    navigate(`/restaurant/${id}`);
  };

  return (
    <div className="restaurant-card">
      <h2>{name}</h2>

      {isSuspended && (
        <div
          style={{
            backgroundColor: "#ffe5e5",
            color: "#d32f2f",
            padding: "8px 12px",
            borderRadius: "6px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          🔴 SUSPENDED
        </div>
      )}

      <p>{description}</p>

      <p>
        ⭐ <strong>{rating ?? 4.5}</strong>
      </p>

      <p>📍 {location}</p>

      {isSuspended && suspensionReason && (
        <p>
          <strong>Reason:</strong> {suspensionReason}
        </p>
      )}

      <button
        className="view-menu-btn"
        onClick={handleViewMenu}
        disabled={isSuspended}
      >
        {isSuspended ? "Restaurant Suspended" : "View Menu"}
      </button>
    </div>
  );
}

export default RestaurantCard;
