import { useState } from "react";
import axios from "axios";

function CreateOffer() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Please login as a restaurant owner.");
      return;
    }

    if (
      !title ||
      !couponCode ||
      !discountPercentage ||
      !startDate ||
      !endDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      Number(discountPercentage) <= 0 ||
      Number(discountPercentage) > 100
    ) {
      setError("Discount percentage must be between 1 and 100.");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5079/api/Offer/create",
        {
          title,
          description,
          couponCode,
          discountPercentage: Number(discountPercentage),
          maximumDiscount:
            maximumDiscount === ""
              ? null
              : Number(maximumDiscount),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Offer created successfully!");

      setTitle("");
      setDescription("");
      setCouponCode("");
      setDiscountPercentage("");
      setMaximumDiscount("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("Create offer error:", err);

      const errorMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Failed to create offer.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-offer-page">
      <div className="create-offer-container">

        {/* PAGE HEADER */}
        <section className="create-offer-header">
          <div>
            <span className="create-offer-eyebrow">
              PROMOTIONS
            </span>

            <h1>Create New Offer</h1>

            <p>
              Create an attractive discount offer and give your
              customers another reason to order from your restaurant.
            </p>
          </div>

          <div className="create-offer-header-icon">
            🎁
          </div>
        </section>

        {/* FORM CARD */}
        <section className="create-offer-card">

          <div className="create-offer-card-header">
            <div>
              <span className="create-offer-section-label">
                OFFER DETAILS
              </span>

              <h2>Promotion Information</h2>

              <p>
                Enter the details of your offer below.
              </p>
            </div>

            <div className="create-offer-gift-icon">
              ✨
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* BASIC INFORMATION */}
            <div className="create-offer-form-section">
              <div className="create-offer-section-title">
                <span>01</span>

                <div>
                  <h3>Basic Information</h3>
                  <p>
                    Give your promotion a clear and attractive identity.
                  </p>
                </div>
              </div>

              <div className="create-offer-form-grid">

                <div className="create-offer-field full-width">
                  <label>
                    Offer Title <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. Weekend Pizza Offer"
                  />

                  <small>
                    Choose a short title customers can easily understand.
                  </small>
                </div>

                <div className="create-offer-field full-width">
                  <label>Description</label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Describe your offer and what customers can enjoy..."
                    rows="4"
                  />

                  <small>
                    Explain the promotion, eligibility, or special conditions.
                  </small>
                </div>

              </div>
            </div>

            {/* DISCOUNT INFORMATION */}
            <div className="create-offer-form-section">

              <div className="create-offer-section-title">
                <span>02</span>

                <div>
                  <h3>Discount Settings</h3>
                  <p>
                    Configure how much customers can save.
                  </p>
                </div>
              </div>

              <div className="create-offer-form-grid">

                <div className="create-offer-field">
                  <label>
                    Coupon Code <span>*</span>
                  </label>

                  <div className="create-offer-input-with-icon">
                    <span>🏷️</span>

                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="e.g. PIZZA20"
                    />
                  </div>

                  <small>
                    Customers will use this code at checkout.
                  </small>
                </div>

                <div className="create-offer-field">
                  <label>
                    Discount Percentage <span>*</span>
                  </label>

                  <div className="create-offer-input-with-suffix">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) =>
                        setDiscountPercentage(e.target.value)
                      }
                      placeholder="20"
                    />

                    <span>%</span>
                  </div>

                  <small>
                    Enter a value between 1% and 100%.
                  </small>
                </div>

                <div className="create-offer-field">
                  <label>Maximum Discount</label>

                  <div className="create-offer-input-with-suffix">
                    <span className="currency-prefix">৳</span>

                    <input
                      type="number"
                      min="0"
                      value={maximumDiscount}
                      onChange={(e) =>
                        setMaximumDiscount(e.target.value)
                      }
                      placeholder="500"
                    />
                  </div>

                  <small>
                    Leave empty if there is no maximum limit.
                  </small>
                </div>

              </div>
            </div>

            {/* DATE INFORMATION */}
            <div className="create-offer-form-section">

              <div className="create-offer-section-title">
                <span>03</span>

                <div>
                  <h3>Offer Duration</h3>
                  <p>
                    Set when your promotion starts and ends.
                  </p>
                </div>
              </div>

              <div className="create-offer-form-grid">

                <div className="create-offer-field">
                  <label>
                    Start Date & Time <span>*</span>
                  </label>

                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                  />
                </div>

                <div className="create-offer-field">
                  <label>
                    End Date & Time <span>*</span>
                  </label>

                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(e.target.value)
                    }
                  />
                </div>

              </div>
            </div>

            {/* MESSAGES */}
            {message && (
              <div className="create-offer-success">
                <div>✓</div>

                <div>
                  <strong>Offer Created</strong>
                  <p>{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="create-offer-error">
                <div>!</div>

                <div>
                  <strong>Unable to Create Offer</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="create-offer-actions">

              <button
                type="button"
                className="create-offer-cancel-btn"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setCouponCode("");
                  setDiscountPercentage("");
                  setMaximumDiscount("");
                  setStartDate("");
                  setEndDate("");
                  setMessage("");
                  setError("");
                }}
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="create-offer-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="create-offer-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>🎁</span>
                    Create Offer
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </form>
        </section>

        {/* FOOTER NOTE */}
        <div className="create-offer-note">
          <span>💡</span>

          <p>
            <strong>Tip:</strong> Attractive offers with clear coupon
            codes and reasonable discounts can help increase customer
            engagement and repeat orders.
          </p>
        </div>

      </div>
    </main>
  );
}

export default CreateOffer;