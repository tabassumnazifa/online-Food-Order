import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Feedback() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [restaurantId, setRestaurantId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

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

    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        "http://localhost:5079/api/Feedback",
        {
          restaurantId: Number(restaurantId),
          rating: Number(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Your feedback has been submitted successfully!");

      setRestaurantId("");
      setRating(5);
      setComment("");

      await fetchMyFeedback();
    } catch (err) {
      console.error("Feedback submission error:", err);

      setError(
        err.response?.data ||
          "Failed to submit feedback."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    return "★".repeat(Number(value));
  };

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (sum, feedback) =>
              sum + Number(feedback.rating || 0),
            0
          ) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  /* NOT LOGGED IN */
  if (!token) {
    return (
      <main className="customer-feedback-page">
        <div className="customer-feedback-container">

          <div className="customer-feedback-empty">
            <div className="customer-feedback-empty-icon">
              🔐
            </div>

            <span className="customer-page-eyebrow">
              CUSTOMER FEEDBACK
            </span>

            <h1>Login to share your experience</h1>

            <p>
              Please sign in to submit feedback and view
              the reviews you have shared.
            </p>

            <button
              className="customer-primary-btn"
              onClick={() => navigate("/login")}
            >
              Login to Continue
            </button>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="customer-feedback-page">
      <div className="customer-feedback-container">

        {/* PAGE HEADER */}
        <section className="customer-page-header feedback-header">
          <div>
            <span className="customer-page-eyebrow">
              YOUR EXPERIENCE MATTERS
            </span>

            <h1>Restaurant Feedback</h1>

            <p>
              Share your experience and help us make
              your next meal even better.
            </p>
          </div>

          <div className="feedback-header-rating">
            <span>⭐</span>

            <div>
              <strong>{averageRating}</strong>
              <small>
                {feedbacks.length === 1
                  ? "1 review"
                  : `${feedbacks.length} reviews`}
              </small>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div className="feedback-layout">

          {/* LEFT — SUBMIT FORM */}
          <section className="feedback-form-card">

            <div className="feedback-card-heading">
              <div className="feedback-heading-icon">
                ✍️
              </div>

              <div>
                <span>SHARE YOUR THOUGHTS</span>
                <h2>Leave Feedback</h2>
              </div>
            </div>

            <p className="feedback-form-intro">
              Tell us about your experience with a
              restaurant. Your feedback helps other
              customers too.
            </p>

            <form onSubmit={handleSubmit}>

              {/* RESTAURANT */}
              <div className="feedback-form-group">

                <label htmlFor="restaurant">
                  Restaurant
                </label>

                <select
                  id="restaurant"
                  value={restaurantId}
                  onChange={(e) =>
                    setRestaurantId(e.target.value)
                  }
                >
                  <option value="">
                    Select a restaurant
                  </option>

                  {restaurants.map((restaurant) => (
                    <option
                      key={restaurant.id}
                      value={restaurant.id}
                    >
                      {restaurant.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* RATING */}
              <div className="feedback-form-group">

                <label>
                  How would you rate your experience?
                </label>

                <div className="feedback-rating-options">

                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        Number(rating) === value
                          ? "feedback-rating-option active"
                          : "feedback-rating-option"
                      }
                      onClick={() => setRating(value)}
                    >
                      <span>
                        {"★".repeat(value)}
                      </span>

                      <small>{value}/5</small>
                    </button>
                  ))}

                </div>

              </div>

              {/* COMMENT */}
              <div className="feedback-form-group">

                <div className="feedback-label-row">
                  <label htmlFor="comment">
                    Your comment
                  </label>

                  <span>
                    {comment.length}/500
                  </span>
                </div>

                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  maxLength={500}
                  placeholder="Tell us what you liked, what could be improved, or simply share your experience..."
                  rows="6"
                />

              </div>

              {/* MESSAGE */}
              {message && (
                <div className="feedback-success-message">
                  <span>✓</span>
                  {message}
                </div>
              )}

              {error && (
                <div className="feedback-error-message">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                className="feedback-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="feedback-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

          </section>

          {/* RIGHT — MY FEEDBACK */}
          <section className="feedback-history-card">

            <div className="feedback-history-heading">

              <div>
                <span className="customer-page-eyebrow">
                  YOUR REVIEWS
                </span>

                <h2>My Feedback</h2>
              </div>

              <div className="feedback-count">
                {feedbacks.length}
              </div>

            </div>

            {loading ? (
              <div className="feedback-loading">
                <div className="feedback-spinner-large"></div>

                <p>Loading your feedback...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="feedback-no-reviews">

                <div className="feedback-no-reviews-icon">
                  💬
                </div>

                <h3>No feedback yet</h3>

                <p>
                  Your restaurant reviews will appear
                  here after you submit them.
                </p>

              </div>
            ) : (
              <div className="feedback-list">

                {feedbacks.map((feedback) => (
                  <article
                    className="feedback-review-card"
                    key={feedback.feedbackId}
                  >

                    <div className="feedback-review-top">

                      <div className="feedback-restaurant-icon">
                        🏪
                      </div>

                      <div className="feedback-restaurant-info">
                        <h3>
                          {feedback.restaurantName}
                        </h3>

                        <small>
                          {feedback.createdAt
                            ? new Date(
                                feedback.createdAt
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Date unavailable"}
                        </small>
                      </div>

                    </div>

                    <div className="feedback-stars">
                      <span>
                        {renderStars(feedback.rating)}
                      </span>

                      <small>
                        {feedback.rating}/5
                      </small>
                    </div>

                    <p className="feedback-review-comment">
                      {feedback.comment}
                    </p>

                    <div className="feedback-review-footer">
                      <span>Verified feedback</span>
                      <span>✓</span>
                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>

        </div>

      </div>
    </main>
  );
}

export default Feedback;