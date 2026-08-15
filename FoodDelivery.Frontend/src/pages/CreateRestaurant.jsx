import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateRestaurant() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login as a Restaurant Owner.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5079/api/Restaurant/create",
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Restaurant created:",
        response.data
      );

      alert(
        response.data?.message ||
          "Restaurant created successfully."
      );

      navigate("/restaurant/dashboard");

    } catch (error) {
      console.error(
        "Create Restaurant Error:",
        error
      );

      const data = error.response?.data;

      let message =
        "Failed to create restaurant.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">

          <h1>
            🍔 Create Your Restaurant
          </h1>

          <p>
            Set up your restaurant profile
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          {/* Restaurant Name */}

          <label htmlFor="name">
            Restaurant Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter restaurant name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Description */}

          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            placeholder="Describe your restaurant"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />

          {/* Address */}

          <label htmlFor="address">
            Address
          </label>

          <input
            id="address"
            type="text"
            name="address"
            placeholder="Enter restaurant address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          {/* Phone */}

          <label htmlFor="phone">
            Phone
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="Enter restaurant phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Restaurant..."
              : "➕ Create Restaurant"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateRestaurant;