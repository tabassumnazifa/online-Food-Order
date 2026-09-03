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

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Please login as a restaurant owner.");
      return;
    }

    if (!title || !couponCode || !discountPercentage || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
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

      setError(
        err.response?.data ||
          "Failed to create offer."
      );
    }
  };

  return (
    <div className="create-offer-page">
      <h1>🎁 Create Offer</h1>

      <div className="offer-card">
        <form onSubmit={handleSubmit}>

          <div>
            <label>Offer Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Pizza Offer"
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your offer..."
              rows="4"
            />
          </div>

          <div>
            <label>Coupon Code *</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. PIZZA20"
            />
          </div>

          <div>
            <label>Discount Percentage *</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="20"
            />
          </div>

          <div>
            <label>Maximum Discount</label>
            <input
              type="number"
              min="0"
              value={maximumDiscount}
              onChange={(e) => setMaximumDiscount(e.target.value)}
              placeholder="500"
            />
          </div>

          <div>
            <label>Start Date *</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>End Date *</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button type="submit">
            🎁 Create Offer
          </button>
        </form>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

export default CreateOffer;
