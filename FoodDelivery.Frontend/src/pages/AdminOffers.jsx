
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminOffers() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    couponCode: "",
    discountPercentage: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Offer/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOffers(response.data);
    } catch (error) {
      console.error("Admin Offers Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (
      !form.title ||
      !form.couponCode ||
      !form.discountPercentage ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      new Date(form.endDate) <=
      new Date(form.startDate)
    ) {
      alert("End date must be after start date.");
      return;
    }

    try {
      setCreating(true);

      const data = {
        title: form.title,
        description: form.description,
        couponCode: form.couponCode,
        discountPercentage: Number(
          form.discountPercentage
        ),
        maximumDiscount: form.maximumDiscount
          ? Number(form.maximumDiscount)
          : null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      await axios.post(
        "http://localhost:5079/api/Offer/admin/create",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Super Offer created successfully.");

      setForm({
        title: "",
        description: "",
        couponCode: "",
        discountPercentage: "",
        maximumDiscount: "",
        startDate: "",
        endDate: "",
      });

      fetchOffers();
    } catch (error) {
      console.error("Create Super Offer Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to create Super Offer."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (offer) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${offer.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5079/api/Offer/admin/delete/${offer.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Offer removed successfully.");

      fetchOffers();
    } catch (error) {
      console.error("Delete Offer Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to remove offer."
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>🎁 Super Offers</h1>
          <p>Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>🎁 Super Offers</h1>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-page"
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>🎁 Super Offers</h1>

          <p style={{ color: "#666" }}>
            Create and manage system-wide promotional offers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* =========================
          CREATE SUPER OFFER
      ========================= */}

      <div
        className="dashboard-card"
        style={{ marginBottom: "35px" }}
      >
        <h2>➕ Create Super Offer</h2>

        <p style={{ color: "#666" }}>
          This offer will be available across the entire
          platform.
        </p>

        <form onSubmit={handleCreate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <label>
                <strong>Offer Title *</strong>
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Eid Special Offer"
                required
              />
            </div>

            <div>
              <label>
                <strong>Coupon Code *</strong>
              </label>

              <input
                type="text"
                name="couponCode"
                value={form.couponCode}
                onChange={handleChange}
                placeholder="e.g. EID30"
                required
              />
            </div>

            <div>
              <label>
                <strong>Discount Percentage *</strong>
              </label>

              <input
                type="number"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                placeholder="e.g. 20"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <label>
                <strong>Maximum Discount</strong>
              </label>

              <input
                type="number"
                name="maximumDiscount"
                value={form.maximumDiscount}
                onChange={handleChange}
                placeholder="e.g. 500"
                min="0"
              />
            </div>

            <div>
              <label>
                <strong>Start Date *</strong>
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>
                <strong>End Date *</strong>
              </label>

              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>
              <strong>Description</strong>
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the promotion..."
              rows="4"
              style={{
                width: "100%",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            style={{ marginTop: "20px" }}
          >
            {creating
              ? "Creating..."
              : "🎁 Create Super Offer"}
          </button>
        </form>
      </div>

      {/* =========================
          EXISTING OFFERS
      ========================= */}

      <div
        className="dashboard-card"
        style={{ marginBottom: "25px" }}
      >
        <h2>📊 Offer Overview</h2>

        <p>
          <strong>Total Offers:</strong> {offers.length}
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="dashboard-card">
          <h2>🎁 No Offers</h2>

          <p>
            There are currently no offers in the system.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {offers.map((offer) => (
            <div
              className="dashboard-card"
              key={offer.id}
            >
              <h2>🎁 {offer.title}</h2>

              <p>
                <strong>Type:</strong>{" "}
                {offer.restaurantId == null
                  ? "🌐 Platform Offer"
                  : "🏪 Restaurant Offer"}
              </p>

              <p>
                <strong>Restaurant:</strong>{" "}
                {offer.restaurantName ||
                  "Platform Offer"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {offer.description || "N/A"}
              </p>

              <p>
                <strong>Coupon:</strong>{" "}
                {offer.couponCode || "N/A"}
              </p>

              <p>
                <strong>Discount:</strong>{" "}
                {offer.discountPercentage ?? 0}%
              </p>

              <p>
                <strong>Maximum Discount:</strong>{" "}
                ৳{offer.maximumDiscount ?? 0}
              </p>

              <p>
                <strong>Start:</strong>{" "}
                {offer.startDate
                  ? new Date(
                      offer.startDate
                    ).toLocaleString()
                  : "N/A"}
              </p>

              <p>
                <strong>End:</strong>{" "}
                {offer.endDate
                  ? new Date(
                      offer.endDate
                    ).toLocaleString()
                  : "N/A"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {offer.isActive
                  ? "🟢 Active"
                  : "🔴 Inactive"}
              </p>

              <button
                type="button"
                onClick={() => handleDelete(offer)}
                style={{
                  marginTop: "15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                }}
              >
                🗑️ Remove Offer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOffers;
