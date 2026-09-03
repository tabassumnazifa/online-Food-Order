import { useEffect, useState } from "react";
import axios from "axios";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Offer/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOffers(response.data);
    } catch (err) {
      console.error("Failed to load offers:", err);

      if (err.response?.status === 401) {
        setError("Please login to view available offers.");
      } else if (err.response?.status === 403) {
        setError("Only customers can view offers.");
      } else {
        setError("Failed to load offers.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="offers-page">
        <h1>🎁 Offers</h1>
        <p>Please login to view available offers.</p>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <h1>🎁 Available Offers</h1>

      {loading && <p>Loading offers...</p>}

      {!loading && error && <p>{error}</p>}

      {!loading && !error && offers.length === 0 && (
        <p>No active offers available right now.</p>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="offers-container">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.id}>
              <h2>{offer.title}</h2>

              <p>
                <strong>{offer.restaurantName}</strong>
              </p>

              {offer.description && (
                <p>{offer.description}</p>
              )}

              <h3>
                🎉 {offer.discountPercentage}% OFF
              </h3>

              {offer.maximumDiscount !== null && (
                <p>
                  Maximum discount: ৳{offer.maximumDiscount}
                </p>
              )}

              <div className="coupon-box">
                <span>Coupon Code:</span>
                <strong>{offer.couponCode}</strong>
              </div>

              <p>
                Valid from{" "}
                {new Date(offer.startDate).toLocaleDateString()}
                {" "}to{" "}
                {new Date(offer.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Offers;