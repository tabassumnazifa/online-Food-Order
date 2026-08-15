import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // REGISTER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Check role
    if (!formData.role) {
      alert("Please select an account type.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5079/api/Auth/register",
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      console.log(
        "Registration successful:",
        response.data
      );

      alert(
        response.data?.message ||
          "Registration successful! Please verify your email."
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      const data = error.response?.data;

      let message =
        "Registration failed. Please try again.";

      if (typeof data === "string") {
        message = data;
      } 
      else if (data?.message) {
        message = data.message;
      } 
      else if (data?.errors) {
        const validationErrors =
          Object.values(data.errors)
            .flat()
            .join("\n");

        message = validationErrors;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="login-header">

          <h1>🍔 Food Delivery</h1>

          <p>
            Create your account
          </p>

        </div>


        {/* ========================= */}
        {/* REGISTRATION FORM */}
        {/* ========================= */}

        <form
          onSubmit={handleSubmit}
          className="login-form"
          autoComplete="off"
        >

          {/* Full Name */}
          <label htmlFor="fullName">
            Full Name
          </label>

          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />


          {/* Email */}
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />


          {/* ========================= */}
          {/* ROLE */}
          {/* ========================= */}

          <label htmlFor="role">
            Account Type
          </label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >

            <option value="Customer">
              Customer
            </option>

            <option value="RestaurantOwner">
              Restaurant Owner
            </option>

            <option value="DeliveryRider">
              Delivery Rider
            </option>

          </select>


          {/* Password */}
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />


          {/* Confirm Password */}
          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />


          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

        </form>


        {/* ========================= */}
        {/* LOGIN LINK */}
        {/* ========================= */}

        <div className="login-footer">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;