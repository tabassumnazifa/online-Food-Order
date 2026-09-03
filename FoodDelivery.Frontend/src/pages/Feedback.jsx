import { useEffect, useState } from "react";
import axios from "axios";

function Feedback() {
  const [restaurants, setRestaurants] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [restaurantId, setRestaurantId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRestaurants();
    fetchMyFeedback();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/all"
      );

      setRestaurants(response.data);
    } catch (err) {
      console.error("Failed to load restaurants:", err);
      setError("Failed to load restaurants.");
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5079/api/Feedback/my-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbacks(response.data);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!restaurantId) {
      setError("Please select a restaurant.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5079/api/Feedback",
        {
          restaurantId: Number(restaurantId),
          rating: Number(rating),
          comment: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Feedback submitted successfully!");

      setRestaurantId("");
      setRating(5);
      setComment("");

      fetchMyFeedback();
    } catch (err) {
      console.error("Feedback submission error:", err);

      setError(
        err.response?.data ||
          "Failed to submit feedback."
      );
    }
  };

  if (!token) {
    return (
      <div className="feedback-page">
        <h1>⭐ Feedback</h1>
        <p>Please login to submit feedback.</p>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <h1>⭐ Restaurant Feedback</h1>

      {/* Submit Feedback */}
      <div className="feedback-card">
        <h2>Leave Feedback</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Restaurant</label>

            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              <option value="">Select a restaurant</option>

              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Rating</label>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">⭐⭐⭐⭐⭐ 5</option>
              <option value="4">⭐⭐⭐⭐ 4</option>
              <option value="3">⭐⭐⭐ 3</option>
              <option value="2">⭐⭐ 2</option>
              <option value="1">⭐ 1</option>
            </select>
          </div>

          <div>
            <label>Comment</label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Write your feedback..."
              rows="4"
            />
          </div>

          <button type="submit">
            Submit Feedback
          </button>
        </form>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </div>

      {/* My Feedback */}
      <div className="feedback-card">
        <h2>My Feedback</h2>

        {loading ? (
          <p>Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p>You haven't submitted any feedback yet.</p>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.feedbackId}>
              <h3>{feedback.restaurantName}</h3>

              <p>
                {"⭐".repeat(feedback.rating)}
              </p>

              <p>{feedback.comment}</p>

              <small>
                {new Date(feedback.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Feedback;